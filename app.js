let dataNormativa = null;
let preguntasSesion = [];
let moduloActual = null;
let indicePregunta = 0;
let aciertosSesion = 0;
let PREGUNTAS_POR_SESION = 5; // Saca 5 al azar en cada partida rápida para que siempre varíen

let xpTotal = parseInt(localStorage.getItem('ecoley_xp')) || 0;
let vidas = parseInt(localStorage.getItem('ecoley_vidas') ?? '5');
let racha = parseInt(localStorage.getItem('ecoley_racha')) || 0;
let preguntasFalladas = JSON.parse(localStorage.getItem('ecoley_falladas') || '[]');
let preguntasVistas = JSON.parse(localStorage.getItem('ecoley_vistas') || '[]');

const mainContent = document.getElementById('main-content');

function verificarRachaDiaria() {
  const hoy = new Date().toISOString().split('T')[0];
  const ultimaFecha = localStorage.getItem('ecoley_ultima_fecha');
  
  if (ultimaFecha !== hoy) {
    // Nuevo día: recargamos las 5 vidas automáticamente
    vidas = 5;
    localStorage.setItem('ecoley_vidas', vidas);
  }
}

function registrarActividadRacha() {
  const hoy = new Date().toISOString().split('T')[0];
  const ultimaFecha = localStorage.getItem('ecoley_ultima_fecha');
  if (ultimaFecha === hoy) return;

  const ayer = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (ultimaFecha === ayer) {
    racha++;
  } else {
    racha = 1;
  }
  localStorage.setItem('ecoley_racha', racha);
  localStorage.setItem('ecoley_ultima_fecha', hoy);
  actualizarHeader();
}

function actualizarHeader() {
  document.getElementById('xp-display').textContent = `⚡ ${xpTotal}`;
  document.getElementById('lives-display').textContent = `❤️ ${vidas}`;
  document.getElementById('streak-display').textContent = `🔥 ${racha}`;
}

