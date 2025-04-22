# Scripts para la migración de datos:  

**migrateProduct_qa**  
El archivo migrateProduct_qa, abarca las siguientes tablas: 
Producto, Producto_FamiliaProducto, Producto_Descripcion, Producto_TipoProducto, Producto_Circulado,Devolucion_ProductosFueraRediaf
APP_ProductosImagenes

*Se crean las siguientes tablas:  
Producto_Edicion : Viene de la union de las tablas Producto_Descripcion y Producto_Circulado y APP_ProductosImagenes


*Se cambiaron los nombres de las siguientes tablas:  
APP_ProductosImagenes paso a llamarse Producto_Imagen  


*Tablas que tienen que quedar en Strapi:
Producto, Producto_FamiliaProducto, Producto_TipoProducto, Producto_Imagen, Producto_Edicion, Pedido, Pedido_Estado, Documento_Factura, Documento_TipoDocumento

*Tablas que tiene que quedar en mysql (minuscula de Strapi):
productos, producto_familia_productos, producto_tipo_productos,  producto_imagenes, producto_descripcions, producto_circulados, producto_aignados, producto_edicions, pedidos, pedidos_estados, documentos, documento_tipo_documento

*Tablas para crear en mysql (no van a estar en Strapi): producto_circulado, producto_descripcions, producto_asignado, devolucion_productos_fuera_rediafs, reposicions, documentos (recordar que cambia el nombre por documento_facturas).

*Recordatorios: Recordar despues de la migracion de datos, borrar el campo id_producto_circulado de la tabla Producto_Edicion y en la tabla Documento_Factura, este campo se dejo, para poder vincular las tablas y realizar el join, entre (Producto_Edicion y Pedidos) , (Producto_Edicion y Documento).  
La base de datos mysql, se configuro con "innodb_autoinc_lock_mode=0"
Las siguientes tablas conservaron el id de tipo varchar que tenian de SQL Server + el agregado del "id" PK propio de strapi: Producto, Devolucion_ProductosFueraRediaf, Documentos, Documentos_TipoDocumento.
Las siguientes tablas se cambio el nombre de su PK por la PK "id" de strapi:  Producto_FamiliaProducto, Producto_Descripcion, Producto_TipoProducto, Producto_Asignado
Producto_Circulado, APP_ProductosImagenes, Reposicion, Reposicion_EstadoReposicion

neas 

   

