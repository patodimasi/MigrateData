const fs = require('fs');
const path = require('path');

const BASE_PATH = 'C:\\Users\\pdimasi\\OneDrive - S.A. La Nacion\\Escritorio';
/*
1) Primero crear el archivo producto_imagen.json -> viene de la tabla APP_ProductosImagenes,

Correr el siguiente script y guardar el archivo como producto_imagen.json
SELECT * FROM [ln_sgdi].[dbo].[APP_ProductosImagenes] FOR JSON PATH

2) Crear el segundo archivo producto.json -> viene de la tabla productos que se encuentra en mysql.

3) Correr el script migrateFiles.json

Recibe como entrada:

filePath1 -> APP_ProductosImagenes -> Renombrar a producto_imagen.json
filePath2 -> productos.json -> Renombrar a producto.json

Este script va a poblar las tablas files y files_related_morphs

En files se va a guardar los siguinetes campos:

const ext = '.PNG';
const mime = 'image/png';
const url  = https://dev-media-admin-circulacion.glanacion.com/media-folder/imagenes/idproductoLogistica/Edicion'    -> Entorno dev ,
const url  = https://qa-media-admin-circulacion.glanacion.com/media-folder/imagenes/idproductoLogistica/Edicion'    -> Entorno qa ,


id = va a ser un id creado que va a empezar en "1", este id es la entrada a la siguiente tabla files_related_morphs (el id de la tabla files es el file_id de la tabla files_related_morphs)

*NOTA: Primero problar la tabla productos de mysql, y luego poblar las tablas que hacen referencia a la imagen.


*/
const filePath1 = path.join(BASE_PATH, 'producto_imagen.json');
const filePath2 = path.join(BASE_PATH, 'producto.json');


// Archivo de salida SQL
const outputPath = path.join(BASE_PATH, 'outputFileImagen.sql');

//Va a empezar en 1
let nextFileId = 1;


async function processFilesAndGenerateSQL() {
   
    try {
        
        let productosImagenData = fs.readFileSync(filePath1, { encoding: 'utf8' });

        productosImagenData = productosImagenData.replace(/^\uFEFF/, '').trim(); 
        productosImagenData = productosImagenData.replace(/[\x00-\x1F]/g, '');  

        const productosOwebMaterialesData = fs.readFileSync(filePath2, { encoding: 'utf8' });

        const productosImagen = JSON.parse(productosImagenData);
        const productos = JSON.parse(productosOwebMaterialesData);   

        
        // Archivo de salida
        const outputStream = fs.createWriteStream(outputPath, { encoding: 'utf8' });

        // Voy por cada elemento de la imagen
        for (const imagenItem of productosImagen) {
            const { IdProductoLogistica, Edicion, URLExterna } = imagenItem;
            // Busco a aver si lo encuentro en producto 
            const productoMatch = productos.find(Item =>
                //console.log(Item)
                Item.id_producto_logistica_tmp === IdProductoLogistica && Item.edicion_tmp === Edicion
            );

            if (productoMatch) {
                //related_id va a contener el "id" de la tabla producto_edicion
                const related_id = productoMatch.id; 
               // console.log(productoMatch);
                // Construyo los nuevos campos para el insert en 'files'
                const name = productoMatch.sku;//`${idLogisticaImagen}-${edicionImagen}`;
                const ext = '.PNG';
                const mime = 'image/png';
                const url = 'https://dev-media-admin-circulacion.glanacion.com/media-folder/imagenes/' + productoMatch.id_producto_logistica_tmp + '/' + productoMatch.edicion_tmp + '.jpg';
                //const url = 'https://qa-media-admin-circulacion.glanacion.com/media-folder/imagenes/' + productoMatch.id_producto_logistica_tmp + '/' + productoMatch.edicion_tmp + '.jpg';
                // Aca generaria el autoincremental para file
                const currentFileId = nextFileId++;

                // Sentencia INSERT para la tabla 'files'
                // el "id" va a ser el autoincremental que lo voy a generar a "mano" para luego 
                //usarlo en file_id de la tabla FileMorphs
                const insertStatementFile = `INSERT INTO files (id, name, ext, mime, url) VALUES (${currentFileId}, '${name}', '${ext}', '${mime}', '${url}');\n`;
                outputStream.write(insertStatementFile);

                // Sentencia INSERT para la tabla 'files_related_morphs'
                const insertStatementFileMorphs = `INSERT INTO files_related_morphs (file_id, related_id, related_type, field, \`order\`) VALUES (${currentFileId}, ${related_id}, 'api::producto.producto', 'UbicacionImagen', 1);\n`;
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