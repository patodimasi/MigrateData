const fs = require('fs');
const path = require('path');

const filePath = path.join('C:', 'Users', 'pdimasi', 'OneDrive - S.A. La Nacion', 'Documentos', 'transportista.sql');
const outputPath = path.join('C:', 'Users', 'pdimasi', 'OneDrive - S.A. La Nacion', 'Documentos', 'transportista_modif.sql');

const procesamiento = () => {
    const data = fs.readFileSync(filePath, 'utf8');
    const lines = data.split(/\r?\n/);

    let output = [];

    for (let line of lines) {

        line = line.replace(/\[dbo\]\s*\./g, '')
            .replace(/\[/g, '')
            .replace(/\]/g, '')
            .replace(/N'([^']*)'/g, "'$1'")
            .replace(/CAST\(/g, '')
            .replace(/ AS DateTime\)/g, '')
            .replace(/^SET IDENTITY_INSERT\s+\S+\s+(ON|OFF)\s*;?/gm, '')
            .replace(/^\s*GO\s*$/gm, '')
            .replace(/USE\s+\[(.*?)\]/g, 'USE $1;')
            .replace(/(\d+\.\d+)\s+AS Decimal\(\d+,\s*\d+\)\s*\)/g, '$1');

        const match = line.match(/INSERT\s+(\w+)\s*\(([^)]+)\)\s+VALUES\s*\((.+)\)/);

        if (match) {
            let tableName = match[1];
            let columns = match[2].split(',').map(col => col.trim());
            let values = match[3].match(/'[^']*'|[^, ]+/g).map(v => v.trim());

            const idxProv = columns.indexOf("IdProveedor");
            if (idxProv === -1) continue;

            let idProveedor = values[idxProv].replace(/'/g, "");
            if (!idProveedor.startsWith("LO")) continue;

            const idxDesc = columns.indexOf("Descripcion");
            let descripcion = values[idxDesc].replace(/'/g, "");

            const insert = `
                INSERT INTO transportistas
                (id_transportista, descripcion)
                VALUES ('${idProveedor}', '${descripcion}');
                `;
            output.push(insert);
        }
    }

    output.push("\nSET SQL_SAFE_UPDATES = 0;");
    output.push("UPDATE rutas_despachos SET published_at = NOW();");
    fs.writeFileSync(outputPath, output.join("\n"), 'utf8');
    console.log("Archivo generado:", outputPath);
};

procesamiento();
