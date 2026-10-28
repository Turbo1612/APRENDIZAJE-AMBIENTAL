let dataNormativa = null;
let moduloActual = null;
let indicePregunta = 0;
let aciertosSesion = 0;
let xpTotal = parseInt(localStorage.getItem('ecoley_xp')) || 0;

const mainContent = document.getElementById('main-content');
const xpDisplay = document.getElementById('xp-display');

function actualizarHeader() {
  xpDisplay.textContent = `⚡ ${xpTotal} XP`;
}

async function iniciarApp() {
  actualizarHeader();
  try {
    const res = await fetch('normativa.json');
    dataNormativa = await res.json();
    mostrarInicio();
  } catch (e) {
    mainContent.innerHTML = `<div class="card">Error al cargar normativa.json. Verifica que el archivo esté bien escrito.</div>`;
  }
}

function mostrarInicio() {
  let html = `<h2>Ruta de Especialización Ambiental</h2>`;
  dataNormativa.modulos.forEach((mod, idx) => {
    const completado = localStorage.getItem(`mod_completado_${mod.id}`) === 'true';
    html += `
      <div class="card">
        <span class="badge">${mod.categoria}</span>
        <h2>${mod.titulo}</h2>
        <p style="font-size:0.9rem; color:#475569;">${mod.preguntas.length} ejercicios prácticos + Resumen Normativo</p>
        <p style="font-size:0.85rem; font-weight:bold; color:${completado ? '#16a34a' : '#64748b'};">
          ${completado ? '✅ Módulo Superado' : '🔓 Disponible para estudiar'}
        </p>
        <button class="btn btn-secondary" onclick="verLeccion(${idx})">📖 1. Leer Resumen Normativo</button>
        <button class="btn btn-primary" onclick="iniciarPractica(${idx})">🎯 2. Entrenar (${mod.preguntas.length} preguntas)</button>
      </div>
    `;
  });
  mainContent.innerHTML = html;
}

function verLeccion(idx) {
  moduloActual = dataNormativa.modulos[idx];
  let html = `
    <span class="badge">Lección Rápida</span>
    <h2>${moduloActual.leccion.titulo}</h2>
  `;
  moduloActual.leccion.jerarquia.forEach(item => {
    html += `
      <div class="card law-item">
        <h4>${item.rango}</h4>
        <p><strong>Norma:</strong> ${item.norma}</p>
        <p>${item.aplicacion}</p>
      </div>
    `;
  });
  html += `
    <button class="btn btn-primary" onclick="iniciarPractica(${idx})">Ir a las Preguntas ➔</button>
    <button class="btn" style="background:#e2e8f0; color:#334155;" onclick="mostrarInicio()">⬅ Volver al Menú</button>
  `;
  mainContent.innerHTML = html;
}

function iniciarPractica(idx) {
  moduloActual = dataNormativa.modulos[idx];
  indicePregunta = 0;
  aciertosSesion = 0;
  mostrarPregunta();
}

function mostrarPregunta() {
  const total = moduloActual.preguntas.length;
  const p = moduloActual.preguntas[indicePregunta];
  const porcentaje = Math.round((indicePregunta / total) * 100);

  let opcionesHtml = '';
  p.opciones.forEach((op, i) => {
    opcionesHtml += `<button class="option-btn" id="opt-${i}" onclick="verificarRespuesta(${i})">${op}</button>`;
  });

  mainContent.innerHTML = `
    <div class="progress-bar"><div class="progress-fill" style="width:${porcentaje}%"></div></div>
    <span class="badge">${p.tipo} (${indicePregunta + 1}/${total})</span>
    <h2 style="font-size:1.1rem; line-height:1.4;">${p.pregunta}</h2>
    <div id="opciones-container">${opcionesHtml}</div>
    <div id="feedback" class="feedback-box"></div>
    <button id="btn-siguiente" class="btn btn-primary" style="display:none;" onclick="siguientePregunta()">Continuar ➔</button>
  `;
}

function verificarRespuesta(seleccion) {
  const p = moduloActual.preguntas[indicePregunta];
  const botones = document.querySelectorAll('.option-btn');
  botones.forEach(b => b.disabled = true);

  const feedback = document.getElementById('feedback');
  const btnSiguiente = document.getElementById('btn-siguiente');

  if (seleccion === p.correcta) {
    document.getElementById(`opt-${seleccion}`).classList.add('correct');
    aciertosSesion++;
    xpTotal += 10;
    localStorage.setItem('ecoley_xp', xpTotal);
    actualizarHeader();
    feedback.className = 'feedback-box feedback-ok';
    feedback.innerHTML = `<strong>¡Correcto! (+10 XP)</strong><br>${p.explicacion}`;
  } else {
    document.getElementById(`opt-${seleccion}`).classList.add('wrong');
    document.getElementById(`opt-${p.correcta}`).classList.add('correct');
    feedback.className = 'feedback-box feedback-err';
    feedback.innerHTML = `<strong>Respuesta incorrecta</strong><br>${p.explicacion}`;
  }

  feedback.style.display = 'block';
  btnSiguiente.style.display = 'block';
}

function siguientePregunta() {
  indicePregunta++;
  if (indicePregunta < moduloActual.preguntas.length) {
    mostrarPregunta();
  } else {
    finalizarModulo();
  }
}

function finalizarModulo() {
  const total = moduloActual.preguntas.length;
  localStorage.setItem(`mod_completado_${moduloActual.id}`, 'true');
  mainContent.innerHTML = `
    <div class="card" style="text-align:center;">
      <h2>🎉 ¡Sesión Completada!</h2>
      <p style="font-size:1.2rem;">Puntaje: <strong>${aciertosSesion} de ${total}</strong></p>
      <p>Tu progreso ha quedado guardado en tu celular.</p>
      <button class="btn btn-primary" onclick="mostrarInicio()">Volver al Inicio</button>
    </div>
  `;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

iniciarApp();
