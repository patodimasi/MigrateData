const fs = require('fs');
const path = require('path');
const readline = require('readline');

/*
Script para la entidad Producto tiene las tabla:
Producto, Producto_FamiliaProducto, Producto_Descripcion, Producto_TipoProducto, Producto_Asignado
Producto_Circulado, APP_ProductosImagenes, Devolucion_ProductosFueraRediaf, Reposicion,
Reposicion_EstadoReposicion, Documentos,Documentos_Tipo_Documento
*/

const filePath = path.join('C:', 'Users', 'pdimasi', 'OneDrive - S.A. La Nacion', 'Documentos', 'script_qa.sql');
const outputPath = path.join('C:', 'Users', 'pdimasi', 'OneDrive - S.A. La Nacion', 'Documentos', 'script_modifiedprod.sql');

// paso todo a minuscula y guion _ 
function convertToSnakeCase(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
}

function renameIdColumns(columns, tableName) {
   
    if ((tableName === 'Producto') || (tableName === 'Devolucion_ProductosFueraRediaf') 
    || (tableName === 'Documentos') || (tableName === 'Documentos_TipoDocumento') ) {
        return columns; 
    }
    return columns.map((col, index) => {
       // console.log("entra")
        if (index === 0 && col.startsWith('Id')) {
            return 'id'; // Renombrar a 'id' si es la primera columna
        }
        return col; // De lo contrario, conservar el nombre original
    });
}

//leo el archivo linea por linea
const rl = readline.createInterface({
    input: fs.createReadStream(filePath, { encoding: 'utf8' }),
    crlfDelay: Infinity
});

const outputStream = fs.createWriteStream(outputPath, { encoding: 'utf8' });

