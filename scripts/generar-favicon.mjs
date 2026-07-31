/**
 * Genera el favicon a partir de la marca.
 *
 *   node scripts/generar-favicon.mjs
 *
 * Escribe public/favicon.svg y public/favicon.ico. No los edites a mano:
 * la geometría sale de src/lib/marca.mjs, la misma que usa el sitio, así
 * que el favicon no se puede desfasar del logo.
 *
 * Usa la variante `avatar`, es decir el sello sin el aro. Sobre un fondo
 * circular el aro dibuja una segunda línea pegada al borde del círculo y
 * a 16px las dos se funden en una banda sucia. El borde del círculo ya
 * hace de aro. Es el mismo criterio del avatar de Instagram.
 */
import { writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { contenido } from "../src/lib/marca.mjs";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publico = join(raiz, "public");

const MOSTAZA = "#e6ab1e";
const TINTA = "#1a1610";

const svg = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill-rule="evenodd">',
  "<title>La Sociedad del Fermento</title>",
  `<circle cx="60" cy="60" r="60" fill="${MOSTAZA}"/>`,
  `<g fill="${TINTA}" color="${TINTA}">${contenido("avatar")}</g>`,
  "</svg>",
].join("");

await writeFile(join(publico, "favicon.svg"), svg + "\n", "utf8");
console.log("  public/favicon.svg");

// Respaldo para navegadores que piden /favicon.ico directo. El archivo
// que había era el PNG por defecto de Astro y nunca se tocó.
await sharp(Buffer.from(svg.replace('viewBox="0 0 120 120"', 'width="32" height="32" viewBox="0 0 120 120"')))
  .png({ compressionLevel: 9 })
  .toFile(join(publico, "favicon.ico"));
console.log("  public/favicon.ico  (PNG 32x32)");
