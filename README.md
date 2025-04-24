# Scripts para la migración de datos:  

**migrateProduct_qa**  
El archivo migrateProduct_qa, abarca las siguientes tablas: 
Producto, Producto_FamiliaProducto, Producto_Descripcion, Producto_TipoProducto, Producto_Circulado,Devolucion_ProductosFueraRediaf
APP_ProductosImagenes

*Se crean las siguientes tablas:  
Producto_Edicion : Viene de la union de las tablas Producto_Descripcion y Producto_Circulado y APP_ProductosImagenes


*Talas que tienen que quedar por el momento en Strapi y mysql:
productos, producto_tipo_productos, producto_familia_productos (APP_ProductosImagenes),producto_circulados,devolucion_productos_fuera_rediaf

*Tablas que van a tener que ser eliminadas: producto_familia_productos, producto_circulados, devolcuion_productos_fuera_rediaf




