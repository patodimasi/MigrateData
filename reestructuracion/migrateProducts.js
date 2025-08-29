/*Nota: este script primero tomo el resultado de la tabla sql server O_WEB_MAteriales
y se creo a aprtir de ahy el archivo O_WEB_Materiales.json

query:

SELECT *
FROM [Concentrador].[dbo].[O_WEB_Materiales] m
WHERE m.id = (
    SELECT MAX(id)
    FROM [Concentrador].[dbo].[O_WEB_Materiales]
      WHERE idMaterial = m.idMaterial
	  AND idMaterial NOT LIKE 'AMB%'
	  AND idMaterial NOT LIKE 'CRO%'
      AND idMaterial NOT LIKE 'ELT%'
      AND idMaterial NOT LIKE 'UNO%'
	  AND idMaterial NOT LIKE 'ELP%'
	  AND idMaterial NOT LIKE 'TAR%'
	  AND idMaterial NOT LIKE 'PAG%'
	  AND idMaterial NOT LIKE 'BRA%'
	  AND idMaterial NOT LIKE 'DJR%'
	  AND idMaterial NOT LIKE 'DPR%'
	  AND idMaterial NOT LIKE 'SUS%'
	  AND idMaterial NOT LIKE 'APE%' 
)
FOR JSON PATH

*La query anterior me genera el archivo .json , O_WEB_Materiales.json, que sirve de entrada para el script migrayeProducts.js

1) Primero corro el script migrateJerarquia.sql para poblar las tablas:
producto_tipos,producto_categorias,producto_subcategorias,
producto_categorias_producto_tipo_links, 
producto_categorias_producto_subcategorias_links

2) Segundo corro el script para poblar la tabla productos (Obtener O_WEB_Materiales)
en ese mismo script se crea primero producto y despues las tablas pivot :
productos_producto_tipo_links,productos_producto_categoria_links,productos_producto_subcategoria_links

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

    //const escapeSQL = str => str ? str.replace(/'/g, "''") : ''; 
    const escapeSQL = str => (str !== null && str !== undefined) ? String(str).replace(/'/g, "''") : '';
      
    const inserts = productos.map(item => {
      const SKU = item.IdMaterial;
      const DescripcionLarga = escapeSQL(item.Descripcion);
      const DescripcionCorta = escapeSQL(item.DescripcionLogistica);
      const IdProductoLogistica = escapeSQL(item.IdMaterialLogistica);
      const Edicion = escapeSQL(item.Edicion);

      let TipoProducto = null;
      let Categoria = null;
      let Subcategoria = null;

      if (item.JerarquiaProducto) {
        if (item.JerarquiaProducto.length === 6) {
          //console.log(SKU);
          TipoProducto = item.JerarquiaProducto.substring(0, 3);
          //console.log(TipoProducto);
          let catTmp = item.JerarquiaProducto.substring(3, 6);
          let Categoria = (catTmp === "QUI" || catTmp === "SEM" || catTmp === "MEN") ? "GEN" : catTmp;
          //console.log(Categoria);
          if (["QUI", "SEM", "MEN"].includes(catTmp)) {
            Subcategoria = catTmp;  // Solo asigna si cumple la condición
          }
			    else{
			      Subcategoria = item.JerarquiaProducto.substring(6, 9);
			    }	
          //console.log(Subcategoria)
          return `INSERT INTO productos (sku, descripcion_larga, descripcion_corta, tipo_producto_tmp, categoria_tmp, subcategoria_tmp,id_producto_logistica_tmp,edicion_tmp) VALUES ('${SKU}', '${DescripcionLarga}', '${DescripcionCorta}', '${TipoProducto}', '${Categoria}', '${Subcategoria}','${IdProductoLogistica}','${Edicion}');`;
        }
        if (item.JerarquiaProducto.length === 9) {
          TipoProducto = item.JerarquiaProducto.substring(0, 3);
          Categoria = item.JerarquiaProducto.substring(3, 6);
          Subcategoria = item.JerarquiaProducto.substring(6, 9);
         // return `INSERT INTO productos (sku, descripcion, titulo, tipo_producto_tmp, categoria_tmp, subcategoria_tmp,,id_producto_logistica_tmp,edicion_tmp) VALUES ('${SKU}', '${Descripcion}', '${Titulo}', '${TipoProducto}', '${Categoria}', '${Subcategoria}');`;
         return `INSERT INTO productos (sku, descripcion_larga, descripcion_corta, tipo_producto_tmp, categoria_tmp, subcategoria_tmp,id_producto_logistica_tmp,edicion_tmp) VALUES ('${SKU}', '${DescripcionLarga}', '${DescripcionCorta}', '${TipoProducto}', '${Categoria}', '${Subcategoria}','${IdProductoLogistica}','${Edicion}');`;
        }
      }
     
    });

    const insertTipoLinks = `
        INSERT INTO productos_producto_tipo_links (producto_id, producto_tipo_id)
        SELECT p.id, ptipo.id
        FROM producto_tipos ptipo
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