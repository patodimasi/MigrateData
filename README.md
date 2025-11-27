# Scripts para la migración de datos:  

## Readme General 
Primero poblar todo lo referente al producto
1) Correr migrateJerarquia.sql -> Se encuentra dentro de la carpeta reestructuracion
Se crean las tablas de :

```
producto_tipos;
producto_categorias;
producto_subcategorias;
producto_categorias_producto_tipo_links;
producto_categorias_producto_subcategorias_links;
```

2) Correr el script de migrateProduct.js
Se crean las tablas de :
```
productos
productos_producto_categoria_links
productos_producto_subcategoria_links

Recordar de llenar los campos para la tabla producto_estado
1- Deshailitado
2- Hailitado
3- Mostrar
```
3) Correr el script de migrateFiles

Este script agrega las imagenes a los productos, se llenan las siguientes
tablas:
```
files
files_related_morphs
```

4) Correr el script referente a pedidos (migratePedido.js)


## **migrateJerarquia**
Este script que se encuentra en reestructuracion -> migrateJerarquia.sql

Contiene todo lo referente a la catalogacion de un producto: TipoProducto, Categoria, Subcategoria.
En este script se van a crear las siguientes tablas:
```
producto_tipos  -> (RVT,OPC,DIA)
producto_categorias -> (Ejemplo: LIV, LUG)
producto_subcategorias -> (Eemplo: ANU, SEM)
```
Y se van a crear la tablas pivot a las relaciones antes mencionadas:
```
producto_categorias_producto_tipo_links
producto_categorias_producto_subcategorias_links
```


## **migrateProduct**  
*Migrate Product

Este script va a migrar los datos a la tabla producto de strapi , los datos vienen de la tabla O_WEB_Materiales

1) Generar el archivo O_WEB_Materiales.json (el cual va a ser la entrada del script reestructuracion-> migrateProducts.js 

En sql server hay que correr la siguiente query: 
```sql
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
```

Guardar el resultado de esta query con el nombre  O_WEB_Materiales.json (entrada para el script migrateProduct.js)

El resultado del script (migrateProducts.js) va a ser poblar las siguientes tablas:

```
productos
productos_producto_tipo_links     -> Tabla pivot
productos_producto_categoria_links -> Tabla pivot
productos_producto_subcategoria_links -> Tabla pivot
```

## **migrateFiles**
Este script el resultado es poblar las tablas files y files_related_morphs

1) Primero crear el archivo producto_imagen.json -> 
viene de la tabla SQL: 
```
APP_ProductosImagenes
```
La query que se va a correr en sql es la siguiente:

```sql
SELECT * FROM [ln_sgdi].[dbo].[APP_ProductosImagenes] 
FOR JSON PATH
```

2) Crear el segundo archivo producto.json -> viene de la tabla productos que se encuentra en mysql. (importarlo desde mysql como archivo .json)

2 bis) Por las dudas chequear que las tablas donde se van a insertar los datos esten vacias la primera vez:
```
truncate files;
truncate files_related_morphs;
```

3) Correr el script migrateFiles.json

Recibe como entrada:

filePath1 -> APP_ProductosImagenes -> archivo que se obtuvo en 1) 
filePath2 -> productos.json -> archivo que se obtuvo en 2)

Este script va a poblar las tablas files y files_related_morphs

En files se va a guardar los siguinetes campos:

```
const ext = '.PNG';
const mime = 'image/png';
const url  = https://dev-media-admin-circulacion.glanacion.com/media-folder/imagenes/idproductoLogistica/Edicion'    -> Entorno dev 
const url  = https://qa-media-admin-circulacion.glanacion.com/media-folder/imagenes/idproductoLogistica/Edicion'    -> Entorno qa 
```


id = va a ser un id creado que va a empezar en "1", este id es la entrada a la siguiente tabla files_related_morphs (el id de la tabla files es el file_id de la tabla files_related_morphs)

*NOTA: Primero problar la tabla productos de mysql, y luego poblar las tablas que hacen referencia a la imagen.

## **migratePedido**
El script de migratePedido va a poblar la tabla pedidos de strapi, con las siguientes tablas que viene de SQL:
```
Producto_Circulado
Producto_Asignado
Reposicion
```

Se van a poblar las siguientes tablas en strapi:
```
pedidos -> QUEDA
temp_reposicions -> Se va a eliminar
temp_producto_asignados -> Se va a eliminar
temp_producto_circulados > Se va a eliminar

pedidos_sku_links -> tabla pivot entre pedido y producto
pedidos_estado_links > tala pivot entre pedido y pedido_estados

Se van a crear otros insert (a mano) a la tabla pivot pedidos_sku_link
referente a los diarios

```
NOTA: La tabla pedido_estado se va a poblar a mano, en principio solo va a tener los campos de estado de las reposiciones que son:

```
1 Pendiente
2 Despachado
3 Sin Stock
4 Creado     -> (Estado nuevo)
5 Error      -> (Estado nuevo)
```
Tener en cuenta que se se crean a mano , correr luego la parte de migracion del script:
pedidos_estado_links, ya que si no...no se va a poblar dicha tabla.
El estado igual 5 , se agrego principalmente por si queda en null: la condicion de pago, descuento comercial o recargo interior.

## **migrateCondiciondepago**

Una vez que terminamos de crear y migrar la tabla de pedido, corremos el cript de migracion de Condiciones de pago.
La tabla de entrada del script "script_condicion_pago.sql" , proviene de la tabla del concentrador "C_Condiciones_de_Pago".
Se van a migrar los siguientes campos:

