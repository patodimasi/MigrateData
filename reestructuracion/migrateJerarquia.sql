/* INSERCIONES TIPO PRODUCTO
    Tabla: producto_tipos */
INSERT INTO producto_tipos(codigo, descripcion) VALUES ('DIA', 'Diarios');
INSERT INTO producto_tipos(codigo, descripcion) VALUES ('RVT', 'Revistas');
INSERT INTO producto_tipos(codigo, descripcion) VALUES ('OPC', 'Opcionales');



/* INSERCIONES CATEGORIA PRODUCTO
    Tabla: producto_categorias */
INSERT INTO producto_categorias(codigo, descripcion) VALUES ('LNA', 'Familia La Nación');
INSERT INTO producto_categorias(codigo, descripcion) VALUES ('POP', 'Familia Popular');
INSERT INTO producto_categorias(codigo, descripcion) VALUES ('HOL', 'Familia Hola');
INSERT INTO producto_categorias(codigo, descripcion) VALUES ('JAR', 'Familia Jardín');
INSERT INTO producto_categorias(codigo, descripcion) VALUES ('LIV', 'Familia Living');
INSERT INTO producto_categorias(codigo, descripcion) VALUES ('LUG', 'Familia Lugares');
INSERT INTO producto_categorias(codigo, descripcion) VALUES ('OHL', 'Familia Ohlalá');
INSERT INTO producto_categorias(codigo, descripcion) VALUES ('RST', 'Familia Rolling Stone');
INSERT INTO producto_categorias(codigo, descripcion) VALUES ('VER', 'Familia Vertice');
INSERT INTO producto_categorias(codigo, descripcion) VALUES ('TAP', 'Familia Tapas');
INSERT INTO producto_categorias(codigo, descripcion) VALUES ('SHT', 'One Shot');
INSERT INTO producto_categorias(codigo, descripcion) VALUES ('PLA', 'Opcionales Ed. Planeta');
INSERT INTO producto_categorias(codigo, descripcion) VALUES ('PRH', 'Pengüin Random House');
INSERT INTO producto_categorias(codigo, descripcion) VALUES ('GEN', 'Generico');



/* INSERCIONES SUBCATEGORIA PRODUCTO
    Tabla: producto_subcategorias */
INSERT INTO producto_subcategorias(codigo, descripcion) VALUES ('LUN', 'LUNES');
INSERT INTO producto_subcategorias(codigo, descripcion) VALUES ('MAR', 'MARTES');
INSERT INTO producto_subcategorias(codigo, descripcion) VALUES ('MIE', 'MIERCOLES');
INSERT INTO producto_subcategorias(codigo, descripcion) VALUES ('JUE', 'JUEVES');
INSERT INTO producto_subcategorias(codigo, descripcion) VALUES ('VIE', 'VIERNES');
INSERT INTO producto_subcategorias(codigo, descripcion) VALUES ('SAB', 'SABADO');
INSERT INTO producto_subcategorias(codigo, descripcion) VALUES ('DOM', 'DOMINGO');
INSERT INTO producto_subcategorias(codigo, descripcion) VALUES ('SEM', 'SEMANAL');
INSERT INTO producto_subcategorias(codigo, descripcion) VALUES ('QUI', 'QUINCENAL');
INSERT INTO producto_subcategorias(codigo, descripcion) VALUES ('MEN', 'MENSUAL');
INSERT INTO producto_subcategorias(codigo, descripcion) VALUES ('ANU', 'ANUARIO');
INSERT INTO producto_subcategorias(codigo, descripcion) VALUES ('BOK', 'BOOKAZINE');
INSERT INTO producto_subcategorias(codigo, descripcion) VALUES ('CAL', 'CALENDARIO');
INSERT INTO producto_subcategorias(codigo, descripcion) VALUES ('ESP', 'ESPECIAL');
INSERT INTO producto_subcategorias(codigo, descripcion) VALUES ('LIB', 'LIBRO');



/* INSERCIONES de las relaciones entre TIPO PRODUCTO y CATEGORIA PRODUCTO
    Tabla pivot: producto_categorias_producto_tipo_links
    Tablas origen: producto_tipos y producto_categorias */
INSERT INTO producto_categorias_producto_tipo_links (producto_categoria_id , producto_tipo_id) VALUES (1,1);
INSERT INTO producto_categorias_producto_tipo_links (producto_categoria_id , producto_tipo_id) VALUES (2,1);
INSERT INTO producto_categorias_producto_tipo_links (producto_categoria_id , producto_tipo_id) VALUES (3,2);
INSERT INTO producto_categorias_producto_tipo_links (producto_categoria_id , producto_tipo_id) VALUES (4,2);
INSERT INTO producto_categorias_producto_tipo_links (producto_categoria_id , producto_tipo_id) VALUES (5,2);
INSERT INTO producto_categorias_producto_tipo_links (producto_categoria_id , producto_tipo_id) VALUES (6,2);
INSERT INTO producto_categorias_producto_tipo_links (producto_categoria_id , producto_tipo_id) VALUES (7,2);
INSERT INTO producto_categorias_producto_tipo_links (producto_categoria_id , producto_tipo_id) VALUES (8,2);
INSERT INTO producto_categorias_producto_tipo_links (producto_categoria_id , producto_tipo_id) VALUES (9,3);
INSERT INTO producto_categorias_producto_tipo_links (producto_categoria_id , producto_tipo_id) VALUES (10,3);
INSERT INTO producto_categorias_producto_tipo_links (producto_categoria_id , producto_tipo_id) VALUES (11,3);
INSERT INTO producto_categorias_producto_tipo_links (producto_categoria_id , producto_tipo_id) VALUES (12,3);
INSERT INTO producto_categorias_producto_tipo_links (producto_categoria_id , producto_tipo_id) VALUES (13,3);
INSERT INTO producto_categorias_producto_tipo_links (producto_categoria_id , producto_tipo_id) VALUES (14,3);



/* INSERCIONES de las relaciones entre CATEGORIA PRODUCTO y SUBCATEGORIA PRODUCTO
    Tabla pivot: producto_categorias_producto_subcategorias_links 
    Tablas origen: producto_categorias y producto_subcategorias */
/* DIARIOS */
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (1,1);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (1,2);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (1,3);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (1,4);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (1,5);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (1,6);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (1,7);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (2,1);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (2,2);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (2,3);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (2,4);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (2,5);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (2,6);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (2,7);
/* REVISTAS */
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (3,8);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (3,9);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (3,10);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (3,11);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (3,12);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (3,13);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (3,14);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (3,15);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (4,8);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (4,9);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (4,10);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (4,11);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (4,12);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (4,13);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (4,14);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (4,15);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (5,8);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (5,9);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (5,10);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (5,11);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (5,12);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (5,13);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (5,14);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (5,15);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (6,8);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (6,9);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (6,10);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (6,11);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (6,12);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (6,13);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (6,14);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (6,15);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (7,8);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (7,9);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (7,10);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (7,11);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (7,12);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (7,13);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (7,14);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (7,15);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (8,8);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (8,9);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (8,10);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (8,11);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (8,12);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (8,13);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (8,14);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (8,15);
/* OPCIONALES */
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (9,8);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (9,9);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (9,10);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (10,8);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (10,9);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (10,10);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (11,8);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (11,9);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (11,10);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (12,8);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (12,9);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (12,10);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (13,8);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (13,9);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (13,10);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (14,8);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (14,9);
INSERT INTO producto_categorias_producto_subcategorias_links(producto_categoria_id, producto_subcategoria_id) values (14,10);