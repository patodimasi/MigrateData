const fs = require('fs');
const path = require('path');

const filePath = path.join('C:', 'Users', 'pdimasi', 'OneDrive - S.A. La Nacion', 'Documentos', 'rutaMedio.json');
const outputPath = path.join('C:', 'Users', 'pdimasi', 'OneDrive - S.A. La Nacion', 'Documentos', 'rutaMedio_modif.sql');

const procesamiento = () => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo:', err);
            return;
        }

        try{
            let fixedData = data
            .replace(/(\r\n|\n|\r)/gm, '') // quita todos los saltos de línea
            .trim();

            const jsonData = JSON.parse(fixedData);

            const NewData = jsonData.map(item => {
                return `INSERT INTO temp_ruta_medios (id_modelo_despacho, id_ruta, id_transportista,id_medio) VALUES  ('${item.IDModeloDespacho}', '${item.IDRuta}', '${item.IDTransportista}', ${item.IDMedio});`;
             
            });
            NewData.push('\nSET SQL_SAFE_UPDATES = 0;');
            NewData.push('\nUPDATE temp_ruta_medios SET published_at = NOW();');
            NewData.push(`
                INSERT INTO rutas_despachos_transportista_links (rutas_despacho_id, transportista_id)
                SELECT DISTINCT rd.id, t.id
                FROM rutas_despachos rd
                JOIN temp_ruta_medios trm ON rd.codigo_ruta = trm.id_ruta
                JOIN transportistas t ON trm.id_transportista = t.id_transportista;
            `);
            fs.writeFileSync(outputPath, NewData.join('\n'), 'utf8');
            console.log('Archivo SQL generado correctamente');
        }catch{

        }
    });   


};

procesamiento();