import { obtenerRecords, guardarRecord } from "../../js/records.js";

const arena = document.querySelector("#arena");
const titulo = document.querySelector("#arena-title");
const detalle = document.querySelector("#arena-detail");
const icono = document.querySelector("#arena-icon");
const mensaje = document.querySelector("#status-message");
const botonInicio = document.querySelector("#start-btn");
const mejorTiempo = document.querySelector("#best-time");
const ultimoTiempo = document.querySelector("#last-time");
const ultimoMensaje = document.querySelector("#last-message");

let estado = "idle";   // idle | waiting | ready | early | result
let temporizador = null;
let inicioVerde = 0;

function cambiarEstado(nuevoEstado, texto, explicacion, simbolo) {
  estado = nuevoEstado;
  arena.dataset.state = nuevoEstado;
  titulo.textContent = texto;
  detalle.textContent = explicacion;
  icono.textContent = simbolo;
}

function mostrarRecord() {
  const r = obtenerRecords().reflex;
  mejorTiempo.textContent = r ? `${r.valor} ms` : "Sin récord";
}

function comenzar() {
  if (temporizador !== null) clearTimeout(temporizador);
  inicioVerde = 0;
  cambiarEstado("waiting", "ESPERA EL VERDE...", "No pulses todavía. El color cambiará en cualquier momento.", "●");
  mensaje.textContent = "Partida en curso: espera la señal.";
  botonInicio.textContent = "REINICIAR ↻";

  const espera = 1500 + Math.random() * 2500; // Entre 1,5 y 4 segundos.
  temporizador = setTimeout(() => {
    temporizador = null;
    cambiarEstado("ready", "¡AHORA!", "Haz clic o toca el panel lo antes posible.", "⚡");
    inicioVerde = performance.now();
    mensaje.textContent = "¡Pulsa ahora!";
  }, espera);
}

function prematuro() {
  if (temporizador !== null) clearTimeout(temporizador);
  temporizador = null;
  cambiarEstado("early", "¡DEMASIADO PRONTO!", "Pulsaste antes de ver el verde. Inténtalo otra vez.", "✕");
  ultimoTiempo.textContent = "—";
  ultimoMensaje.textContent = "Clic prematuro";
  mensaje.textContent = "La partida no cuenta. Inicia una nueva ronda.";
  botonInicio.textContent = "INTENTAR DE NUEVO ↻";
}

function finalizar() {
  const milisegundos = Math.max(1, Math.round(performance.now() - inicioVerde));
  inicioVerde = 0;
  const mejoro = guardarRecord("reflex", milisegundos);
  cambiarEstado("result", `${milisegundos} ms`, mejoro ? "¡NUEVO RÉCORD PERSONAL!" : "Buen intento. ¿Puedes superarlo?", "✓");
  ultimoTiempo.textContent = `${milisegundos} ms`;
  ultimoMensaje.textContent = mejoro ? "Nuevo récord personal" : "Sigue intentando";
  botonInicio.textContent = "JUGAR OTRA VEZ ↻";
  mensaje.textContent = mejoro ? "Tu nueva marca se guardó en este navegador." : "Puedes repetir la partida cuando quieras.";
  mostrarRecord();
}

arena.addEventListener("click", () => {
  if (estado === "waiting") prematuro();
  else if (estado === "ready") finalizar();
  else comenzar();
});
botonInicio.addEventListener("click", comenzar);

// Evita contabilizar un tiempo falso si cambias de pestaña durante el intento.
document.addEventListener("visibilitychange", () => {
  if (!document.hidden || (estado !== "waiting" && estado !== "ready")) return;
  if (temporizador !== null) clearTimeout(temporizador);
  temporizador = null;
  inicioVerde = 0;
  cambiarEstado("idle", "PARTIDA CANCELADA", "Cambiaste de pestaña. Inicia otra ronda.", "↻");
  mensaje.textContent = "La partida se canceló al salir de la pestaña.";
  botonInicio.textContent = "INICIAR PARTIDA ↗";
});

mostrarRecord();