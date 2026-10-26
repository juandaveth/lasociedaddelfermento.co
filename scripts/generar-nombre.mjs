/**
 * Convierte el nombre completo en vectores, para el logotipo horizontal.
 *
 *   node scripts/generar-nombre.mjs ruta/a/Anton-Regular.ttf
 *
 * Escribe src/lib/nombre.mjs. No lo edites a mano. El nombre va en Anton
 * como en el header, pero trazado: así el SVG que se manda a la imprenta
 * no depende de que allá tengan la fuente instalada. Solo hace falta
 * correrlo otra vez si cambia el texto o el tracking.
 *
 * La fuente se baja de https://github.com/google/fonts/tree/main/ofl/anton
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { create } from "fontkitten";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// En dos líneas, partido igual que el .lockup-nombre del header.
const LINEAS = ["LA SOCIEDAD", "DEL FERMENTO"];
// Alto de mayúscula en unidades de la marca: el mismo 28 de la retícula
// de la sigla, para que nombre y letras compartan escala.
const ALTO = 28;
// El mismo letter-spacing y line-height del .lockup-nombre del header.
const TRACKING = 0.01;
const INTERLINEA = 1;

const ruta = process.argv[2];
if (!ruta) {
  console.error("Uso: node scripts/generar-nombre.mjs ruta/a/Anton-Regular.ttf");
  process.exit(1);
}

const fuente = create(await readFile(ruta));
const esc = ALTO / fuente.capHeight;
const r = (n) => +n.toFixed(2);

// Distancia entre bases: line-height 1, o sea un cuerpo de la fuente.
const salto = INTERLINEA * fuente.unitsPerEm * esc;

const trazos = [];
let ancho = 0;
LINEAS.forEach((texto, i) => {
  const glifos = fuente.glyphsForString(texto);
  const base = ALTO + i * salto;
  // Arranca sin el margen izquierdo de la primera letra, para que la caja
  // empiece en la tinta y no en el aire.
  let x = -glifos[0].bbox.minX * esc;
  for (const glifo of glifos) {
    // La fuente dibuja con la y hacia arriba y el SVG hacia abajo: se
    // voltea y se baja hasta la base de la línea.
    const p = glifo.path.mapPoints((px, py) => [r(x + px * esc), r(base - py * esc)]);
    if (p.commands.length) trazos.push(p.toSVG());
    x += glifo.advanceWidth * esc + TRACKING * fuente.unitsPerEm * esc;
  }
  // Sin el tracking que queda colgando después de la última letra.
  const ultimo = glifos.at(-1);
  ancho = Math.max(ancho, x - TRACKING * fuente.unitsPerEm * esc - (ultimo.advanceWidth - ultimo.bbox.maxX) * esc);
});
ancho = r(ancho);
const alto = r(ALTO + (LINEAS.length - 1) * salto);

const salida = `// Generado por scripts/generar-nombre.mjs. No editar a mano.
// "${LINEAS.join(" / ")}" en Anton, trazado. Mayúsculas de ${ALTO} de alto.

export const NOMBRE = {
  d: "${trazos.join("")}",
  ancho: ${ancho},
  alto: ${alto},
};
`;

await writeFile(join(raiz, "src", "lib", "nombre.mjs"), salida, "utf8");
console.log(`  src/lib/nombre.mjs  (${ancho} × ${alto})`);
