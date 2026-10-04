"use strict";

/* ------------------------------------------------------------
   Para agregar un proyecto nuevo, añade un objeto a esta lista.
   "tipo" puede ser "Juego", "Enlace" o cualquier otro texto.
   ------------------------------------------------------------ */
const PROYECTOS = [
  {
    titulo: "Juego Limones",
    tipo: "Juego",
    descripcion: "Juego interactivo con limones.",
    url: "https://juego-limones-mocha.vercel.app/",
  },
  {
    titulo: "Juego Cazando",
    tipo: "Juego",
    descripcion: "Juego de cazar limones.",
    url: "https://juegocazando-lemon.vercel.app/cazando.html",
  },
  {
    titulo: "Google",
    tipo: "Enlace",
    descripcion: "Enlace de prueba a Google.",
    url: "https://www.google.com",
  },
];

const ICONO_ABRIR =
  '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" ' +
  'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<path d="M7 17 17 7M8 7h9v9"/></svg>';

const ICONO_COPIAR =
  '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" ' +
  'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<rect x="8" y="8" width="14" height="14" rx="2"/>' +
  '<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';

const lista = document.getElementById("proyectos");
const buscador = document.getElementById("buscar");
const conteo = document.getElementById("conteo");
const vacio = document.getElementById("vacio");
const estado = document.getElementById("estado");

const filas = [];
let temporizadorEstado = null;

/* Quita tildes y mayúsculas para comparar textos */
function normalizar(texto) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/* Mensaje temporal en la barra de estado */
function avisar(mensaje) {
  estado.textContent = mensaje;
  clearTimeout(temporizadorEstado);
  temporizadorEstado = setTimeout(function () {
    estado.textContent = "";
  }, 2200);
}

function copiarTexto(texto) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(texto);
  }
  return new Promise(function (resolver, rechazar) {
    const area = document.createElement("textarea");
    area.value = texto;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    const copiado = document.execCommand("copy");
    area.remove();
    if (copiado) {
      resolver();
    } else {
      rechazar(new Error("No se pudo copiar"));
    }
  });
}

function crearFila(proyecto, indice) {
  const item = document.createElement("li");
  item.className = "ln";
  item.style.setProperty("--i", indice + 3);

  const enlace = document.createElement("a");
  enlace.className = "fila";
  enlace.href = proyecto.url;
  enlace.target = "_blank";
  enlace.rel = "noopener noreferrer";
  enlace.setAttribute(
    "aria-label",
    proyecto.titulo + ", " + proyecto.tipo + " (se abre en una pestaña nueva)"
  );

  const titulo = document.createElement("span");
  titulo.className = "fila-titulo";
  titulo.textContent = proyecto.titulo;

  const accion = document.createElement("span");
  accion.className = "fila-accion";

  const tipo = document.createElement("span");
  tipo.className = "fila-tipo";
  tipo.dataset.tipo = normalizar(proyecto.tipo);
  tipo.textContent = proyecto.tipo.toLowerCase();

  const icono = document.createElement("span");
  icono.className = "fila-icono";
  icono.innerHTML = ICONO_ABRIR;

  accion.append(tipo, icono);

  const descripcion = document.createElement("span");
  descripcion.className = "fila-desc";
  descripcion.textContent = proyecto.descripcion;

  enlace.append(titulo, accion, descripcion);

  const copiar = document.createElement("button");
  copiar.type = "button";
  copiar.className = "copiar";
  copiar.title = "Copiar enlace";
  copiar.setAttribute("aria-label", "Copiar el enlace de " + proyecto.titulo);
  copiar.innerHTML = ICONO_COPIAR;
  copiar.addEventListener("click", function () {
    copiarTexto(proyecto.url).then(
      function () { avisar("Enlace copiado: " + proyecto.titulo); },
      function () { avisar("No se pudo copiar el enlace"); }
    );
  });

  item.append(enlace, copiar);

  filas.push({
    elemento: item,
    texto: normalizar(proyecto.titulo + " " + proyecto.tipo + " " + proyecto.descripcion),
  });
  return item;
}

/* Muestra solo los proyectos que coinciden con lo escrito */
function filtrar() {
  const termino = buscador.value.trim();
  const consulta = normalizar(termino);
  let visibles = 0;

  filas.forEach(function (fila) {
    const coincide = consulta === "" || fila.texto.includes(consulta);
    fila.elemento.hidden = !coincide;
    if (coincide) {
      visibles += 1;
    }
  });

  if (consulta === "") {
    conteo.textContent = filas.length + (filas.length === 1 ? " proyecto" : " proyectos");
  } else {
    conteo.textContent = visibles + " de " + filas.length;
  }

  vacio.hidden = visibles > 0;
  vacio.textContent = '// sin resultados para "' + termino + '"';
}

function enlacesVisibles() {
  return Array.from(lista.querySelectorAll("li:not([hidden]) .fila"));
}

function manejarTeclado(evento) {
  const enCampo = evento.target === buscador;

  if (evento.key === "/" && !enCampo && !evento.ctrlKey && !evento.metaKey && !evento.altKey) {
    evento.preventDefault();
    buscador.focus();
    buscador.select();
    return;
  }

  if (evento.key === "Escape" && enCampo) {
    buscador.value = "";
    filtrar();
    buscador.blur();
    return;
  }

  if (evento.key !== "ArrowDown" && evento.key !== "ArrowUp") {
    return;
  }

  const enlaces = enlacesVisibles();
  if (enlaces.length === 0) {
    return;
  }

  if (enCampo) {
    if (evento.key === "ArrowDown") {
      evento.preventDefault();
      enlaces[0].focus();
    }
    return;
  }

  const posicion = enlaces.indexOf(document.activeElement);
  if (posicion === -1) {
    return;
  }

  evento.preventDefault();
  if (evento.key === "ArrowDown") {
    enlaces[Math.min(posicion + 1, enlaces.length - 1)].focus();
  } else if (posicion === 0) {
    buscador.focus();
  } else {
    enlaces[posicion - 1].focus();
  }
}

function iniciar() {
  PROYECTOS.forEach(function (proyecto, indice) {
    lista.append(crearFila(proyecto, indice));
  });

  filtrar();
  buscador.addEventListener("input", filtrar);
  document.addEventListener("keydown", manejarTeclado);
  document.getElementById("anio").textContent = new Date().getFullYear();

  /* La animación de entrada se ejecuta una sola vez */
  document.body.classList.add("entrada");
  setTimeout(function () {
    document.body.classList.remove("entrada");
  }, 1500);
}

iniciar();