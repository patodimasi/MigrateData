/*Nota: este script primero tomo el resultado de la tabla sql server O_WEB_MAteriales
y se creo a aprtir de ahy el archivo O_WEB_Materiales.json

query:

SELECT *
FROM [Concentrador].[dbo].[O_WEB_Materiales] m
WHERE m.id = (
    SELECT MAX(id)
    FROM [Concentrador].[dbo].[O_WEB_Materiales]
    WHERE idMaterial = m.idMaterial and IdMaterial NOT LIKE 'SUS%'--and IdMaterial = 'OPC20010200005' 
)
FOR JSON PATH
*/
const fs = require('fs');
const path = require('path');

const BASE_PATH = 'C:\\Users\\pdimasi\\OneDrive - S.A. La Nacion\\Escritorio';

const filePath1 = path.join(BASE_PATH, 'O_WEB_Materiales.json');
const outputPath = path.join(BASE_PATH, 'productos.sql');

const processFilesAndGenerateSQL = () => {
  try {
    let rawData = fs.readFileSync(filePath1, { encoding: 'utf8' });

    // Para limpiar 
    rawData = rawData.replace(/^\uFEFF/, '').trim(); 
    rawData = rawData.replace(/[\x00-\x1F]/g, '');   

    const productos = JSON.parse(rawData);

    const escapeSQL = str => str ? str.replace(/'/g, "''") : ''; 

    const inserts = productos.map(item => {
      const SKU = item.IdMaterial;
      const Descripcion = escapeSQL(item.Descripcion);
      const Titulo = escapeSQL(item.DescripcionLogistica);

      let TipoProducto = null;
      let Categoria = null;
      let Subcategoria = null;

      if (item.JerarquiaProducto) {
        if (item.JerarquiaProducto.length >= 6) {
          TipoProducto = item.JerarquiaProducto.substring(0, 3);
          Categoria = item.JerarquiaProducto.substring(3, 6);
        }
        if (item.JerarquiaProducto.length === 9) {
          Subcategoria = item.JerarquiaProducto.substring(6, 9);
        }
      }
     
      return `INSERT INTO productos (sku, descripcion, titulo, tipo_producto_tmp, categoria_tmp, subcategoria_tmp) VALUES ('${SKU}', '${Descripcion}', '${Titulo}', '${TipoProducto}', '${Categoria}', ${Subcategoria ? `'${Subcategoria}'` : 'NULL'});`;
    
    });

    const insertTipoLinks = `
        INSERT INTO productos_producto_tipo_links (producto_id, producto_tipo_id)
        SELECT p.id, ptipo.id
        FROM producto_tipos tipo
        JOIN productos p ON p.tipo_producto_tmp = ptipo.codigo;

        insert into productos_producto_categoria_links (producto_id, producto_categoria_id)
        select p.id, pc.id
        from producto_categorias pc
        join productos p on p.categoria_tmp = pc.codigo;

        insert into productos_producto_subcategoria_links (producto_id, producto_subcategoria_id)
        select p.id, ps.id
        from producto_subcategorias ps
        join productos p on p.subcategoria_tmp = ps.codigo;

        SET SQL_SAFE_UPDATES = 0;

        UPDATE productos
        SET published_at = now();

        UPDATE producto_tipos
        SET published_at = now();

        UPDATE producto_categorias
        SET published_at = now();

        UPDATE producto_subcategorias
        SET published_at = now();
            `;
    
        
    fs.writeFileSync(outputPath, inserts.join('\n') + '\n' + insertTipoLinks, { encoding: 'utf8' });

    console.log(`Completado: '${path.basename(outputPath)}' ha sido generado en: ${BASE_PATH}`);
  } catch (error) {
    console.error('Error:', error);
  }
};

processFilesAndGenerateSQL();


