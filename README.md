# Scripts para la migración de datos:  

## **migrateProduct**  
*Migrate Product

Primero correr el script que se encuentra en la carpeta reestructuracion -> migrateJerarquia.sql , este script genera las siguientes tablas: producto_tipos, producto_categorias, producto_subcategorias

*NOTA: Por las dudas antes de realizar los ultimos dos insert verificar que se cumple la relacion entre las tablas Ver archivo excel "JerarquiaProducto"

Este mismo archivo contiene los insert de las relaciones entre las tablas producto_tipo - producto_categorias   y    producto_categorias - producto_subcategorias

Las tablas pivot son las siguientes:

*producto_categorias_producto_tipo_links -> Tabla pivot entre producto_tipo y producto_categorias 
*producto_categorias_producto_subcategorias_links -> Tabla pivot entre producto_categorias y producto_subcategorias 

2) Generar el archivo O_WEB_Materiales.json (el cual va a ser la entrada del script reestructuracion-> migrateProducts.js 
En sql server hay que correr la siguiente query: 

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
   AND idMaterial NOT LIKE 'LMD%'
)
FOR JSON PATH

Guardar el resultado de esta query con el nombre  O_WEB_Materiales.json

## **migrateFiles**
1) Primero crear el archivo producto_imagen.json -> viene de la tabla APP_ProductosImagenes,

Correr el siguiente script y guardar el archivo como producto_imagen.json
SELECT * FROM [ln_sgdi].[dbo].[APP_ProductosImagenes] FOR JSON PATH

2) Crear el segundo archivo producto.json -> viene de la tabla productos que se encuentra en mysql.

2 bis) Por las duas chequear que las tablas donde se van a insertar los datos esten vacias la primera vez:

truncate files;
truncate files_related_morphs;

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

## **migratePedido**
El archivo migratePedido, abarca las siguientes tablas:
Reposicion, Producto_Asignado, Reposicion_EstadoReposicion  (SQL_SERVER)

*Se crean las siguientes talas en strapi:
Pedido: Viene de la union de Producto_Asignado  (Para los pedidos QDES), Producto_Circulado,
Producto_Edicion  (En el primer insert)
Pedido: Viene de la union de Reposicion (Para los pedidos de Repo), Producto_Circulado, Producto_Edicion, Pedido_Estado (En el segundo insert)
Pedido_Estado: se le cambio el nombre a la tala que venia de SQL Reposicion_EstadoReposicion

*Tablas que tienen que quedar en strapi y mysql:
Pedidos,Pedidos_Estados

*Tablas que van a tener que ser eliminadas:
Producto_Asignado, Reposicion, Producto_Circulado

*Se agrego el dia 05/06/2025 un campo mas a la tabla pedido_estado quedando de la siguiente forma:

id              descripcion

1                  Pendiente  
2                  Despachado 
3                  Sin stock
4                  Creado  

## **migrateCanilla**
Instrucciones con respecto al script para migrar datos relacionados a los Canillas.

1. Se extrae información desde dos fuentes:
    - MySQL (db: `ln_sgdiweb`) (tablas: `canilla_matricula`)
    - SQLServer (db: `ln_sgdi`) (tablas: `APP_Canillas`, `APP_CanillasAdicional`, `APP_CanillasMotivos`, `APP_CanillasEstados`)

2. El proceso escribe las sentencias SQL necesarias en el archivo output, el cual luego debe ser importado y ejecuta en el MySQL de Strapi.

3. Observaciones:
    - Se deben modificar las variables `archivoSQLServer`, `archivoMySQL` y `outputPath` para determinar los "paths" de los inputs y outputs del proceso.
    - Los archivos de origen (el de MySQL y SQLServer), **deben tener cada "INSERT" en una linea aparte** (respestando su estructura de INSERT - COLUMNAS - VALUES).