tipo_cliente    -> Viene directo de la tabla del concentrador
tipo_producto_tmp -> Es un campo temporal, el cual se completa mediante la tabla (condicion_de_pagos_tipo_producto_links)
categoria_tmp -> Es un campo temporal, el cual se completa mediante la tabla (condicion_de_pagos_categoria_links)
subcategoria_tmp -> Es un campo temporal, el cual se completa mediante la tabla (condicion_de_pagos_subcategoria_links)
agente_tmp -> Es un campo temporal, el cual se completa mediante la tabla (condicion_de_pagos_agente_links)
condicion_pago -> Viene directo de la tabla del concentrador
SKU_tmp -> Para este campo no se va a utilizar una tabla pivot, sino que se va a agregar a mano, ya que solamente existen dos entradas para este producto.
Este campo en la tabla del concentrador viene como (idMaterial = 200216 , Edicion = 1) por eso se lo va a agregar a mano como SKU: OPC20021600001.
Por eso no se va a hacer el update a la tabla pivot (condiciones_de_pagos_sku_links)


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

## ** migrate Agente**

El archivo migrateAgente abarca las siguientes tabblas:
MediosDeEntrega y App_MediosDeEntregaExcluidos ambas pertenecientes a SQL SERVER

* Se crean las siguientes tablas: agente en mysql , strapi, esta tabla viene del join de la tabla MediosDeEntrega y App_MediosDeEntregaExcluidos se agregan los campos agente_rediaf (cuyo valor es cero) y agente_excluido (arranca en cero en el insert) pero este campo es el que va a cambiar al hacer join entre la tabla MediosDeEntrega y App_MediosDeEntregaExcluidos

* Tablas que se tienen que borrar: App_MediosDeEntregaExcluidos, la de MediosDeEntrega cambio el nombre por agentes por lo tanto no esta en mysql

* Tablas que tienen que quedar en mysql, strapi: agentes

* Se agrego la siguiente validacion al script: Si  IdAgente = IdAgentePadre -> IdAgentePadre = ''

## ** migrate Modelo de Despacho**

Las tablas pertenecientes a todo lo referente al modelo de despacho son: Modelo de despacho, Rutas despacho, Transportista y Ruta Tarifa.

Orden en el cual hay que migrar estas tablas:
1) Modelo de despacho
2) Rutas despacho
3) Transportista
4) Temp_RutaMedio , es una tabla de SQL, que si bien es temporal hay que migrarla por que es la que relaciona el transportista con la ruta, la necesito
para poder cargar la relacion actual entre la tabla Rutas despacho y transportista
5) Ruta tarifa

**Modelo de despacho (Contiene todos los modelos de despacho) , esta tabla viene de la tabla de SQL  "vw_Adex_ModeloDespacho_Ruta_Agente".
El script que migra dicha tabla es: "migrateModeloDespacho"

Tiene los siguientes campos:

IdModeloDespacho

Ruta                -> Relacion con la tabla Rutas despacho

TipoDestino         -> En la vieja tabla de SQL se llama TipoTercero
OrdenVisita

Destino             -> En la vieja tabla de SQL se llama IdAgenteRuta

RutaTmp             -> Campo temporal que se uso para relacionar la tabla Modelo de Despacho con la tabla Rutas Despacho, mediante la tabla ralacional "modelo_de_despachos_ruta_links"



**Rutas despacho (Contiene todo lo referente a las rutas , su frecuencia y el transportista), esta tabla viene de la tabla SQL  vw_Adex_Rutas. Nombre del script que migra dicha tabla : "migrateRutas"

Tiene los siguientes campos:

CodigoRuta                                                 -> En la vieja tabla de SQL se llama IdRuta

Descripcion

Origen                                                     -> Nuevo 
campo

Destino                                                    -> Nuevo
 campo

EsTroncal                                                  -> En la
 vieja tabla de SQL se llama EsPrimaria

Frecuencia : Lun,Mar,Mier,Juev,Vier,Sab,Dom

Transportista: Relacion con la tabla transportista         -> Viene de la tabla relacinal "rutas_despachos_transportista_links" , que relaciona las tablas Transportista con Temp_RutaMedio y
                                                              RutaDespacho
															  

                                                              
**Transportista (Contiene lo referente solo al transportista) , esta tabla viene de la tabla de SQL "I_SAP_Proveedores", solo hay que migrar aquellos proveedores que comienzan con "LO". Script que migra dicha tabla: "migrateTransportista"

Tiene los siguientes campos:
													  
IdTransportista    -> Viene del campo IdProveedor 

Descripcion



Una vez que ya esten cargados los script para llenar las tablas de : Transportista y RutaDespacho , hay que correr el script "migrateRutaMedio", este crea una tabla temporal llamada
"temp_ruta_medios", el cual vincula las rutas con los transportistas.

**Ruta Tarifa  (Contiene lo referente al precio y peaje de una ruta vinculada a un transportista), esta tabla viene de la tabla SQL , [QDES].[qdesuser].[vw_tarifamedio].
Tiene los siguientes campos:

Transportista: Relacion con la tabla Transportista, tabla de relacion "ruta_tarifas_transportista_links"
FechaDesde                                     -> En la vieja tabla de SQL se llama Fecha
Tarifa
Peaje
Ruta: Relacion con la tabla Ruta despacho, tabla de relacion "ruta_tarifas_ruta_links"


