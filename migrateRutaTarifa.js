const fs = require('fs');
const path = require('path');

const filePath = path.join('C:', 'Users', 'pdimasi', 'OneDrive - S.A. La Nacion', 'Documentos', 'rutaTarifa.json');
const outputPath = path.join('C:', 'Users', 'pdimasi', 'OneDrive - S.A. La Nacion', 'Documentos', 'rutaTarifa_modif.sql');

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

            const filtrados = jsonData.filter(item => 
                item.transportista && item.transportista.startsWith('LO')

            );
            const NewData = filtrados.map(item => {
                return `INSERT INTO ruta_tarifas (transportista_tmp,ruta_tmp,fecha_desde,tarifa,peaje) VALUES ('${item.transportista.trim()}','${item.ruta.trim()}','${item.fecha.trim()}', '${item.tarifa.trim()}', ${item.peaje});`;
             
            });
            NewData.push('\nSET SQL_SAFE_UPDATES = 0;');
            NewData.push('\nUPDATE ruta_tarifas SET published_at = NOW();');

            NewData.push(`
                INSERT INTO ruta_tarifas_transportista_links (ruta_tarifa_id, transportista_id)
                SELECT rt.id, t.id
                from ruta_tarifas rt
                JOIN transportistas t ON rt.transportista_tmp = t.id_transportista;

                INSERT INTO ruta_tarifas_ruta_links (ruta_tarifa_id, rutas_despacho_id)
                SELECT rt.id, rd.id
                from ruta_tarifas rt
                JOIN rutas_despachos rd ON  rd.codigo_ruta = rt.ruta_tmp
            `);

            fs.writeFileSync(outputPath, NewData.join('\n'), 'utf8');
            console.log('Archivo SQL generado correctamente');
        }catch{

        }
    });   


};

procesamiento();

