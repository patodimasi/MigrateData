const fs = require('fs');
const path = require('path');

const filePath = path.join('C:', 'Users', 'pdimasi', 'OneDrive - S.A. La Nacion', 'Documentos', 'modelo_despacho.json');
const outputPath = path.join('C:', 'Users', 'pdimasi', 'OneDrive - S.A. La Nacion', 'Documentos', 'modelo_despacho_modif.sql');


const procesamiento = () => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo:', err);
            return;
        }

        try {
            let TipoTercero;
            let Destino;

            let fixedData = data
                .replace(/(\r\n|\n|\r)/gm, '') // quita todos los saltos de línea
                .trim();

            const jsonData = JSON.parse(fixedData);


            const NewData = jsonData.map(item => {
                   return `INSERT INTO modelo_de_despachos (id_modelo_despacho, ruta_tmp, tipo_destino, destino, orden_visita) VALUES 
                 ('${item.IDModeloDespacho}', '${item.IDRuta}', '${item.TipoTercero}', '${item.IDAgenteRuta}', ${item.OrdenVisita});`;

              /*  return `INSERT INTO modelo_de_despachos (id_modelo_despacho, ruta_tmp, tipo_destino, destino_tmp, orden_visita) VALUES 
                ('${item.IDModeloDespacho}', '${item.IDRuta}', '${item.TipoTercero}', '${item.IDAgenteRuta}', ${item.OrdenVisita});`;
                */
            });
            NewData.push(`
                INSERT INTO modelo_de_despachos_ruta_links (modelo_de_despacho_id, rutas_despacho_id)
                SELECT md.id, rd.id
                FROM modelo_de_despachos md
                JOIN rutas_despachos rd ON md.ruta_tmp = rd.codigo_ruta;

                `);
            NewData.push('\nSET SQL_SAFE_UPDATES = 0;');
            NewData.push('\nUPDATE modelo_de_despachos SET published_at = NOW();');
            fs.writeFileSync(outputPath, NewData.join('\n'), 'utf8');
            console.log('Archivo SQL generado correctamente');

        } catch (parseErr) {
            console.error('Error al parsear el JSON:', parseErr);
        }
    });
}

procesamiento();