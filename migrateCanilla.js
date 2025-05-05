const fs = require('fs');
const path = require('path');
const readline = require('readline');

/*  Script para migrar datos relacionados a los Canillas.

    1- Se extrae información desde dos fuentes:
        1.1- MySQL ln_sgdiweb (tablas: "canilla_matricula")
        1.2- SQLServer ln_sgdi (tablas: "APP_Canillas", "APP_CanillasAdicional", "APP_CanillasMotivos")

    2- Se escriben las sentencias SQL necesarias en el archivo output, el cual luego debe ser importado y ejecuta en el MySQL de Strapi.

    3- Observaciones:
        3.1- Se deben modificar las variables "archivoSQLServer", "archivoMySQL" y "outputPath" para determinar los "paths" de los inputs y outputs del proceso.
        3.2- Los archivos de origen (el de MySQL y SQLServer), deben tener cada "INSERT" en una linea aparte (respestando su estructura de INSERT - COLUMNAS - VALUES)
*/

const archivoSQLServer = path.join('C:', 'Users', 'aordonez', 'Documents', 'canillaDataFromSQLServer.sql');
const archivoMySQL = path.join('C:', 'Users', 'aordonez', 'Documents', 'canillaMatriculaDataFromMySQL.sql');
const outputPath = path.join('C:', 'Users', 'aordonez', 'Documents', 'dataCanillaToInsertInMySQL.sql');

const rlArchivoSQLServer = readline.createInterface({
    input: fs.createReadStream(archivoSQLServer, { encoding: 'utf16le' }),
    crlfDelay: Infinity
});

const rlArchivoMySQL = readline.createInterface({
    input: fs.createReadStream(archivoMySQL, { encoding: 'utf8' }),
    crlfDelay: Infinity
});

const outputStream = fs.createWriteStream(outputPath, { encoding: 'utf8' });

function convertToSnakeCase(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
}

