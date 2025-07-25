const fs = require('fs');
const path = require('path');
const readline = require('readline');

/*
Script para la entidad Producto tiene las tabla:
Producto, Producto_FamiliaProducto, Producto_Descripcion, Producto_TipoProducto
Producto_Circulado, APP_ProductosImagenes, Devolucion_ProductosFueraRediaf,

Devuelve las talas: Producto, Producto_tipoProducto, Producto_FamiliaProducto, Producto_Edicion
*/

const filePath = path.join('C:', 'Users', 'pdimasi', 'OneDrive - S.A. La Nacion', 'Documentos', 'script_producto.sql');
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
        if(snakeTableName == 'producto_tipo_productos'){
            const idIndex = snakeColumns.indexOf('id');
            const grupoIndex = snakeColumns.indexOf('grupo_articulo');
    
            const grupoValue = values[grupoIndex];
            
            if (grupoValue.includes('FAS') || grupoValue.includes('CUP')) {
                //console.log(`Fila filtrada por jerarquia_producto: ${jerarquiaValue}`);
                return; // No continúa con el insert
            }
        }
        outputStream.write(`INSERT ${snakeTableName} (${snakeColumns}) VALUES (${values.join(', ')});\n`);
    },

    insert_familia: (snakeTableName, snakeColumns, values) => {
        const excludeColumns = ['created_by', 'created_at','update_by','update_at'];
        // Filtrar columnas y valores
        const filteredColumns = [];
        const filteredValues = [];
    
        snakeColumns.forEach((col, index) => {
            if (!excludeColumns.includes(col)) {
                filteredColumns.push(col);
                filteredValues.push(values[index]);
            }
        });
    
        // Generar y escribir la consulta con los datos filtrados
        outputStream.write(`INSERT ${snakeTableName} (${filteredColumns}) VALUES (${filteredValues.join(', ')});\n`);
    },
    
    dateFilterInsert: (snakeTableName, snakeColumns, values, createdAtIndex) => {
        if (snakeTableName === "producto_circulados") {
            
            const createdByIndex = snakeColumns.indexOf("created_by");
            if (createdByIndex !== -1 && values[createdByIndex] === "'Insert Manual'") {
                return; // No inserta
            }
        }
        const excludeColumns = ['created_by', 'created_at', 'updated_by', 'updated_at'];

        const filteredColumns = [];
        const filteredValues = [];
        
        snakeColumns.forEach((col, index) => {
            if (!excludeColumns.includes(col)) {
                filteredColumns.push(col);
                filteredValues.push(values[index]);
            }
        });

        strategies.insert(snakeTableName, filteredColumns, filteredValues);
      
    },

    imageInsert: (snakeTableName, snakeColumns, values) => {
        snakeTableName = 'productos_imagenes';
        const columns = snakeColumns.map(col => col === 'urlexterna' ? 'url_externa' : col);
        strategies.insert(snakeTableName, columns, values);
  
    },
    productInsert: (snakeTableName, snakeColumns, values) => {
   
        const idIndex = snakeColumns.indexOf('id');
        const jerarquiaIndex = snakeColumns.indexOf('jerarquia_producto');

        const jerarquiaValue = values[jerarquiaIndex];
        
        if (jerarquiaValue.includes('FAS') || jerarquiaValue.includes('CUP')) {
            //console.log(`Fila filtrada por jerarquia_producto: ${jerarquiaValue}`);
            return; // No continúa con el insert
        }

        snakeColumns = snakeColumns.map(col => 
            col === 'id_tipo_producto' ? 'tipo_producto_relacion' :
            col === 'id_familia_producto' ? 'familia_producto_relacion' :
            col
        );

        const excludeColumns = [
            'created_by',
            'created_at',
            'updated_by',
            'updated_at',
        ];
    
        // Filtrar columnas y valores
        const filteredColumns = [];
        const filteredValues = [];
    
        snakeColumns.forEach((col, index) => {
            if (!excludeColumns.includes(col)) {
                filteredColumns.push(col);
                filteredValues.push(values[index]);
            }
        });
    
        // Agregar la nueva columna
        filteredColumns.push('apto_devolucion_rediaf');
        filteredValues.push(0);
    
        // Insertar con los datos filtrados
        strategies.insert(snakeTableName, filteredColumns, filteredValues);
     
    }
};

