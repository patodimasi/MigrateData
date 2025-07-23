const fs = require('fs');
const path = require('path');

const BASE_PATH = 'C:\\Users\\pdimasi\\OneDrive - S.A. La Nacion\\Escritorio';
// tendria que descargar el archivo producto_imagen (ya creado) y el archico producto_edicion (ya creado)
// Archivos de entrada
const filePath1 = path.join(BASE_PATH, 'producto_imagen.json');
const filePath2 = path.join(BASE_PATH, 'producto_edicion.json');

// Archivo de salida SQL
const outputPath = path.join(BASE_PATH, 'outputFileImagen.sql');

//Va a empezar en 1
let nextFileId = 1;


async function processFilesAndGenerateSQL() {
   
    try {
        
        const productosImagenData = fs.readFileSync(filePath1, { encoding: 'utf8' });
        const productosEdicionData = fs.readFileSync(filePath2, { encoding: 'utf8' });

        const productosImagen = JSON.parse(productosImagenData);
        const productosEdicion = JSON.parse(productosEdicionData);   
        
        // Archivo de salida
        const outputStream = fs.createWriteStream(outputPath, { encoding: 'utf8' });

        // Voy por cada elemento de la imagen
        for (const imagenItem of productosImagen) {
            const { id_producto_logistica: idLogisticaImagen, edicion: edicionImagen, url_externa } = imagenItem;

            // Busco a aver si lo encuentro en producto edicion
            const edicionMatch = productosEdicion.find(edicionItem =>
                edicionItem.id_producto_logistica === idLogisticaImagen && edicionItem.edicion === edicionImagen
            );

            if (edicionMatch) {
                //related_id va a contener el "id" de la tabla producto_edicion
                const related_id = edicionMatch.id; 

                // Construyo los nuevos campos para el insert en 'files'
                const name = `${idLogisticaImagen}-${edicionImagen}`;
                const ext = '.PNG';
                const mime = 'image/png';
                const url = url_externa;

                // Aca generaria el autoincremental para file
                const currentFileId = nextFileId++;

                // Sentencia INSERT para la tabla 'files'
                // el "id" va a ser el autoincremental que lo voy a generar a "mano" para luego 
                //usarlo en file_id de la tabla FileMorphs
                const insertStatementFile = `INSERT INTO files (id, name, ext, mime, url) VALUES (${currentFileId}, '${name}', '${ext}', '${mime}', '${url}');\n`;
                outputStream.write(insertStatementFile);

                // Sentencia INSERT para la tabla 'files_related_morphs'
                const insertStatementFileMorphs = `INSERT INTO files_related_morphs (file_id, related_id, related_type, field, \`order\`) VALUES (${currentFileId}, ${related_id}, 'api::producto-edicion.producto-edicion', 'Imagen', 1);\n`;
                outputStream.write(insertStatementFileMorphs);
            }
        }

        // 4. Finalizar la escritura cuando todos los datos han sido procesados
        outputStream.end(() => {
            console.log(`Completado: '${path.basename(outputPath)}' ha sido generado en: ${BASE_PATH}`);
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

//Ejecuto la funcion principal
processFilesAndGenerateSQL();