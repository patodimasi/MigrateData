const fs = require('fs');
const path = require('path');
const readline = require('readline');

/*Script para generar la tabla Destacados*/ 
const filePath = path.join('C:', 'Users', 'pdimasi', 'OneDrive - S.A. La Nacion', 'Documentos', 'script_destacado.sql');
const outputPath = path.join('C:', 'Users', 'pdimasi', 'OneDrive - S.A. La Nacion', 'Documentos', 'script_modifdestacado.sql');

const rl = readline.createInterface({
    input: fs.createReadStream(filePath, { encoding: 'utf8' }),
    crlfDelay: Infinity
});

function convertToSnakeCase(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
}

const outputStream = fs.createWriteStream(outputPath, { encoding: 'utf8' });

const destacados = (tabla, columna, valor) => {
    console.log("llega al destacado", tabla, columna, valor);
    const excludeColumns = ['FechaCreacion', 'CreadoPor', 'FechaModificacion', 'ModificadoPor'];
    const filteredColumns = [];
    const filteredValues = [];

    tabla = 'destacados'
    columna.forEach((col, index) => {
        if (col === 'IdDestacado') {
            col = 'id';
            idValue = valor[index]; 
        }
        if (!excludeColumns.includes(col)) {
            filteredColumns.push(convertToSnakeCase(col));
            filteredValues.push(valor[index]);
        }
    });

    filteredColumns.push('activo');
        filteredValues.push(0);

    filteredColumns.push('orden');
        filteredValues.push('NULL');    

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

      
        destacados(tableName, columns, values);
    }
 
});

rl.on('close', () => {
    outputStream.end(() => {
        console.log(`Archivo procesado y guardado en: ${outputPath}`);
    });
});