const fs = require('fs');
const path = require('path');
const readline = require('readline');

/*Script para generar la tabla de pedidos y pedido_estados.
Contiene las siguientes tablas de sql: Reposicion, Producto_Asignado,Reposicion_EstadoReposicion, Producto_Circulado

Quedaron las siguientes tablas: pedidos, pedido_estados*/
const filePath = path.join('C:', 'Users', 'pdimasi', 'OneDrive - S.A. La Nacion', 'Documentos', 'script_pedido.sql');
const outputPath = path.join('C:', 'Users', 'pdimasi', 'OneDrive - S.A. La Nacion', 'Documentos', 'script_modifpedido.sql');

const outputStream = fs.createWriteStream(outputPath, { encoding: 'utf8' });

let pedidoEstadoCreadoInsertado = false;
// uso este estado ya que creo id = 1, y todos los demas valores se tienen que desplazar
//let nextEstadoId = 2;

const rl = readline.createInterface({
    input: fs.createReadStream(filePath, { encoding: 'utf8' }),
    crlfDelay: Infinity
});

function convertToSnakeCase(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
}


const handleProductoCirculado = (tableName, columns, values) => {
    const excludeColumns = [
       // 'IdProductoCirculado',
        'CreatedBy',
       // 'CreatedAt',
        'UpdatedBy',
        'UpdatedAt',
        'Flasheable',
        'IdCarga',
        'HabilitadoReposicion'
        //'IdProductoLogistica',
        //'Edicion'
    ];

    // Buscar índice de la columna CreadoFecha
    const fechaIndex = columns.indexOf('CreatedAt');
    if (fechaIndex === -1) return; // si no existe, no hacemos nada

    // Normalizar valor de fecha
    const creadoFechaStr = String(values[fechaIndex]).replace(/'/g, '');
    //const creadoFechaStr = values[fechaIndex].replace(/'/g, '');
    const creadoFecha = new Date(creadoFechaStr);
    const fechaLimite = new Date('2025-01-01');
   //console.log("entra1")
 //   console.log("entra 1")
    // Solo si pasa el filtro de fecha
    if (creadoFecha >= fechaLimite) {
        const filteredColumns = [];
        const filteredValues = [];

        columns.forEach((col, index) => {
            
            if (!excludeColumns.includes(col)) {
                // renombrar IdProductoAsignado -> id
                if (col === 'IdProductoCirculado') {
                    newCol = 'id';
                } else if (col === 'CreatedAt') {
                    newCol = 'creado'; // 👈 aquí renombramos
                } else {
                    newCol = convertToSnakeCase(col);
                }

                
                filteredColumns.push(newCol);
                filteredValues.push(values[index]);
            }
        });
        //console.log("entra 2")
        outputStream.write(
            `INSERT INTO temp_producto_circulados (${filteredColumns.join(', ')}) VALUES (${filteredValues.join(', ')});\n`
        );
    }
}

const handleProductoAsignado = (tableName, columns, values) => {
    
    const excludeColumns = [
        'CreatedBy',
        'UpdatedBy',
        'UpdatedAt',
        'IdCarga',
        'FechaEntrega',
        'FechaVencimientoFactura',
        'CantidadSuscripcion'
    ];

    // Buscar índice de la columna CreadoFecha
    const fechaIndex = columns.indexOf('CreatedAt');
    if (fechaIndex === -1) return; // si no existe, no hacemos nada

    // Normalizar valor de fecha
    const creadoFechaStr = String(values[fechaIndex]).replace(/'/g, '');
    //const creadoFechaStr = values[fechaIndex].replace(/'/g, '');
    const creadoFecha = new Date(creadoFechaStr);
    const fechaLimite = new Date('2025-01-01');
   //console.log("entra1")
 //   console.log("entra 1")
    // Solo si pasa el filtro de fecha
    if (creadoFecha >= fechaLimite) {
        const filteredColumns = [];
        const filteredValues = [];

        columns.forEach((col, index) => {
            
            if (!excludeColumns.includes(col)) {
                // renombrar IdProductoAsignado -> id
                

                if (col === 'IdProductoAsignado') {
                    newCol = 'id';
                } else if (col === 'CreatedAt') {
                    newCol = 'creado'; // 👈 aquí renombramos
                } else {
                    newCol = convertToSnakeCase(col);
                }

                filteredColumns.push(newCol);
                filteredValues.push(values[index]);
            }
        });
        //console.log("entra 2")
        outputStream.write(
            `INSERT INTO temp_producto_asignados (${filteredColumns.join(', ')}) VALUES (${filteredValues.join(', ')});\n`
        );
    }
};


const handleReposicion = (tableName, columns, values) => {
     
    const excludeColumns = [
        'CreatedBy',
        'UpdatedBy',
        'UpdatedAt',
        'EnviadoConcentrador',
        'FechaEnvioConcentrador',
        'FechaTopeRepo',
        'Precio',
        'RepoNotificada',

       
    ];

    // Buscar índice de la columna CreadoFecha
    const fechaIndex = columns.indexOf('CreatedAt');
    if (fechaIndex === -1) return; // si no existe, no hacemos nada

    // Normalizar valor de fecha
    const creadoFechaStr = String(values[fechaIndex]).replace(/'/g, '');
    //const creadoFechaStr = values[fechaIndex].replace(/'/g, '');
    const creadoFecha = new Date(creadoFechaStr);
    const fechaLimite = new Date('2025-01-01');
   //console.log("entra1")
 //   console.log("entra 1")
    // Solo si pasa el filtro de fecha
    if (creadoFecha >= fechaLimite) {
        const filteredColumns = [];
        const filteredValues = [];

        columns.forEach((col, index) => {
            
            if (!excludeColumns.includes(col)) {
                // renombrar IdProductoAsignado -> id
                if (col === 'IdReposicion') {
                    newCol = 'id';
                } else if (col === 'CreatedAt') {
                    newCol = 'creado'; 
                } else {
                    newCol = convertToSnakeCase(col);
                }
                filteredColumns.push(newCol);
                filteredValues.push(values[index]);
            }
        });
        //console.log("entra a las repos")
        outputStream.write(
            `INSERT INTO temp_reposicions (${filteredColumns.join(', ')}) VALUES (${filteredValues.join(', ')});\n`
        );
    }
}

const handleReposcionEstado = (tableName, columns, values) => {
   
}

const tableHandlers = {
    'Producto_Circulado': handleProductoCirculado,
    'Producto_Asignado': handleProductoAsignado,
    'Reposicion': handleReposicion,
    'Reposcion_Estado': handleReposcionEstado
};

rl.on('line', (line) => {
    
    const modifiedLine = line
        .replace(/\[dbo\]\s*\./g, '')      // Elimina [dbo].
        .replace(/\[/g, '')               // Elimina corchetes de apertura.
        .replace(/\]/g, '')               // Elimina corchetes de cierre.
        .replace(/N'([^']*)'/g, "'$1'")   // Elimina el prefijo N en strings.
        .replace(/CAST\(/g, '')           // Elimina CAST(.
        .replace(/ AS DateTime\)/g, '')   // Elimina AS DateTime).
        .replace(/^SET IDENTITY_INSERT\s+\S+\s+(ON|OFF)\s*;?/gm, '')
        .replace(/^\s*GO\s*$/gm, '')      // Elimina líneas que solo contengan GO.
        .replace(/USE\s+\[(.*?)\]/g, 'USE $1;') // Corrige la sintaxis de USE.
        .replace(/(\d+\.\d+)\s+AS Decimal\(\d+,\s*\d+\)\s*\)/g, '$1') // Corrige decimales.
        .replace(/(?<=[^' ])''(?=[^' ])/g, ''); // Corrige dobles comillas en SQL.

    const match = modifiedLine.match(/INSERT\s+(\w+)\s*\(([^)]+)\)\s+VALUES\s*\((.+)\)/);

    if (match) {
        let tableName = match[1];
        let columns = match[2].split(',').map(col => col.trim());  // CORREGIDO
        let values = match[3].match(/'[^']*'|[^, ]+/g).map(v => v.trim());

        const handler = tableHandlers[tableName];
        if (handler) {
            handler(tableName, columns, values);  
        } 
    }
    
});

