const fs = require('fs');
const path = require('path');
const readline = require('readline');

/*Script para generar la tabla de pedidos y pedido_estados.
Contiene las siguientes tablas de sql: Reposicion, Producto_Asignado,Reposicion_EstadoReposicion  
Quedaron las siguientes tablas: pedidos, pedido_estados*/
const filePath = path.join('C:', 'Users', 'pdimasi', 'OneDrive - S.A. La Nacion', 'Documentos', 'script_pedido.sql');
const outputPath = path.join('C:', 'Users', 'pdimasi', 'OneDrive - S.A. La Nacion', 'Documentos', 'script_modifpedido.sql');

let pedidoEstadoCreadoInsertado = false;
// uso este estado ya que creo id = 1, y todos los demas valores se tienen que desplazar
let nextEstadoId = 2;

const rl = readline.createInterface({
    input: fs.createReadStream(filePath, { encoding: 'utf8' }),
    crlfDelay: Infinity
});

function convertToSnakeCase(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
}

const estadoRepo = (tabla, columna, valor) => {
    tabla = 'pedido_estados'
    // se agrega un estado mas id= 0 descripcion = 'Creado'
  
    const columns = columna.map(col => col === 'IdEstadoReposicion' ? 'id' : col);
    valor[0] = nextEstadoId++;
    outputStream.write(`INSERT INTO ${convertToSnakeCase(tabla)} (${convertToSnakeCase(columns.join(', '))}) VALUES (${valor.join(', ')});\n`);
}


const pAsignadoRepo = (tabla, columna, valor,index) => {
    
    tabla = tabla === 'Producto_Asignado' ? 'producto_asignados' : 'reposiciones';
   
   
    const excludeColumns = ['CreatedBy', 'CreatedAt', 'UpdatedBy', 'UpdatedAt','FechaVencimientoFactura'];
    
    const columns = columna.map(col => col === 'IdReposicion'  || col === 'IdProductoAsignado' ? 'id' : col);

    const createdAtStr = valor[index].replace(/'/g, '');
    const createdAt = new Date(createdAtStr);
   
    
    const fechaLimite = new Date('2024-08-01');

    if (createdAt > fechaLimite) {
        const filteredColumns = [];
        const filteredValues = [];

        columns.forEach((col, index) => {
            if (!excludeColumns.includes(col)) {
                filteredColumns.push(convertToSnakeCase(col));
                filteredValues.push(valor[index]);
            }
        });

        outputStream.write(`INSERT INTO ${convertToSnakeCase(tabla)} (${filteredColumns.join(', ')}) VALUES (${filteredValues.join(', ')});\n`);
    }
}

const outputStream = fs.createWriteStream(outputPath, { encoding: 'utf8' });

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

        if ((tableName === 'Producto_Asignado') || (tableName === 'Reposicion')) {
            const createdAtIndex = columns.findIndex(col => col.trim() === 'CreatedAt');
            
            pAsignadoRepo(tableName, columns, values,createdAtIndex);
        } else {
          if (!pedidoEstadoCreadoInsertado) {
                outputStream.write(`INSERT INTO pedido_estados (id, descripcion) VALUES (1, 'Creado');\n`);
                pedidoEstadoCreadoInsertado = true;
            }
            estadoRepo(tableName, columns, values)
        }
    }
    
});

rl.on('close', () => {
   
    const combinedStatement = `

     SET SQL_SAFE_UPDATES = 0;

    INSERT INTO pedidos (
        id_producto, id_producto_logistica,edicion,fecha_circulacion,id_agente,cantidad_teorica,cantidad,precio,fecha_tope_devolucion,id_carga,
        cantidad_suscripcion, id_clase_entrega,id_estado_pedido,enviado_concentrador,id_canilla,fecha_tope_repo, 
        repo_notificada  
        )
    SELECT  
        null,pe.id_producto_logistica,pe.edicion,pe.fecha_circulacion,pa.id_medio_de_entrega,pa.cantidad_teorica, pa.cantidad_real,pa.precio_unidad,pa.fecha_tope_devolucion, 
        pa.id_carga, pa.cantidad_suscripcion,pa.id_clase_entrega,NULL,NULL,NULL,NULL,NULL        
    FROM 
        producto_circulados pc
        
   JOIN producto_asignados pa on (
		pa.id_producto_circulado = pc.id and 
		pa.id_clase_entrega = 'QDES'	
  
    )
    JOIN producto_ediciones pe ON (
        pc.id_producto_logistica = pe.id_producto_logistica
        AND pc.edicion = pe.edicion
        AND pc.fecha_circulacion = pe.fecha_circulacion
    )


    INSERT INTO pedidos (
        id_producto,id_producto_logistica,edicion, fecha_circulacion,id_agente,cantidad_teorica,cantidad,precio,fecha_tope_devolucion,id_carga,
        cantidad_suscripcion, id_clase_entrega,id_estado_pedido,enviado_concentrador,id_canilla,fecha_tope_repo, 
        repo_notificada  
        )
    SELECT  
        null,pe.id_producto_logistica,pe.edicion, pe.fecha_circulacion,pa.id_medio_de_entrega,pa.cantidad_teorica, pa.cantidad_real,r.precio,pa.fecha_tope_devolucion, 
        pa.id_carga, pa.cantidad_suscripcion,pa.id_clase_entrega,r.id_estado_reposicion,r.enviado_concentrador,
        r.id_canilla,r.fecha_tope_repo,r.repo_notificada        

    FROM producto_asignados  pa
    JOIN reposiciones r ON pa.id = r.id_producto_asignado_resultante and pa.id_clase_entrega = 'REP'
	JOIN producto_circulados pc on pc.id = pa.id_producto_circulado
	JOIN producto_ediciones pe ON (
        pc.id_producto_logistica = pe.id_producto_logistica
        AND pc.edicion = pe.edicion
        AND pc.fecha_circulacion = pe.fecha_circulacion
    );


    /*insert into pedidos_producto_edicions_links (pedido_id, producto_edicion_id)
    select p.id, pe.id
    from producto_ediciones pe
    join pedidos p on p.id_producto_edicion = pe.id;  
    */

    INSERT INTO pedidos_pedido_estado_links(pedido_id, pedido_estado_id)
    SELECT p.id, p.id_estado_pedido
    FROM pedidos p
    JOIN pedido_estados pe ON pe.id = p.id_estado_pedido
    LEFT JOIN pedidos_pedido_estado_links link
        ON link.pedido_id = p.id AND link.pedido_estado_id = p.id_estado_pedido
    WHERE link.pedido_id IS NULL;
    
    UPDATE pedidos
    SET published_at = now();

    UPDATE pedido_estados
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
