/**
 * Exporta la marca LSDF a PNG con fondo transparente.
 *
 *   node scripts/exportar-marca.mjs                  → sello, negro
 *   node scripts/exportar-marca.mjs frasco bloque    → esas variantes
 *   node scripts/exportar-marca.mjs sello --crema    → versión clara
 *
 * Los archivos salen en public/marca/, así que quedan descargables en
 * lasociedaddelfermento.co/marca/<archivo> apenas se despliegue. La
 * geometría viene de src/lib/marca.mjs, la misma que usa el sitio, así
 * que un PNG exportado nunca se desfasa del logo real.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { svgMarca, VARIANTES } from "../src/lib/marca.mjs";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const destino = join(raiz, "public", "marca");

const TINTAS = {
  negro: { hex: "#1a1610", sufijo: "negro" },
  crema: { hex: "#f5eedc", sufijo: "crema" },
};

// Tamaños útiles: avatar de Instagram, favicon grande, e impresión.
const ANCHOS = [2048, 512, 128];

const args = process.argv.slice(2);
const tinta = args.includes("--crema") ? TINTAS.crema : TINTAS.negro;
const pedidas = args.filter((a) => !a.startsWith("--"));
const variantes = pedidas.length ? pedidas : ["sello"];

const desconocida = variantes.find((v) => !VARIANTES.includes(v));
if (desconocida) {
  console.error(
    `Variante desconocida: "${desconocida}". Opciones: ${VARIANTES.join(", ")}`
  );
  process.exit(1);
}

await mkdir(destino, { recursive: true });

for (const variante of variantes) {
  // El SVG vectorial también, por si lo necesita en Illustrator o Figma.
  const svg = svgMarca(variante, { color: tinta.hex });
  const nombreSvg = `lsdf-${variante}-${tinta.sufijo}.svg`;
  await writeFile(join(destino, nombreSvg), svg + "\n", "utf8");
  console.log(`  marca/${nombreSvg}`);

  for (const ancho of ANCHOS) {
    // Se rasteriza desde un SVG ya dimensionado, no con .resize(), para
    // que los trazos finos salgan nítidos y no interpolados.
    const grande = svgMarca(variante, { color: tinta.hex, ancho });
    const nombre = `lsdf-${variante}-${tinta.sufijo}-${ancho}.png`;
    await sharp(Buffer.from(grande)).png({ compressionLevel: 9 }).toFile(
      join(destino, nombre)
    );
    console.log(`  marca/${nombre}`);
  }
}

console.log(`\nListo. ${variantes.length} variante(s) en ${destino}`);