4. Paso a paso para exportar la información desde los origenes (MySQL y SQLServer)
    - Información desde MySQL
        - Generar un export de datos de la tabla (canilla_matricula) donde solo exporte los datos (sin incluir la creación de la tabla) en donde cada registro sea un insert (debe tener INSERT INTO, Nombre de columnas y VALUES) de manera independiente.
        - En el caso de no poder hacer el punto anterior, ya sea porque el usuario de MySQL sgdiweb no tenga permisos o por otro motivo, seguir los siguientes pasos:
            - Abrir la consola e ingresar en la ruta de la carpeta `C:\Program Files\MySQL\MySQL Server 8.0\bin`
            - Una ves posicionados en la ruta especificada, ejecutar el siguiente comando (declarar el path de salida que corresponda): `& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe" -h sgdiweb.c4e6gufrqj4g.us-east-1.rds.amazonaws.com -u pdimasi -p --port=3306 --single-transaction --default-character-set=utf8 --set-gtid-purged=off --no-tablespaces --no-create-info --complete-insert ln_sgdiweb canilla_matricula > "C:\Users\testUser\Documents\test_datos.sql"`
        - Una vez tengamos el archivo, debemos asegurarnos que cada registros esté en un INSERT INTO independiente donde cada linea debe contar con el "INSERT INTO", los nombres de las columnas, la sentencia "VALUES" y los valores correspondientes.

    - Información desde SQLServer
        - Hacé clic derecho sobre la base de datos o las tablas deseadas → Tasks → Generate Scripts.
        - En el paso "Choose Objects", seleccioná:
            - Select specific database objects
            - Marcá solo las tablas necesarias
        - En el paso "Set Scripting Options":
            - Seleccioná: Save as script file
            - Elegí un nombre y carpeta para guardarlo.
            - Clic en Advanced
        - En la ventana "Advanced Scripting Options":
            - Buscá la opción: Types of data to script
            - Cambiá el valor de Schema only a: "Data only"
        - Confirmá que:
            - Save as: Unicode text
        - Click en OK, luego Next → Finish.

5. Al contar con los archivos exportados listos para ser utilizados, recordar cambiar los valores de las variables:
    - `archivoSQLServer` la cual debe hacer referencia al path donde esté el archivo exportado desde SQLServer
    - `archivoMySQL` la cual debe hacer referencia al path donde esté el archivo exportado desde MySQL
    - Modificar la variable `outputPath` a donde queremos que el archivo "output" se guarde.

6. Al concretar éxitosamente la migración de datos en su etapa final (producción), se deben eliminar algunas tablas y mantener otras, el detalle a continuación:
    - Mantener:
        - `canillas`
        - `canilla_motivos`
        - `canilla_estados`
    - Eliminar
        - `APP_Canillas`
        - `APP_CanillasAdicional`
        - `APP_CanillasMotivos`
        - `APP_CanillasEstados`
        - `canilla_matricula`

## **migrate Destacados**       

#QUEDO VIEJO#
El archivo migrateDestacados abarca las siguientes tablas:
App_Destacados y App_Destacados_Integrantes pertenecientes a SQL SERVER

* Se crean las siguientes tablas: destacados y destacado_integrantes en my sql (strapi) en realidad se le cambio el nombre a las tablas originales de sql server.

* Se le agrega a la tabla destacados los siguientes campos: activo (arranca con valor cero) y el campo destacado_relacion (arranca con el valor idvalue) para vincular la tabla destacados con la tabla destacados_integrantes
* Se agrega a la tabla destacado_intgerantes el campo idProducto el cual sera en un futuro el SKU

* Tablas que se tienen que borrar: Ninguna ya que las que estan en mysql eran las que estaban en SQL SERVER con el nombre cambiado.

* Tablas que tienen que quedar en mysql, strapi: destacados y destacos_integrantes

#NUEVO#
Este script antes trataba las tablas App_Destacados y App_Destacados_integrantes
ahora solo tiene la tabla App_Destacados no se va a migrar la tabla App_Destacados_integrantes
ya que en la nueva tabla de strapi se va a crear una relacion con la tabla producto_edicion
por lo tanto en la misma tabla Destacados se va  poner elegir los productos que serian los 
"destacados integrantes" , tambien se va a eliminar la tabla que se habia creado para relacionar destacados
con destacados_integrantes que se llamaba  destacado_integrantes_destacado_links 
Se agrego un campo mas a la tabla destacados que se llama orden el mismo campo comienza en null
y es el orden que se le quiere dar a cada destacado por lo tanto:
destacados: id, nombre, fecha_inicio, fecha_fin,activo, orden
tabla que va a quedar en strapi: descatado (nada mas) , no hay que borrar ninguna tabla que venga de SQLServer

## ** migrate Agente++

El archivo migrateAgente abarca las siguientes tabblas:
MediosDeEntrega y App_MediosDeEntregaExcluidos ambas pertenecientes a SQL SERVER

* Se crean las siguientes tablas: agente en mysql , strapi, esta tabla viene del join de la tabla MediosDeEntrega y App_MediosDeEntregaExcluidos se agregan los campos agente_rediaf (cuyo valor es cero) y agente_excluido (arranca en cero en el insert) pero este campo es el que va a cambiar al hacer join entre la tabla MediosDeEntrega y App_MediosDeEntregaExcluidos

* Tablas que se tienen que borrar: App_MediosDeEntregaExcluidos, la de MediosDeEntrega cambio el nombre por agentes por lo tanto no esta en mysql

* Tablas que tienen que quedar en mysql, strapi: agentes