// Definición p.strategy
const strategies = {
    insert: (snakeTableName, snakeColumns, values) => {
        snakeTableName = snakeTableName === 'reposicion_estado_reposicions' ? 'pedido_estados' : snakeTableName;
        outputStream.write(`INSERT ${snakeTableName} (${snakeColumns}) VALUES (${values.join(', ')});\n`);
    },

    dateFilterInsert: (snakeTableName, snakeColumns, values, createdAtIndex) => {
       
        const createdAtStr = values[createdAtIndex].replace(/'/g, '');
        
        const createdAt = new Date(createdAtStr);
       
        const fechaLimite = new Date('2024-01-01');

     
        // Comparar fechas
        if (createdAt > fechaLimite) {
            
            strategies.insert(snakeTableName, snakeColumns, values);
        }
    },
    imageInsert: (snakeTableName, snakeColumns, values) => {
        snakeTableName = 'producto_imagenes';

        columns = snakeColumns.filter(col => col !== 'url').map(col => {
            return col === 'urlexterna' ? 'ubicacion' : col;
        });

        values = values.filter((_, index) => {
            return columns[index] !== undefined; // Solo mantener valores que tengan columnas correspondientes
        });

        if (columns.length === values.length) {
            strategies.insert(snakeTableName, columns, values);
        }
    },
    productInsert: (snakeTableName, snakeColumns, values) => {
        const idIndex = snakeColumns.indexOf('id');
        const jerarquiaIndex = snakeColumns.indexOf('jerarquia_producto');

        //ME fijo que exista
        const idValue = idIndex !== -1 ? values[idIndex] : null;
        const jerarquiaValue = jerarquiaIndex !== -1 ? values[jerarquiaIndex] : null;

        const skipInsert = idValue === '0' || (jerarquiaValue && (jerarquiaValue.includes('FAS') || jerarquiaValue.includes('CUP')));

        if (!skipInsert) {
            snakeColumns.push('apto_dev_rediaf');
            values.push(0);
            strategies.insert(snakeTableName, snakeColumns, values);
        }
    }
};

// Mapeo de tablas a estrategias
const tableStrategies = {
    'producto_familia_productos': strategies.insert,
    'producto_tipo_productos': strategies.insert,
    'reposicion_estado_reposicions': strategies.insert,
    'devolucion_productos_fuera_rediafs': strategies.insert,
    'producto_descripcions': strategies.dateFilterInsert,
    'producto_circulados': strategies.dateFilterInsert,
    'producto_asignados': strategies.dateFilterInsert,
    'reposicions': strategies.dateFilterInsert,
    'app_productos_imagenes': strategies.imageInsert,
    'documentos_tipo_documentos': strategies.insert,
    'documentos': strategies.dateFilterInsert,
    'productos': strategies.productInsert
    
};

rl.on('line', (line) => {
    const modifiedLine = line
        .replace(/\[dbo\]\s*\./g, '')
        .replace(/\[/g, '')
        .replace(/\]/g, '')
        .replace(/N'([^']*)'/g, "'$1'") // Reemplazo ajustado
        .replace(/CAST\(/g, '')
        .replace(/ AS DateTime\)/g, '')
        .replace(/SET IDENTITY_INSERT `.*` ON/g, '')
        .replace(/^\s*GO\s*$/gm, '')
        .replace(/USE\s+\[(.*?)\]/g, 'USE $1;')
        .replace(/(\d+\.\d+)\s+AS Decimal\(\d+,\s*\d+\)\s*\)/g, '$1')
        .replace(/CreatedAt/g, 'CreatedA')
        .replace(/CreatedBy/g, 'CreatedB')
        .replace(/UpdatedBy/g, 'UpdatedB')
        .replace(/UpdatedAt/g, 'UpdatedA')
        .replace(/UpdateAt/g, 'UpdatedA')
        .replace(/UpdateBy/g, 'UpdatedB')
        .replace(/(?<=[^' ])''(?=[^' ])/g, '');

    const match = modifiedLine.match(/INSERT\s+(\w+)\s*\(([^)]+)\)\s+VALUES\s*\((.+)\)/);

    if (match) {
        
        let tableName = match[1];
        let columns = renameIdColumns(match[2].split(',').map(col => col.trim()),tableName);     
        let values = match[3].match(/'[^']*'|[^, ]+/g).map(v => v.trim());

        
        // Paso el nombre de la tabla a miniscula y agrego 's' al final
        let snakeTableName = `${convertToSnakeCase(tableName)}${convertToSnakeCase(tableName).endsWith('s') ? '' : 's'}`;
        // Paso el nombre de las columnas en minuscula
        let snakeColumns = columns.map(col => convertToSnakeCase(col));
        
        
        const strategy = tableStrategies[snakeTableName];
        
        if (snakeTableName === 'producto_descripcions' || snakeTableName === 'producto_circulados' || 
           snakeTableName === 'producto_asignados' || snakeTableName === 'reposicions' 
           || snakeTableName === 'documentos') 
        { 
            
            const createdAtIndex = snakeColumns.findIndex(col => col.trim() === 'created_a' || col.trim() === 'fecha_documento');
            if (createdAtIndex !== -1 && createdAtIndex < values.length) {
              
                strategy(snakeTableName, snakeColumns, values, createdAtIndex);
            }
        } else if (strategy) {
            strategy(snakeTableName, snakeColumns, values);
        }
        
    }
});

