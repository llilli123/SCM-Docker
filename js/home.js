import { obtenerRecords, exportarRecordsTxt } from "./records.js";

function pintarRecords() {
  const r = obtenerRecords();
  document.querySelector("#record-reflex").textContent = r.reflex ? `${r.reflex.valor} ms` : "Sin récord";
  document.querySelector("#record-memory").textContent = r.memory ? `${r.memory.valor} movimientos` : "Sin récord";
  document.querySelector("#record-typing").textContent = r.typing ? `${r.typing.valor} PPM` : "Sin récord";
}

const mensaje = document.querySelector("#export-message");
document.querySelector("#download-records").addEventListener("click", () => {
  try {
    exportarRecordsTxt();
    mensaje.textContent = "Se ha solicitado la descarga de records.txt.";
  } catch (error) {
    mensaje.textContent = `No se pudo generar el TXT: ${error.message}`;
  }
});

pintarRecords();
window.addEventListener("pageshow", pintarRecords);
window.addEventListener("storage", pintarRecords);
window.addEventListener("miniarcade:records-updated", pintarRecords);