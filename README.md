Script para la migracion de datos.
El archivo migrateProduct_qa, abarca las siguientes tablas: 
Producto, Producto_FamiliaProducto, Producto_Descripcion, Producto_TipoProducto, Producto_Circulado
APP_ProductosImagenes, Devolucion_ProductosFueraRediaf, Producto_Asignado,Reposicion, Reposicion_EstadoReposicion, ProductoAsignado, Documentos, Documentos_TipoDocumento

Se crean las siguientes tablas: 
Producto_Edicion : Viene de la union de las tablas Producto_Descripcion y Producto_Circulado.

Pedidos: Viene de la union de las tablas Producto_Asignado, Reposicion y Producto_Edicion.

Se cambiaron los nombres de las siguientes tablas:
APP_ProductosImagenes paso a llamarse Producto_Imagen
Reposicion_EstadoReposicion paso a llamarse Pedido_Estado
Documentos paso a llamarse Documento_Factura

Tablas que tienen que quedar en Strapi:
Producto, Producto_FamiliaProducto, Producto_TipoProducto, Producto_Imagen,Producto_Edicion, Pedido, Pedido_Estado, Documento_Factura, Documento_TipoDocumento

Tablas que tiene que quedar en MYSQL (minuscula de Strapi):
productos, producto_familia_productos, producto_tipo_productos,  producto_imagenes,producto_descripcions, producto_circulados, producto_aignados, producto_edicions, pedidos, pedidos_estados, documentos, documento_tipo_documento

Tablas con script para crear en mysql: producto_circulado, producto_descripcions, producto_asignado, devolucion_productos_fuera_rediafs, reposicions, documentos (recordar que cambia el nombre por documento_facturas).

Recordatorios: Recordar al momento de la migracion, luego, borrar el campo id_producto_circulado de la tabla Producto_Edicion y Documento_Factura, este campo se dejo, para
poder vincular las tablas y realizar el join, entre Producto_Edicion y Pedidos , Producto_Edicion y Documento.

