/**
 * Geometría de la marca LSDF.
 *
 * Fuente única: la usan tanto el componente Marca.astro (para el sitio)
 * como scripts/exportar-marca.mjs (para los PNG). Si se toca un trazo
 * aquí, cambian los dos a la vez. Nunca dupliques estos paths.
 *
 * Retícula de las letras: caja de 28 de alto, letra de 18 de ancho,
 * asta de 6, calle de 3. Dibujadas a mano, no compuestas en Anton, para
 * que el logo no dependa de que cargue una webfont.
 */

export const LETRAS = [
  // L
  "M0 0 H6 V22 H17 V28 H0 Z",
  // S
  "M18 0 H0 V17 H12 V22 H0 V28 H18 V11 H6 V6 H18 Z",
  // D
  "M0 0 H11 C15.5 0 18 3 18 8 V20 C18 25 15.5 28 11 28 H0 Z M6 6 V22 H10 C11.5 22 12 20.5 12 18.5 V9.5 C12 7.5 11.5 6 10 6 Z",
  // F
  "M0 0 H18 V6 H6 V11 H15.5 V17 H6 V28 H0 Z",
];

/** Coloca las cuatro letras en 2×2. */
const bloque2x2 = (esc) =>
  LETRAS.map(
    (d, i) =>
      `<path d="${d}" transform="translate(${(i % 2) * 21} ${Math.floor(i / 2) * 31})"/>`
  ).join("");

/**
 * Anillo de burbujas del sello. Valores escogidos a mano, no generados
 * con una fórmula: un ciclo regular de ángulos y radios se lee como una
 * máquina. Cada burbuja tiene su tamaño y su distancia al centro.
 */
const ANILLO = [
  { ang: 2, dist: 47, r: 4.2 },
  { ang: 29, dist: 45, r: 2.0 },
  { ang: 53, dist: 48, r: 3.1 },
  { ang: 79, dist: 44.5, r: 1.7 },
  { ang: 104, dist: 47, r: 3.8 },
  { ang: 131, dist: 45.5, r: 2.4 },
  { ang: 157, dist: 48, r: 1.6 },
  { ang: 182, dist: 46, r: 4.4 },
  { ang: 208, dist: 44.5, r: 2.2 },
  { ang: 233, dist: 47.5, r: 3.3 },
  { ang: 259, dist: 45, r: 1.8 },
  { ang: 284, dist: 47, r: 2.9 },
  { ang: 310, dist: 44.5, r: 3.6 },
  { ang: 336, dist: 47.5, r: 2.1 },
];

export const BURBUJAS_SELLO = ANILLO.map((b) => {
  const rad = (b.ang * Math.PI) / 180;
  return {
    cx: +(60 + b.dist * Math.cos(rad)).toFixed(2),
    cy: +(60 + b.dist * Math.sin(rad)).toFixed(2),
    r: b.r,
  };
});

/**
 * Frasco de fermentación. Dos trazos y nada más: silueta del vidrio y
 * tapa. Sin alambre de cierre ni empaque, porque a tamaño pequeño ese
 * detalle se vuelve ruido.
 */
export const FRASCO = {
  vidrio:
    "M28 22 V31 Q28 37 22 42 Q18 46 18 53 V112 Q18 123 29 123 H61 Q72 123 72 112 V53 Q72 46 68 42 Q62 37 62 31 V22",
  tapa: "M26 12 H66 Q68 12 68 14 V20 Q68 22 66 22 H26 Q24 22 24 20 V14 Q24 12 26 12 Z",
};

export const BURBUJAS_FRASCO = [
  { cx: 23, cy: 66, r: 2.6 },
  { cx: 23, cy: 96, r: 1.8 },
  { cx: 67, cy: 74, r: 3.0 },
  { cx: 67, cy: 102, r: 2.1 },
  { cx: 45, cy: 48, r: 2.3 },
];

export const VARIANTES = ["sello", "avatar", "bloque", "fila", "frasco"];

export const VIEW_BOX = {
  fila: "0 0 81 28",
  bloque: "0 0 39 59",
  sello: "0 0 120 120",
  avatar: "0 0 120 120",
  frasco: "0 0 90 130",
};

/** Devuelve el interior del <svg> para una variante. */
export function contenido(variante) {
  switch (variante) {
    case "fila":
      return LETRAS.map(
        (d, i) => `<path d="${d}" transform="translate(${i * 21} 0)"/>`
      ).join("");

    case "bloque":
      return bloque2x2();

    case "sello":
      return [
        '<circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" stroke-width="2.5"/>',
        contenido("avatar"),
      ].join("");

    // El sello sin el aro. Para el avatar de Instagram, donde el círculo
    // de fondo ya hace de borde y el aro solo duplicaría esa línea.
    case "avatar":
      return [
        BURBUJAS_SELLO.map(
          (b) => `<circle cx="${b.cx}" cy="${b.cy}" r="${b.r}"/>`
        ).join(""),
        `<g transform="translate(40.5 30.5)">${bloque2x2()}</g>`,
      ].join("");

    case "frasco":
      return [
        '<g fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">',
        `<path d="${FRASCO.vidrio}"/><path d="${FRASCO.tapa}"/>`,
        "</g>",
        BURBUJAS_FRASCO.map(
          (b) =>
            `<circle cx="${b.cx}" cy="${b.cy}" r="${b.r}" fill="none" stroke="currentColor" stroke-width="1.6" opacity="0.6"/>`
        ).join(""),
        `<g transform="translate(28.4 59.9) scale(0.85)">${bloque2x2()}</g>`,
      ].join("");

    default:
      throw new Error(`Variante de marca desconocida: ${variante}`);
  }
}

/**
 * SVG completo y autónomo, para exportar a PNG u otro formato.
 *
 * Sin `fondo` el PNG queda con transparencia. Con `fondo` se pinta un
 * rectángulo a sangre: es lo que necesita una foto de perfil de
 * Instagram, que no admite transparencia y recorta en círculo.
 */
export function svgMarca(variante, { color = "#1a1610", ancho, fondo } = {}) {
  const vb = VIEW_BOX[variante];
  if (!vb) throw new Error(`Variante de marca desconocida: ${variante}`);

  const [, , w, h] = vb.split(" ").map(Number);
  const anchoFinal = ancho ?? w;
  const altoFinal = Math.round((anchoFinal * h) / w);

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"`,
    ` width="${anchoFinal}" height="${altoFinal}"`,
    ` fill="${color}" fill-rule="evenodd" color="${color}">`,
    fondo ? `<rect x="0" y="0" width="${w}" height="${h}" fill="${fondo}"/>` : "",
    contenido(variante),
    "</svg>",
  ].join("");
}
