const fs = require('fs');
const path = require('path');

const filePath = path.join('C:', 'Users', 'pdimasi', 'OneDrive - S.A. La Nacion', 'Documentos', 'rutas.json');
const outputPath = path.join('C:', 'Users', 'pdimasi', 'OneDrive - S.A. La Nacion', 'Documentos', 'rutas_modif.sql');

const procesamiento = () => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo:', err);
            return;
        }

        try {
            let fixedData = data.replace(/(\r\n|\n|\r)/gm, '').trim();
            const jsonData = JSON.parse(fixedData);

            const NewData = jsonData.map(item => {
                const esTroncal = item.EsPrimaria === true || item.EsPrimaria === 'true' ? 1 : 0;
                return `
                    INSERT INTO rutas_despachos
                    (codigo_ruta, descripcion, origen, destino, es_troncal, lunes, martes, miercoles, jueves, viernes, sabado, domingo)
                    VALUES ('${item.IDRuta}', '${item.Descripcion}', '', '', '${esTroncal}', 
                    0, 0, 0, 0, 0, 0, 0);
                    `.trim();
            });

            NewData.push('\n SET SQL_SAFE_UPDATES = 0;');
            NewData.push('\nUPDATE rutas_despachos SET published_at = NOW();');

            fs.writeFileSync(outputPath, NewData.join('\n'), 'utf8');
            console.log('Archivo SQL generado correctamente.');

        } catch (parseErr) {
            console.error('Error al parsear el JSON:', parseErr);
        }
    });
};

procesamiento();