// Mapeo de tablas a estrategias
const tableStrategies = {
    'producto_familia_productos': strategies.insert_familia,
    'producto_tipo_productos': strategies.insert,
    'producto_descripciones': strategies.dateFilterInsert,
    'producto_circulados': strategies.dateFilterInsert,
    'app_productos_imagenes': strategies.imageInsert,
    'productos': strategies.productInsert,
    'devolucion_productos_fuera_rediafs': strategies.insert,
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
        .replace(/(?<=[^' ])''(?=[^' ])/g, '')
        .replace(/https:\/\/sgdiwebapi\.lanacion\.com\.ar\/Imagenes\//g, 'https://dev-media-admin-circulacion.glanacion.com/media-folder/imagenes/');
        
        
    const match = modifiedLine.match(/INSERT\s+(\w+)\s*\(([^)]+)\)\s+VALUES\s*\((.+)\)/);
    
    if (match) {
        
        let tableName = match[1];
        let columns = renameIdColumns(match[2].split(',').map(col => col.trim()),tableName);     
        let values = match[3].match(/'[^']*'|[^, ]+/g).map(v => v.trim());

        // Paso el nombre de la tabla a miniscula y agrego 's' al final
        let snakeTableName = `${convertToSnakeCase(tableName)}${convertToSnakeCase(tableName).endsWith('s') ? '' : 's'}`;
        // Paso el nombre de las columnas en minuscula

        if (snakeTableName == 'producto_descripcions'){
            snakeTableName = 'producto_descripciones'
        }

        let snakeColumns = columns.map(col => convertToSnakeCase(col));
        
        const strategy = tableStrategies[snakeTableName];
    
        if (snakeTableName === 'producto_descripciones' || snakeTableName === 'producto_circulados')  
          
        { 
            const createdAtIndex = snakeColumns.findIndex(col => col.trim() === 'created_at');
           
            if (createdAtIndex !== -1) {
              
                strategy(snakeTableName, snakeColumns, values, createdAtIndex);
            }
        } 
        else if (strategy) {
            strategy(snakeTableName, snakeColumns, values);
        }
        
    }
});

rl.on('close', () => {
  
    const combinedStatement = `
   SET SQL_SAFE_UPDATES = 0;
	
    UPDATE productos p
    JOIN devolucion_productos_fuera_rediafs d ON p.id_producto_sddra = d.id_producto_sddra
    SET p.apto_devolucion_rediaf= 1
    WHERE p.id_producto_logistica IS NOT NULL;
    
  
   	INSERT INTO producto_ediciones(id_producto,id_producto_logistica, fecha_circulacion, edicion, descripcion,
         precio, habilitado_reposicion,texto_comercial,periodicidad,recirculacion,canal,habilitado_vta_en_firme,qty)
    SELECT NULL, pd.id_producto_logistica, pd.fecha_circulacion, pd.edicion, pd.descripcion, pd.precio, 
         pc.habilitado_reposicion,pd.texto_comercial,NULL,0,null,0,1000
    FROM producto_descripciones pd       
    JOIN producto_circulados pc ON pd.id_producto_logistica = pc.id_producto_logistica and pc.edicion = pd.edicion and pd.fecha_circulacion = pc.fecha_circulacion;
	
	
	INSERT INTO producto_ediciones(id_producto,id_producto_logistica, fecha_circulacion, edicion, descripcion,
         precio, habilitado_reposicion,texto_comercial,periodicidad,recirculacion,canal,habilitado_vta_en_firme,qty)
    SELECT NULL, pd.id_producto_logistica, pd.fecha_circulacion, pd.edicion, pd.descripcion, pd.precio, 
         0,pd.texto_comercial,NULL,0,null,0,1000
    FROM producto_descripciones pd       
    where pd.fecha_circulacion > CURDATE()
	AND EXISTS (
    SELECT 1
    FROM producto_descripciones AS pd_inner
    WHERE pd_inner.id_producto_logistica = pd.id_producto_logistica
      AND pd_inner.edicion = pd.edicion
      AND pd_inner.fecha_circulacion > CURDATE()
    GROUP BY pd_inner.id_producto_logistica, pd_inner.edicion
    HAVING pd.Id = MAX(pd_inner.Id)
  );
	
   
    insert into productos_id_tipo_producto_links(producto_id,producto_tipo_producto_id)
        select p.id, producto_tipo_productos.id
        from productos p
        join producto_tipo_productos ON p.tipo_producto_relacion = producto_tipo_productos.id;
	
    insert into productos_id_familia_productos_links(producto_id,producto_familia_producto_id)
        select p.id, producto_familia_productos.id
        from productos p
        join producto_familia_productos ON p.familia_producto_relacion = producto_familia_productos.id;
 	
    UPDATE productos_imagenes
    SET published_at = now();

    UPDATE productos
    SET published_at = now();

    UPDATE producto_ediciones
    SET published_at = now();

    UPDATE producto_tipo_productos
    SET published_at = now();

    UPDATE producto_familia_productos
    SET published_at = now();
    

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