rl.on('close', () => {
  
    const combinedStatement = `
    SET SQL_SAFE_UPDATES = 0;
	
    UPDATE productos p
    JOIN devolucion_productos_fuera_rediafs d ON p.id_producto_sddra = d.id_producto_sddra
    SET p.apto_dev_rediaf = 1
    WHERE p.id_producto_logistica IS NOT NULL;
    
    INSERT INTO producto_edicions(id_producto_circulado,id_producto_logistica, fecha_circulacion, edicion, descripcion,
        created_b, created_a, updated_b, updated_a, precio, flasheable, habilitado_reposicion)
    SELECT pc.id, pd.id_producto_logistica, pd.fecha_circulacion, pd.edicion, pd.descripcion, "Proceso Migrado", pc.created_a,
        "", NULL, pd.precio, pc.flasheable, pc.habilitado_reposicion
    FROM producto_descripcions pd       
    JOIN producto_circulados pc ON pd.id_producto_logistica = pc.id_producto_logistica 
    and pc.edicion = pd.edicion and pd.fecha_circulacion = pc.fecha_circulacion;
	
    INSERT INTO pedidos (
        id_producto_edicion, id_agente,cantidad_teorica,cantidad, created_b,created_a,updated_b,   
        updated_a, precio,fecha_tope_devolucion,id_carga,fecha_vencimiento_factura, cantidad_suscripcion,
        id_clase_entrega,id_estado_pedido,enviado_concentrador,id_canilla,fecha_tope_repo, repo_notificada  
        )
    SELECT  
        pe.id, pa.id_medio_de_entrega,pa.cantidad_teorica, pa.cantidad_real,'Proceso Migrado',    
        pa.created_a, '', NULL, pa.precio_unidad,pa.fecha_tope_devolucion, pa.id_carga,
        pa.fecha_vencimiento_factura,  pa.cantidad_suscripcion,pa.id_clase_entrega,NULL,NULL,NULL,NULL,NULL
        
    FROM 
        producto_edicions pe
    JOIN 
        producto_asignados pa ON pe.id_producto_circulado = pa.id_producto_circulado
        and pa.id_clase_entrega = 'QDES';
        
    INSERT INTO pedidos (
        id_producto_edicion, id_agente,cantidad_teorica,cantidad, created_b,created_a,updated_b,   
        updated_a, precio,fecha_tope_devolucion,id_carga,fecha_vencimiento_factura, cantidad_suscripcion,
        id_clase_entrega,id_estado_pedido,enviado_concentrador,id_canilla,fecha_tope_repo, repo_notificada  
        )
    
    SELECT DISTINCT
        pe.id,pa.id_medio_de_entrega, pa.cantidad_teorica, pa.cantidad_real, 'Proceso Migrado',    
        pa.created_a, '', NULL, pa.precio_unidad, pa.fecha_tope_devolucion, pa.id_carga,
        pa.fecha_vencimiento_factura, pa.cantidad_suscripcion, pa.id_clase_entrega,r.id_estado_reposicion,
        r.enviado_concentrador,r.id_canilla,r.fecha_tope_repo,r.repo_notificada
    FROM producto_asignados  pa
    JOIN reposicions r ON pa.id = r.id_producto_asignado_resultante
    JOIN producto_edicions  pe ON pa.id_producto_circulado = pe.id_producto_circulado
    WHERE  pa.id_clase_entrega = 'REP';

    INSERT INTO documento_facturas(id_documento,id_posicion,id_tipo_documento,id_documento_origen,fecha_documento,referencia_documento,
        id_clase_documento_origen,id_agente_pagador,id_agente,cantidad, precio, fecha_tope_de_devolucion,
        procesado, fecha_vencimiento_factura,nro_pedido_sap,id_producto_circulado,id_producto_edicion)
    SELECT d.id_documento,d.id_posicion,d.id_tipo_documento,d.id_documento_origen,d.fecha_documento,d.referencia_documento,
    d.id_clase_documento_origen,d.id_medio_de_entrega_pagador,d.id_medio_de_entrega,d.cantidad,d.precio, d.fecha_tope_de_devolucion,
    d.procesado,d.fecha_vencimiento_factura,d.nro_pedido_sap,d.id_producto_circulado, pe.id

    FROM producto_edicions pe      
    JOIN documentos d ON d.id_producto_circulado = pe.id_producto_circulado;	

`;

    outputStream.write(combinedStatement); // Escribir la declaración combinada
});

// Manejo de errores
rl.on('error', (err) => {
    console.error('Error al leer el archivo:', err);
});

outputStream.on('error', (err) => {
    console.error('Error al escribir el archivo:', err);
});