function escapeSQLValue(value) {
    if (!value || value.toUpperCase() === 'NULL')
        return value;

    if (value.startsWith("'") && value.endsWith("'")) {
        const content = value.slice(1, -1).replace(/'/g, "''");
        return `'${content}'`;
    }
    return value;
}

function generarIdCanilla(intIdCanilla) {
    const numeroConCeros = intIdCanilla.toString().padStart(8, '0');
    return 'C' + numeroConCeros;
}

const writeAppCanillasData = (tabla, columns, values) => {

    const excludeColumns = [];
    const filteredColumns = [];
    const filteredValues = [];

    tabla = 'app_canillas';

    columns.forEach((col, index) => {
        if (!excludeColumns.includes(col)) {
            filteredColumns.push(convertToSnakeCase(col));
            filteredValues.push(escapeSQLValue(values[index]));

            if (col === 'IntIdCanilla') {
                filteredColumns.push('id_canilla');
                filteredValues.push(`'${generarIdCanilla(values[index])}'`)
            }
        }
    });

    outputStream.write(`INSERT INTO ${convertToSnakeCase(tabla)} (${filteredColumns.join(', ')}) VALUES (${filteredValues.join(', ')});\n`);
}

const writeAppCanillasAdicionalData = (tabla, columns, values) => {

    const excludeColumns = [];
    const filteredColumns = [];
    const filteredValues = [];

    tabla = 'app_canillas_adicionals';

    columns.forEach((col, index) => {
        if (!excludeColumns.includes(col)) {
            filteredColumns.push(convertToSnakeCase(col));
            filteredValues.push(escapeSQLValue(values[index]));
        }
    });

    outputStream.write(`INSERT INTO ${convertToSnakeCase(tabla)} (${filteredColumns.join(', ')}) VALUES (${filteredValues.join(', ')});\n`);
}

const writeAppCanillasMotivosData = (tabla, columns, values) => {

    const excludeColumns = [];
    const filteredColumns = [];
    const filteredValues = [];

    tabla = 'app_canillas_motivos';

    columns.forEach((col, index) => {
        if (!excludeColumns.includes(col)) {
            filteredColumns.push(convertToSnakeCase(col));
            filteredValues.push(escapeSQLValue(values[index]));
        }
    });

    outputStream.write(`INSERT INTO ${convertToSnakeCase(tabla)} (${filteredColumns.join(', ')}) VALUES (${filteredValues.join(', ')});\n`);
}

// Extracción de datos del archivo del MySQL de origen (tablas: "canilla_matricula")
rlArchivoMySQL.on('line', (line) => {

    const match = line.match(/^INSERT INTO\s+`?canilla_matricula`?\s*\(([^)]+)\)\s+VALUES\s*(.+);$/);

    if (match) {

        const rawColumns = match[1].split(',').map(col => col.trim().replace(/[`'"]/g, ''));
        const filteredColumnIndexes = [];
        const filteredColumns = [];

        rawColumns.forEach((col, index) => {
            if (col === 'matricula' || col === 'codCanilla') {
                filteredColumnIndexes.push(index);
                filteredColumns.push(convertToSnakeCase(col));
            }
        });

        const valuesChunk = match[2].trim();
        const rowMatches = valuesChunk.match(/\(([^)]+)\)/g); // Cada conjunto de paréntesis es una fila de valores

        rowMatches.forEach(row => {
            const values = row
                .slice(1, -1)
                .split(',')
                .map(v => v.trim());

            const selectedValues = filteredColumnIndexes.map(index => values[index]);

            outputStream.write(`INSERT INTO canilla_matriculas (${filteredColumns.join(', ')}) VALUES (${selectedValues.join(', ')});\n`);
        });
    }
});

// Extracción de datos del archivo del SQLServer de origen (tablas: "APP_Canillas", "APP_CanillasAdicional", "APP_CanillasMotivos")
rlArchivoSQLServer.on('line', (line) => {

    const modifiedLine = line
        .replace(/\[dbo\]\s*\./g, '')                                   // Elimina [dbo].
        .replace(/\[/g, '')                                             // Elimina corchetes de apertura.
        .replace(/\]/g, '')                                             // Elimina corchetes de cierre.
        .replace(/N'([^']*)'/g, "'$1'")                                 // Elimina el prefijo N en strings.
        .replace(/CAST\(/g, '')                                         // Elimina CAST(.
        .replace(/ AS DateTime\)/g, '')                                 // Elimina AS DateTime).
        .replace(/^SET IDENTITY_INSERT\s+\S+\s+(ON|OFF)\s*;?/gm, '')
        .replace(/^\s*GO\s*$/gm, '')                                    // Elimina líneas que solo contengan GO.
        .replace(/USE\s+\[(.*?)\]/g, 'USE $1;')                         // Corrige la sintaxis de USE.
        .replace(/(\d+\.\d+)\s+AS Decimal\(\d+,\s*\d+\)\s*\)/g, '$1')   // Corrige decimales.
        .replace(/(?<=[^' ])''(?=[^' ])/g, '');                         // Corrige dobles comillas en SQL.

    const match = modifiedLine.match(/INSERT\s+(\w+)\s*\(([^)]+)\)\s+VALUES\s*\((.+)\)/);

    if (match) {

        let tableName = match[1];
        let columns = match[2].split(',').map(col => col.trim());
        let rawValues = match[3].trim();
        let values = [];
        let current = '';
        let inString = false;

        for (let i = 0; i < rawValues.length; i++) {
            const char = rawValues[i];
            if (char === "'" && rawValues[i - 1] !== '\\') {
                inString = !inString;
                current += char;
            } else if (char === ',' && !inString) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        if (current)
            values.push(current.trim());

        if (tableName === 'APP_Canillas')
            writeAppCanillasData(tableName, columns, values);

        if (tableName === 'APP_CanillasAdicional')
            writeAppCanillasAdicionalData(tableName, columns, values);

        if (tableName === 'APP_CanillasMotivos')
            writeAppCanillasMotivosData(tableName, columns, values);
    }
});

let mysqlDone = false;
let sqlserverDone = false;

const combinedStatement = `
SET SQL_SAFE_UPDATES = 0;

INSERT INTO canillas (
    id_canilla,
    mail,
    clave,
    apellido,
    nombre,
    id_agente,
    nro_cuenta_hija,
    habilitado_repo,
    estado,
    matricula,
    paquete,
    dni,
    celular,
    cuit,
    direccion,
    cod_postal,
    coordenadas,
    localidad,
    provincia,
    tiene_reparto,
    entrega_suscripcion_diario,
    entrega_suscripcion_revistas,
    carga_revista,
    carga_opcionales,
    id_motivo,
    fecha_reasignacion,
    reasignado_por
)
    SELECT 
        appc.id_canilla AS id_canilla,
        appc.mail AS mail,
        NULL,
        appc.apellido AS apellido,
        appc.nombre AS nombre,
        appc.id_medio_de_entrega_padre AS id_agente,
        appc.nro_cuenta_hija AS nro_cuenta_hija,
        appc.habilitado_repo AS habilitado_repo,
        appc.id_estado AS estado,
        cm.matricula AS matricula,
        appca.paquete AS paquete,
        appca.dni AS dni,
        appca.celular AS celular,
        appca.cuit AS cuit,
        appca.direccion AS direccion,
        appca.cod_postal AS cod_postal,
        NULL,
        appca.localidad AS localidad,
        appca.provincia AS provincia,
        appca.tiene_reparto AS tiene_reparto,
        appca.entrega_suscripcion_diario AS entrega_suscripcion_diario,
        appca.entrega_suscripcion_revistas AS entrega_suscripcion_revistas,
        appca.carga_revista AS carga_revista,
        appca.carga_opcionales AS carga_opcionales,
        appc.id_motivo AS id_motivo,
        appc.fecha_reasignacion AS fecha_reasignacion,
        appc.reasignado_por AS reasignado_por
    FROM
        app_canillas appc
    LEFT JOIN
        app_canillas_adicionals appca 
    ON
        appc.id_canilla = appca.id_canilla
    LEFT JOIN (
        SELECT cm1.cod_canilla, cm1.matricula
        FROM canilla_matriculas cm1
        JOIN (
            SELECT cod_canilla, MAX(id) AS max_id
            FROM canilla_matriculas
            GROUP BY cod_canilla
        ) cm2
        ON cm1.cod_canilla = cm2.cod_canilla AND cm1.id = cm2.max_id
    ) cm ON appc.id_canilla = cm.cod_canilla;

UPDATE canillas
SET published_at = now();

INSERT INTO canilla_motivos (
    id_canilla_motivo,
    motivo
)
    SELECT
        appcm.id_motivo AS id_canilla_motivo,
        appcm.motivo AS motivo
    FROM
        app_canillas_motivos appcm;

UPDATE canilla_motivos
SET published_at = now();
`;

const checkDone = () => {
    if (mysqlDone && sqlserverDone) {
        outputStream.write(combinedStatement);
        outputStream.end();
        console.log(`Archivo procesado y guardado en: ${outputPath}`);
    }
};

rlArchivoMySQL.on('close', () => {
    mysqlDone = true;
    checkDone();
});

rlArchivoSQLServer.on('close', () => {
    sqlserverDone = true;
    checkDone();
});