function mezclarArray(arr) {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

async function iniciarApp() {
  verificarRachaDiaria();
  actualizarHeader();
  try {
    const res = await fetch('normativa.json?v=' + Date.now());
    dataNormativa = await res.json();
    mostrarInicio();
  } catch (e) {
    mainContent.innerHTML = `<div class="card">Error al cargar normativa.json. Verifica que no falte ninguna coma o llave en el archivo.</div>`;
  }
}

function mostrarInicio() {
  actualizarHeader();
  let html = `<h2>Ruta de Especialización</h2>`;

  // Botón de Repaso Espaciado si tiene errores acumulados
  if (preguntasFalladas.length > 0) {
    html += `
      <div class="card" style="border-color:#ea580c; background:#fff7ed;">
        <span class="badge badge-warn">Repaso Espaciado</span>
        <h2>🧠 Corregir Fallos (${preguntasFalladas.length} pendientes)</h2>
        <p style="font-size:0.88rem; color:#7c2d12;">Repasa las preguntas de normativa en las que fallaste anteriormente. ¡Recuperas +1 vida al terminar!</p>
        <button class="btn btn-warning" onclick="iniciarRepasoErrores()">Practicar mis errores ahora</button>
      </div>
    `;
  }

  // Botón para recargar vidas si se quedó en 0
  if (vidas <= 0) {
    html += `
      <div class="card" style="border-color:#ef4444; background:#fef2f2; text-align:center;">
        <h2>💔 Te quedaste sin vidas</h2>
        <p style="font-size:0.9rem;">Lee una lección normativa o haz un repaso rápido para recuperar tus 5 vidas.</p>
        <button class="btn btn-primary" onclick="recargarVidasGratis()">🔄 Recargar 5 Vidas (Modo Estudio)</button>
      </div>
    `;
  }

  dataNormativa.modulos.forEach((mod, idx) => {
    const completado = localStorage.getItem(`mod_completado_${mod.id}`) === 'true';
    const anteriorCompletado = idx === 0 || localStorage.getItem(`mod_completado_${dataNormativa.modulos[idx - 1].id}`) === 'true';
    const bloqueado = !anteriorCompletado;

    const vistasModulo = mod.preguntas.filter(p => preguntasVistas.includes(p.id)).length;

    html += `
      <div class="card ${bloqueado ? 'locked' : ''}">
        <span class="badge">${mod.categoria}</span>
        <h2>${bloqueado ? '🔒 ' : ''}${mod.titulo}</h2>
        <p style="font-size:0.85rem; color:#475569;">
          Banco: <strong>${mod.preguntas.length} preguntas</strong> (Has visto ${vistasModulo}/${mod.preguntas.length})
        </p>
        <p style="font-size:0.85rem; font-weight:bold; color:${completado ? '#16a34a' : '#64748b'};">
          ${completado ? '✅ Nivel Superado (Puedes seguir entrenando preguntas nuevas)' : (bloqueado ? 'Supera el módulo anterior para desbloquear' : '🔓 Disponible')}
        </p>
        <button class="btn btn-secondary" ${bloqueado ? 'disabled' : ''} onclick="verLeccion(${idx})">📖 1. Resumen Normativo</button>
        <button class="btn btn-primary" ${bloqueado || vidas <= 0 ? 'disabled' : ''} onclick="iniciarPractica(${idx})">🎲 2. Sesión Aleatoria (${ Math.min(PREGUNTAS_POR_SESION, mod.preguntas.length) } preguntas)</button>
      </div>
    `;
  });

  mainContent.innerHTML = html;
}

function recargarVidasGratis() {
  vidas = 5;
  localStorage.setItem('ecoley_vidas', vidas);
  mostrarInicio();
}

function verLeccion(idx) {
  moduloActual = dataNormativa.modulos[idx];
  let html = `
    <span class="badge">Jerarquía Normativa</span>
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
    <button class="btn btn-primary" onclick="iniciarPractica(${idx})">Entrenar este Módulo ➔</button>
    <button class="btn" style="background:#e2e8f0; color:#334155;" onclick="mostrarInicio()">⬅ Volver al Menú</button>
  `;
  mainContent.innerHTML = html;
}

function prepararPreguntasAleatorias(listaOriginal, cantidad) {
  // Prioriza preguntas que aún NO has visto para que siempre sientas contenido fresco
  const noVistas = mezclarArray(listaOriginal.filter(p => !preguntasVistas.includes(p.id)));
  const yaVistas = mezclarArray(listaOriginal.filter(p => preguntasVistas.includes(p.id)));
  const seleccionadas = [...noVistas, ...yaVistas].slice(0, cantidad);

  // Además, baraja el orden de las opciones (A, B, C, D) de cada pregunta
  return seleccionadas.map(p => {
    const textoCorrecto = p.opciones[p.correcta];
    const opcionesMezcladas = mezclarArray(p.opciones);
    return {
      ...p,
      opciones: opcionesMezcladas,
      correcta: opcionesMezcladas.indexOf(textoCorrecto)
    };
  });
}

function iniciarPractica(idx) {
  if (vidas <= 0) {
    mostrarInicio();
    return;
  }
  moduloActual = dataNormativa.modulos[idx];
  preguntasSesion = prepararPreguntasAleatorias(moduloActual.preguntas, PREGUNTAS_POR_SESION);
  indicePregunta = 0;
  aciertosSesion = 0;
  mostrarPregunta(false);
}

function iniciarRepasoErrores() {
  let todasLasPreguntas = [];
  dataNormativa.modulos.forEach(m => {
    todasLasPreguntas = todasLasPreguntas.concat(m.preguntas);
  });
  const listaFalladas = todasLasPreguntas.filter(p => preguntasFalladas.includes(p.id));
  if (listaFalladas.length === 0) {
    preguntasFalladas = [];
    localStorage.setItem('ecoley_falladas', '[]');
    mostrarInicio();
    return;
  }
  moduloActual = { id: 'repaso', titulo: 'Repaso de Errores' };
  preguntasSesion = prepararPreguntasAleatorias(listaFalladas, Math.min(5, listaFalladas.length));
  indicePregunta = 0;
  aciertosSesion = 0;
  mostrarPregunta(true);
}

function mostrarPregunta(esRepaso) {
  const total = preguntasSesion.length;
  const p = preguntasSesion[indicePregunta];
  const porcentaje = Math.round((indicePregunta / total) * 100);

  let opcionesHtml = '';
  p.opciones.forEach((op, i) => {
    opcionesHtml += `<button class="option-btn" id="opt-${i}" onclick="verificarRespuesta(${i}, ${esRepaso})">${op}</button>`;
  });

  mainContent.innerHTML = `
    <div class="progress-bar"><div class="progress-fill" style="width:${porcentaje}%"></div></div>
    <span class="badge">${p.tipo} (${indicePregunta + 1}/${total})</span>
    <h2 style="font-size:1.05rem; line-height:1.4;">${p.pregunta}</h2>
    <div id="opciones-container">${opcionesHtml}</div>
    <div id="feedback" class="feedback-box"></div>
    <button id="btn-siguiente" class="btn btn-primary" style="display:none;" onclick="siguientePregunta(${esRepaso})">Continuar ➔</button>
    <button class="btn" style="background:transparent; color:#64748b; font-size:0.85rem; margin-top:14px;" onclick="mostrarInicio()">Salir al menú</button>
  `;
}

function verificarRespuesta(seleccion, esRepaso) {
  const p = preguntasSesion[indicePregunta];
  const botones = document.querySelectorAll('.option-btn');
  botones.forEach(b => b.disabled = true);

  // Registrar pregunta como vista
  if (!preguntasVistas.includes(p.id)) {
    preguntasVistas.push(p.id);
    localStorage.setItem('ecoley_vistas', JSON.stringify(preguntasVistas));
  }

  const feedback = document.getElementById('feedback');
  const btnSiguiente = document.getElementById('btn-siguiente');

  if (seleccion === p.correcta) {
    document.getElementById(`opt-${seleccion}`).classList.add('correct');
    aciertosSesion++;
    xpTotal += 10;
    localStorage.setItem('ecoley_xp', xpTotal);

    // Si estaba en la lista de falladas y ahora acertó, la quitamos de falladas
    if (preguntasFalladas.includes(p.id)) {
      preguntasFalladas = preguntasFalladas.filter(id => id !== p.id);
      localStorage.setItem('ecoley_falladas', JSON.stringify(preguntasFalladas));
    }

    feedback.className = 'feedback-box feedback-ok';
    feedback.innerHTML = `<strong>¡Correcto! (+10 XP)</strong><br>${p.explicacion}`;
  } else {
    document.getElementById(`opt-${seleccion}`).classList.add('wrong');
    document.getElementById(`opt-${p.correcta}`).classList.add('correct');
    
    if (!esRepaso) {
      vidas = Math.max(0, vidas - 1);
      localStorage.setItem('ecoley_vidas', vidas);
    }

    // Guardar en lista de Repaso Espaciado
    if (!preguntasFalladas.includes(p.id)) {
      preguntasFalladas.push(p.id);
      localStorage.setItem('ecoley_falladas', JSON.stringify(preguntasFalladas));
    }

    feedback.className = 'feedback-box feedback-err';
    feedback.innerHTML = `<strong>Incorrecto (-1 ❤️)</strong> • Guardada para repaso<br>${p.explicacion}`;
  }

  actualizarHeader();
  feedback.style.display = 'block';
  btnSiguiente.style.display = 'block';
}

function siguientePregunta(esRepaso) {
  if (!esRepaso && vidas <= 0) {
    mainContent.innerHTML = `
      <div class="card" style="text-align:center;">
        <h2>💔 ¡Te quedaste sin vidas!</h2>
        <p>Los errores son parte del entrenamiento. Tus preguntas falladas se guardaron en la sección de Repaso Espaciado.</p>
        <button class="btn btn-primary" onclick="mostrarInicio()">Volver al Inicio</button>
      </div>
    `;
    return;
  }

  indicePregunta++;
  if (indicePregunta < preguntasSesion.length) {
    mostrarPregunta(esRepaso);
  } else {
    finalizarModulo(esRepaso);
  }
}

function finalizarModulo(esRepaso) {
  registrarActividadRacha();
  const total = preguntasSesion.length;

  if (esRepaso) {
    vidas = Math.min(5, vidas + 1);
    localStorage.setItem('ecoley_vidas', vidas);
    actualizarHeader();
  } else if (aciertosSesion >= Math.ceil(total * 0.6)) {
    localStorage.setItem(`mod_completado_${moduloActual.id}`, 'true');
  }

  mainContent.innerHTML = `
    <div class="card" style="text-align:center;">
      <h2>🎉 ¡Sesión Completada!</h2>
      <p style="font-size:1.2rem;">Aciertos: <strong>${aciertosSesion} de ${total}</strong></p>
      <p style="color:#16a34a; font-weight:bold;">🔥 Racha actual: ${racha} día(s)</p>
      <p style="font-size:0.9rem; color:#475569;">Si vuelves a entrar al módulo, el sistema sacará preguntas diferentes del banco y cambiará el orden de las alternativas.</p>
      <button class="btn btn-primary" onclick="mostrarInicio()">Continuar ➔</button>
    </div>
  `;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

iniciarApp();
