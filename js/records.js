/**
 * Módulo compartido de récords. Integrante 1.
 * Los integrantes 2 y 3 IMPORTAN estas funciones, no modifican este archivo.
 * Los datos son locales a cada navegador, no están alojados en el servidor.
 */
const CLAVE = "miniArcade:records:v1";
const REGLAS = { reflex: "menor", memory: "menor", typing: "mayor" };

/** @returns {Record<string, {valor: number, detalles: object, fecha: string}>} */
export function obtenerRecords() {
  try {
    const data = JSON.parse(localStorage.getItem(CLAVE) || "{}");
    return data && typeof data === "object" && !Array.isArray(data) ? data : {};
  } catch {
    return {};
  }
}

/**
 * Guarda solo un resultado mejor que el anterior.
 * @param {'reflex'|'memory'|'typing'} juego
 * @param {number} valor - ms para reflex, movimientos para memory, PPM para typing.
 * @param {object} detalles - typing puede pasar {precision: 95}.
 * @returns {boolean} true si se estableció un nuevo récord.
 */
export function guardarRecord(juego, valor, detalles = {}) {
  if (!Object.hasOwn(REGLAS, juego)) throw new Error("Nombre de juego no válido.");
  const numero = Number(valor);
  if (!Number.isFinite(numero) || numero <= 0) throw new Error("El récord debe ser positivo.");
  if (juego === "memory" && !Number.isInteger(numero)) throw new Error("Los movimientos deben ser enteros.");
  if (juego === "typing" && detalles.precision !== undefined &&
      (!Number.isFinite(detalles.precision) || detalles.precision < 0 || detalles.precision > 100)) {
    throw new Error("La precisión debe estar entre 0 y 100.");
  }
  const records = obtenerRecords();
  const previo = Number(records[juego]?.valor);
  const tienePrevio = Number.isFinite(previo) && previo > 0;
  const mejora = !tienePrevio || (REGLAS[juego] === "menor" ? numero < previo : numero > previo);
  if (!mejora) return false;
  records[juego] = { valor: numero, detalles: { ...detalles }, fecha: new Date().toISOString() };
  localStorage.setItem(CLAVE, JSON.stringify(records));
  window.dispatchEvent(new CustomEvent("miniarcade:records-updated"));
  return true;
}

/** Genera un archivo físico descargable en el equipo del jugador. */
export function exportarRecordsTxt() {
  const r = obtenerRecords();
  const reflex = r.reflex ? `${r.reflex.valor} ms` : "Sin récord";
  const memory = r.memory ? `${r.memory.valor} movimientos` : "Sin récord";
  const typing = r.typing
    ? `${r.typing.valor} PPM${Number.isFinite(r.typing.detalles?.precision) ? ` | Precisión: ${r.typing.detalles.precision}%` : ""}`
    : "Sin récord";
  const txt = [
    "MINI ARCADE - RÉCORDS PERSONALES",
    "================================",
    `Reflex Challenge: ${reflex}`,
    `Memory Match: ${memory}`,
    `Typing Speed: ${typing}`,
    "================================",
    `Generado: ${new Date().toLocaleString("es-DO")}`,
    "Datos guardados localmente en este navegador."
  ].join("\r\n");
  const archivo = new Blob(["\uFEFF", txt], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(archivo);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = "records.txt";
  document.body.append(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}