rl.on('close', () => {
   
    const combinedStatement = `
    SET SQL_SAFE_UPDATES = 0;

    INSERT INTO pedidos (
       fecha_circulacion, id_agente_temp,precio, fecha_tope_devolucion, clase_entrega, recargo_interior_aplicado, 
       descuento_comercial_aplicado, condicion_pago_aplicada, cantidad_solicitada, cantidad_despachada, id_pedido_sap, id_producto_logistica_tmp, edicion_tmp,
       estado_tmp,id_canilla_temp
        )
    SELECT  
        pc.fecha_circulacion, pa.id_medio_de_entrega, pa.precio_unidad, pa.fecha_tope_devolucion,'ASG', 
        null, null, null, pa.cantidad_teorica, pa.cantidad_real, null, pc.id_producto_logistica, pc.edicion, null, null 
		
    FROM 
        temp_producto_circulados pc
        
   JOIN temp_producto_asignados pa on (
        pa.id_producto_circulado = pc.id and 
        pa.id_clase_entrega = 'QDES');	
  
    
	
	INSERT INTO pedidos (
        fecha_circulacion, id_agente_temp,precio, fecha_tope_devolucion, clase_entrega, recargo_interior_aplicado, 
        descuento_comercial_aplicado, condicion_pago_aplicada, cantidad_solicitada, cantidad_despachada, id_pedido_sap, id_producto_logistica_tmp, edicion_tmp,
        estado_tmp,id_canilla_temp
        )

    SELECT  
       pc.fecha_circulacion, pa.id_medio_de_entrega, pa.precio_unidad, pa.fecha_tope_devolucion, 'VFIR', 
       null, null, null, pa.cantidad_teorica, pa.cantidad_real, null,  pc.id_producto_logistica, pc.edicion, r.id_estado_reposicion, r.id_canilla

    FROM temp_producto_asignados  pa
    JOIN temp_reposicions r ON pa.id = r.id_producto_asignado_resultante and pa.id_clase_entrega = 'REP'
    JOIN temp_producto_circulados pc on pc.id = r.id_producto_circulado_solicitado;



    INSERT INTO pedidos_sku_links(pedido_id,producto_id)
    SELECT p.id, pro.id
    from pedidos p
    JOIN productos pro ON pro.id_producto_logistica_tmp = p.id_producto_logistica_tmp and pro.edicion_tmp = p.edicion_tmp;

    INSERT INTO pedidos_agente_links(pedido_id,agente_id)
    SELECT p.id, a.id
    from pedidos p
    JOIN agentes a ON a.id_agente = p.id_agente_temp;

    INSERT INTO pedidos_canilla_links(pedido_id,canilla_id)
    SELECT p.id,c.id
    from pedidos p
    JOIN canillas c ON c.id_canilla = p.id_canilla_temp;

    INSERT INTO pedidos_estado_links (pedido_id, pedido_estado_id)
	SELECT p.id, pe.id
	from pedidos p
	JOIN pedido_estados pe on p.estado_tmp = pe.id;

    /*TODOS ESTOS INSERT SON PARA EL DIARIO YA QUE HAY UN PROBLEMA CON LA EDICION POR ESO SE AGREGAN A MANO  */
    /*La nacion  */
    INSERT INTO pedidos_sku_links(pedido_id,producto_id)
    SELECT p.id, pro.id
    from pedidos p
    JOIN productos pro ON pro.id_producto_logistica_tmp = 1 and p.id_producto_logistica_tmp = 1;

    INSERT INTO pedidos_sku_links(pedido_id,producto_id)
    SELECT p.id, pro.id
    from pedidos p
    JOIN productos pro ON pro.id_producto_logistica_tmp = 2 and p.id_producto_logistica_tmp = 2;

    INSERT INTO pedidos_sku_links(pedido_id,producto_id)
    SELECT p.id, pro.id
    from pedidos p
    JOIN productos pro ON pro.id_producto_logistica_tmp = 3 and p.id_producto_logistica_tmp = 3;

    INSERT INTO pedidos_sku_links(pedido_id,producto_id)
    SELECT p.id, pro.id
    from pedidos p
    JOIN productos pro ON pro.id_producto_logistica_tmp = 6 and p.id_producto_logistica_tmp = 6;

    INSERT INTO pedidos_sku_links(pedido_id,producto_id)
    SELECT p.id, pro.id
    from pedidos p
    JOIN productos pro ON pro.id_producto_logistica_tmp = 7 and p.id_producto_logistica_tmp = 7;

    /*Popular  */

    INSERT INTO pedidos_sku_links(pedido_id,producto_id)
    SELECT p.id, pro.id
    from pedidos p
    JOIN productos pro ON pro.id_producto_logistica_tmp = 110601 and p.id_producto_logistica_tmp = 110601; 
    
    INSERT INTO pedidos_sku_links(pedido_id,producto_id)
    SELECT p.id, pro.id
    from pedidos p
    JOIN productos pro ON pro.id_producto_logistica_tmp = 110602 and p.id_producto_logistica_tmp = 110602; 

    INSERT INTO pedidos_sku_links(pedido_id,producto_id)
    SELECT p.id, pro.id
    from pedidos p
    JOIN productos pro ON pro.id_producto_logistica_tmp = 110603 and p.id_producto_logistica_tmp = 110603; 

    INSERT INTO pedidos_sku_links(pedido_id,producto_id)
    SELECT p.id, pro.id
    from pedidos p
    JOIN productos pro ON pro.id_producto_logistica_tmp = 110604 and p.id_producto_logistica_tmp = 110604; 

    INSERT INTO pedidos_sku_links(pedido_id,producto_id)
    SELECT p.id, pro.id
    from pedidos p
    JOIN productos pro ON pro.id_producto_logistica_tmp = 110605 and p.id_producto_logistica_tmp = 110605; 

    INSERT INTO pedidos_sku_links(pedido_id,producto_id)
    SELECT p.id, pro.id
    from pedidos p
    JOIN productos pro ON pro.id_producto_logistica_tmp = 110606 and p.id_producto_logistica_tmp = 110606; 

    INSERT INTO pedidos_sku_links(pedido_id,producto_id)
    SELECT p.id, pro.id
    from pedidos p
    JOIN productos pro ON pro.id_producto_logistica_tmp = 110607 and p.id_producto_logistica_tmp = 110607; 
	

    UPDATE pedidos
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
