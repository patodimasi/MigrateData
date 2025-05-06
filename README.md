# Scripts para la migración de datos:  

**migrateProduct_qa**  
El archivo migrateProduct_qa, abarca las siguientes tablas: 
Producto, Producto_FamiliaProducto, Producto_Descripcion, Producto_TipoProducto, Producto_Circulado,Devolucion_ProductosFueraRediaf
APP_ProductosImagenes  (SQL_SERVER)

*Se crean las siguientes tablas:  
Producto_Edicion : Viene de la union de las tablas Producto_Descripcion y Producto_Circulado y APP_ProductosImagenes


*Talas que tienen que quedar por el momento en Strapi y mysql:
productos, producto_tipo_productos, producto_familia_productos (APP_ProductosImagenes),producto_circulados,devolucion_productos_fuera_rediaf, canillas, canilla_motivos

*Tablas que van a tener que ser eliminadas: producto_familia_productos, producto_circulados, devolcuion_productos_fuera_rediaf, canilla_matricula, APP_Canillas, APP_CanillasAdicional, APP_CanillasMotivos

**migratePedido**
El archivo migratePedido, abarca las siguientes tablas:
Reposicion, Producto_Asignado, Reposicion_EstadoReposicion  (SQL_SERVER)

*Se crean las siguientes talas en strapi:
Pedido: Viene de la union de Producto_Asignado  (Para los pedidos QDES), Producto_Circulado,
Producto_Edicion  (En el primer insert)
Pedido: Viene de la union de Reposicion (Para los pedidos de Repo), Producto_Circulado, Producto_Edicion, Pedido_Estado (En el segundo insert)
Pedido_Estado: se le cambio el nombre a la tala que venia de SQL Reposicion_EstadoReposicion

*Tablas que tienen que quedar en strapi y mysql:
Pedidos,Pedidos_Estados

*Talas que van a tener que ser eliminadas:
Producto_Asignado, Reposicion, Producto_Circulado