const fs = require('fs');
const path = require('path');
const readline = require('readline');

const filePath = path.join('C:', 'Users', 'cwybranski', 'OneDrive - S.A. La Nacion', 'Documentos', 'scriptAgente.sql');
const outputPath = path.join('C:', 'Users', 'cwybranski', 'OneDrive - S.A. La Nacion', 'Documentos', 'script_modifiedagente.sql');

const rl = readline.createInterface({
    input: fs.createReadStream(filePath, { encoding: 'utf8' }),
    crlfDelay: Infinity
});

function convertToSnakeCase(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
}

const outputStream = fs.createWriteStream(outputPath, { encoding: 'utf8' });

const agente_excluidos = (tabla, columna, valor) => {  
    const filteredColumns = [];

    tabla = 'medios_de_entrega_excluidos'
    columna.forEach(col=>{
        filteredColumns.push(convertToSnakeCase(col));
    })
    outputStream.write(
        `INSERT INTO ${convertToSnakeCase(tabla)} (${filteredColumns}) VALUES (${valor});\n`
    );
}

const agente = (tabla, columna, valor) => {
    // console.log("llega al destacado", tabla, columna, valor);
    const excludeColumns = ['TimeStamp'];
    const filteredColumns = [];
    const filteredValues = [];

    tabla = 'agentes'
    columna.forEach((col, index) => {
        if (col === 'IdMedioDeEntrega') {
            col = 'id_agente'
            idValue = valor[index];
        }
        if (col === 'IdMedioDeEntregaSap') {
            col = 'id_agente_sap'
            idValue = valor[index];
        }
        if (col === 'IdMedioDeEntregaPadre') {
            col = 'id_agente_padre'
            idValue = valor[index];
        }
        if (!excludeColumns.includes(col)) {
            filteredColumns.push(convertToSnakeCase(col));
            filteredValues.push(valor[index]);
        }
    });

    filteredColumns.push('agente_rediaf');
    filteredValues.push(0);

    filteredColumns.push('agente_excluido');
    filteredValues.push(0);

    outputStream.write(`INSERT INTO ${convertToSnakeCase(tabla)} (${filteredColumns.join(', ')}) VALUES (${filteredValues.join(', ')});\n`);
}

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

        if (tableName === 'MediosDeEntrega') {
            agente(tableName, columns, values);
        } else {
            agente_excluidos(tableName, columns, values)
            //outputStream.write(modifiedLine + '\n');
        }
    }

    //outputStream.write(modifiedLine + '\n'); // Escribe la línea modificada en el archivo de salida.
});

rl.on('close', () => {

    const combinedStatement = `
     SET SQL_SAFE_UPDATES = 0;
	
    UPDATE agentes a
    JOIN app_medios_de_entrega_excluidos me ON a.id_agente = me.id_medio_de_entrega
    SET a.agente_excluido = 1

    UPDATE app_medios_de_entrega_excluidos
    SET published_at = now();

    UPDATE agentes
    SET published_at = now();
    `;

    outputStream.write(combinedStatement); // Escribir la declaración combinada
    outputStream.end(); // Cierra el archivo de salida correctamente.
    console.log(`Archivo procesado y guardado en: ${outputPath}`);

});