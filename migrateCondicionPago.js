const fs = require('fs');
const path = require('path');
const readline = require('readline');

const filePath = path.join('C:', 'Users', 'pdimasi', 'OneDrive - S.A. La Nacion', 'Documentos', 'script_condicion_pago.sql');
const outputPath = path.join('C:', 'Users', 'pdimasi', 'OneDrive - S.A. La Nacion', 'Documentos', 'script_modifcondicion_pago.sql');

const rl = readline.createInterface({
    input: fs.createReadStream(filePath, { encoding: 'utf8' }),
    crlfDelay: Infinity
});

const columnMap = {
    IdTipoCliente: "tipo_cliente",
    CondicionPago: "condicion_pago",
    IdCliente: "agente"
};

const excludeColumns = new Set([
    "DiasDevolucion",
    "DesdeFactura",
    "DesdeCirculacion",
    "IdEstado",
    "CreadoFecha",
    "ProcesadoFecha",
    "ProcesadoTexto",
]);

const output = fs.createWriteStream(outputPath, { encoding: 'utf8' });

rl.on('line', (line) => {
    const modifiedLine = line
        .replace(/\[dbo\]\s*\./g, '')
        .replace(/\[/g, '')
        .replace(/\]/g, '')
        .replace(/N'([^']*)'/g, "'$1'")
        .replace(/CAST\(/g, '')
        .replace(/ AS DateTime\)/g, '')
        .replace(/^SET IDENTITY_INSERT\s+\S+\s+(ON|OFF)\s*;?/gm, '')
        .replace(/^\s*GO\s*$/gm, '')
        .replace(/USE\s+\[(.*?)\]/g, 'USE $1;')
        .replace(/(\d+\.\d+)\s+AS Decimal\(\d+,\s*\d+\)\s*\)/g, '$1')
        .replace(/(?<=[^' ])''(?=[^' ])/g, '');

    const match = modifiedLine.match(/INSERT\s+(\w+)\s*\(([^)]+)\)\s+VALUES\s*\((.+)\)/);

    if (match) {
        let columns = match[2].split(',').map(col => col.trim());
        let values = match[3].match(/'[^']*'|[^, ]+/g).map(v => v.trim());

        let tipo_cliente, agente, condicion_pago;
        let tipo, categoria, subcategoria;

        columns.forEach((col, index) => {
            if (!excludeColumns.has(col)) {
                if (col === "JerarquiaProducto") {
                    const jerarquia = values[index].replace(/'/g, "");

                    if (jerarquia.length === 6) {
                        // ej: OPCSEM → tipo=OPC, cat=SEM
                        tipo = jerarquia.substring(0, 3);
                        let cat = jerarquia.substring(3, 6);

                        // Reglas especiales
                        if (["QUI", "SEM", "MEN"].includes(cat)) {
                            categoria = "GEN";
                            subcategoria = cat;
                        } else {
                            categoria = cat;
                            subcategoria = null;
                        }
                    } else {
                        // ej: RVTHOLSEM → tipo=RVT, cat=HOL, sub=SEM
                        tipo = jerarquia.substring(0, 3);
                        categoria = jerarquia.substring(3, 6);
                        subcategoria = jerarquia.substring(6);
                    }
                } else {
                    const newCol = columnMap[col];
                    if (newCol === "tipo_cliente") tipo_cliente = values[index].replace(/'/g, "");
                    if (newCol === "agente") {
                        
                    agente = values[index]
                        .replace(/'/g, "")   // quita comillas
                        .replace(/^Y0*/, ''); // quita la Y inicial y todos los ceros que siguen
                    }
                    if (newCol === "condicion_pago") condicion_pago = values[index].replace(/'/g, "");
                }
            }
        });
        // Armamos el INSERT de salida
        const insertSQL = `INSERT INTO condicion_de_pagos (tipo_cliente, tipo_producto_tmp, categoria_tmp, subcategoria_tmp, sku_tmp, agente_tmp, condicion_pago) VALUES ('${tipo_cliente}', '${tipo}', '${categoria}', '${subcategoria || ""}', NULL, '${agente}', '${condicion_pago}');\n`;
        output.write(insertSQL);
    }
});

rl.on('close', () => {
    output.write("\nSET SQL_SAFE_UPDATES = 0;\n");
    output.write("UPDATE condicion_de_pagos SET published_at = now();\n");

    output.write(`
        INSERT INTO condicion_de_pagos_tipo_producto_links (condicion_de_pago_id, producto_tipo_id)
        SELECT cp.id, ptipo.id
        FROM producto_tipos ptipo
        JOIN condicion_de_pagos cp ON cp.tipo_producto_tmp = ptipo.codigo;

        INSERT INTO condicion_de_pagos_categoria_links (condicion_de_pago_id, producto_categoria_id)
        SELECT cp.id, pcateg.id
        FROM producto_categorias pcateg
        JOIN condicion_de_pagos cp ON cp.categoria_tmp = pcateg.codigo;
       
        INSERT INTO condicion_de_pagos_subcategoria_links (condicion_de_pago_id, producto_subcategoria_id)
        SELECT cp.id, psubcateg.id
        FROM producto_subcategorias psubcateg
        JOIN condicion_de_pagos cp ON cp.subcategoria_tmp = psubcateg.codigo;

        INSERT INTO condicion_de_pagos_agente_links (condicion_de_pago_id, agente_id)
        SELECT cp.id, a.id
        FROM agentes a
        JOIN condicion_de_pagos cp ON cp.agente_tmp = a.id_agente;
    `);

    console.log("Archivo generado en:", outputPath);
    
});
