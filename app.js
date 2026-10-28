let dataNormativa = null;
let preguntasSesion = [];
let moduloActual = null;
let indicePregunta = 0;
let aciertosSesion = 0;
const PREGUNTAS_POR_SESION = 5;

let xpTotal = parseInt(localStorage.getItem('ecoley_xp')) || 0;
let vidas = parseInt(localStorage.getItem('ecoley_vidas') ?? '5');
let racha = parseInt(localStorage.getItem('ecoley_racha')) || 0;
let preguntasFalladas = JSON.parse(localStorage.getItem('ecoley_falladas') || '[]');
let preguntasVistas = JSON.parse(localStorage.getItem('ecoley_vistas') || '[]');
let preguntasExtraIA = JSON.parse(localStorage.getItem('ecoley_preguntas_ia') || '{}');

const mainContent = document.getElementById('main-content');

function actualizarEstadoRed() {
  const badge = document.getElementById('net-status');
  if (!badge) return;
  if (navigator.onLine) {
    badge.textContent = '🟢 Online';
  } else {
    badge.textContent = '🔴 Offline (Memoria Local)';
  }
}
window.addEventListener('online', actualizarEstadoRed);
window.addEventListener('offline', actualizarEstadoRed);

function verificarRachaDiaria() {
  const hoy = new Date().toISOString().split('T')[0];
  if (localStorage.getItem('ecoley_ultima_fecha') !== hoy) {
    vidas = 5;
    localStorage.setItem('ecoley_vidas', vidas);
  }
}

function registrarActividadRacha() {
  const hoy = new Date().toISOString().split('T')[0];
  const ultima = localStorage.getItem('ecoley_ultima_fecha');
  if (ultima === hoy) return;
  const ayer = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  racha = (ultima === ayer) ? racha + 1 : 1;
  localStorage.setItem('ecoley_racha', racha);
  localStorage.setItem('ecoley_ultima_fecha', hoy);
  actualizarHeader();
}

function actualizarHeader() {
  document.getElementById('xp-display').textContent = `⚡ ${xpTotal}`;
  document.getElementById('lives-display').textContent = `❤️ ${vidas}`;
  document.getElementById('streak-display').textContent = `🔥 ${racha}`;
  actualizarEstadoRed();
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
    const res = await fetch('normativa.json?t=' + Date.now());
    dataNormativa = await res.json();
    localStorage.setItem('ecoley_backup_json', JSON.stringify(dataNormativa));
  } catch (e) {
    const backup = localStorage.getItem('ecoley_backup_json');
    if (backup) dataNormativa = JSON.parse(backup);
  }
  integrarPreguntasIA();
  mostrarInicio();
}

function integrarPreguntasIA() {
  if (!dataNormativa) return;
  dataNormativa.modulos.forEach(mod => {
    const extras = preguntasExtraIA[mod.id] || [];
    const idsExistentes = new Set(mod.preguntas.map(p => p.id));
    extras.forEach(p => {
      if (!idsExistentes.has(p.id)) mod.preguntas.push(p);
    });
  });
}

function cambiarTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
  if (tab === 'estudio') mostrarInicio();
  if (tab === 'ia') mostrarPanelIA();
  if (tab === 'check') mostrarChecklists();
}

function mostrarInicio() {
  actualizarHeader();
  let html = '';

  if (preguntasFalladas.length > 0) {
    html += `
      <div class="card" style="border-color:#ea580c; background:#fff7ed;">
        <span class="badge badge-warn">Repaso Espaciado</span>
        <h2>🧠 Corregir Fallos (${preguntasFalladas.length} pendientes)</h2>
        <button class="btn btn-warning" onclick="iniciarRepasoErrores()">Practicar mis errores (+1 ❤️)</button>
      </div>
    `;
  }

  if (vidas <= 0) {
    html += `
      <div class="card" style="border-color:#ef4444; background:#fef2f2; text-align:center;">
        <h2>💔 Sin vidas disponibles</h2>
        <button class="btn btn-primary" onclick="recargarVidasGratis()">🔄 Recargar 5 Vidas</button>
      </div>
    `;
  }

  dataNormativa.modulos.forEach((mod, idx) => {
    const vistasModulo = mod.preguntas.filter(p => preguntasVistas.includes(p.id)).length;
    const extrasCount = (preguntasExtraIA[mod.id] || []).length;

    html += `
      <div class="card">
        <span class="badge">${mod.categoria}</span>
        ${extrasCount > 0 ? `<span class="badge badge-ai">+${extrasCount} creadas con IA</span>` : ''}
        <h2>${mod.titulo}</h2>
        <p style="font-size:0.84rem; color:#475569;">
          Banco total: <strong>${mod.preguntas.length} preguntas</strong> (Vistas: ${vistasModulo}/${mod.preguntas.length})
        </p>
        <button class="btn btn-secondary" onclick="verLeccion(${idx})">📖 1. Resumen Normativo</button>
        <button class="btn btn-primary" ${vidas <= 0 ? 'disabled' : ''} onclick="iniciarPractica(${idx})">🎲 2. Entrenar 5 Preguntas Nuevas</button>
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
  let html = `<span class="badge">Jerarquía Normativa</span><h2>${moduloActual.leccion.titulo}</h2>`;
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
    <button class="btn" style="background:#e2e8f0; color:#334155;" onclick="mostrarInicio()">⬅ Volver</button>
  `;
  mainContent.innerHTML = html;
}

function prepararPreguntasAleatorias(listaOriginal, cantidad) {
  const noVistas = mezclarArray(listaOriginal.filter(p => !preguntasVistas.includes(p.id)));
  const yaVistas = mezclarArray(listaOriginal.filter(p => preguntasVistas.includes(p.id)));
  const seleccionadas = [...noVistas, ...yaVistas].slice(0, cantidad);

  return seleccionadas.map(p => {
    const idxCorrecto = (typeof p.correcta === 'number' && p.opciones[p.correcta]) ? p.correcta : 0;
    const textoCorrecto = p.opciones[idxCorrecto];
    const opcionesMezcladas = mezclarArray(p.opciones);
    return {
      ...p,
      opciones: opcionesMezcladas,
      correcta: opcionesMezcladas.indexOf(textoCorrecto)
    };
  });
}

function iniciarPractica(idx) {
  moduloActual = dataNormativa.modulos[idx];
  preguntasSesion = prepararPreguntasAleatorias(moduloActual.preguntas, PREGUNTAS_POR_SESION);
  indicePregunta = 0;
  aciertosSesion = 0;
  mostrarPregunta(false);
}

function iniciarRepasoErrores() {
  let todas = [];
  dataNormativa.modulos.forEach(m => todas = todas.concat(m.preguntas));
  const falladas = todas.filter(p => preguntasFalladas.includes(p.id));
  if (falladas.length === 0) {
    preguntasFalladas = [];
    localStorage.setItem('ecoley_falladas', '[]');
    mostrarInicio();
    return;
  }
  moduloActual = { id: 'repaso', titulo: 'Repaso Espaciado' };
  preguntasSesion = prepararPreguntasAleatorias(falladas, Math.min(5, falladas.length));
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
    <h2 style="font-size:1.02rem; line-height:1.4;">${p.pregunta}</h2>
    <div id="opciones-container">${opcionesHtml}</div>
    <div id="feedback" class="feedback-box"></div>
    <button id="btn-siguiente" class="btn btn-primary" style="display:none;" onclick="siguientePregunta(${esRepaso})">Continuar ➔</button>
  `;
}

function verificarRespuesta(seleccion, esRepaso) {
  const p = preguntasSesion[indicePregunta];
  document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);

  if (!preguntasVistas.includes(p.id)) {
    preguntasVistas.push(p.id);
    localStorage.setItem('ecoley_vistas', JSON.stringify(preguntasVistas));
  }

  const feedback = document.getElementById('feedback');
  if (seleccion === p.correcta) {
    document.getElementById(`opt-${seleccion}`).classList.add('correct');
    aciertosSesion++;
    xpTotal += 10;
    localStorage.setItem('ecoley_xp', xpTotal);
    preguntasFalladas = preguntasFalladas.filter(id => id !== p.id);
    localStorage.setItem('ecoley_falladas', JSON.stringify(preguntasFalladas));
    feedback.className = 'feedback-box feedback-ok';
    feedback.innerHTML = `<strong>¡Correcto! (+10 XP)</strong><br>${p.explicacion}`;
  } else {
    document.getElementById(`opt-${seleccion}`).classList.add('wrong');
    document.getElementById(`opt-${p.correcta}`).classList.add('correct');
    if (!esRepaso) {
      vidas = Math.max(0, vidas - 1);
      localStorage.setItem('ecoley_vidas', vidas);
    }
    if (!preguntasFalladas.includes(p.id)) {
      preguntasFalladas.push(p.id);
      localStorage.setItem('ecoley_falladas', JSON.stringify(preguntasFalladas));
    }
    feedback.className = 'feedback-box feedback-err';
    feedback.innerHTML = `<strong>Incorrecto (-1 ❤️)</strong><br>${p.explicacion}`;
  }

  actualizarHeader();
  feedback.style.display = 'block';
  document.getElementById('btn-siguiente').style.display = 'block';
}

function siguientePregunta(esRepaso) {
  indicePregunta++;
  if (indicePregunta < preguntasSesion.length) {
    mostrarPregunta(esRepaso);
  } else {
    registrarActividadRacha();
    if (esRepaso) {
      vidas = Math.min(5, vidas + 1);
      localStorage.setItem('ecoley_vidas', vidas);
    }
    mainContent.innerHTML = `
      <div class="card" style="text-align:center;">
        <h2>🎉 ¡Sesión Terminada!</h2>
        <p>Aciertos: <strong>${aciertosSesion} de ${preguntasSesion.length}</strong></p>
        <button class="btn btn-primary" onclick="mostrarInicio()">Volver a los Módulos</button>
      </div>
    `;
  }
}

// ==========================================
// MÓDULO IA CON DOBLE MOTOR (GRATIS SIN CLAVE + GEMINI)
// ==========================================
function mostrarPanelIA() {
  const apiKeyGuardada = localStorage.getItem('ecoley_gemini_key') || '';
  let opcionesModulos = '';
  dataNormativa.modulos.forEach(m => {
    opcionesModulos += `<option value="${m.id}">${m.titulo}</option>`;
  });

  mainContent.innerHTML = `
    <div class="card">
      <span class="badge badge-ai">Doble Motor IA Activo</span>
      <h2>✨ Generador de Nuevas Preguntas y Normas</h2>
      <p style="font-size:0.85rem; color:#475569;">Genera preguntas ilimitadas cuando tengas internet. Se guardan en tu celular para usarlas con o sin señal.</p>
      
      <label style="font-size:0.82rem; font-weight:bold;">1. ¿A qué módulo deseas agregar preguntas?</label>
      <select id="modulo-destino" class="input-box">${opcionesModulos}</select>

      <label style="font-size:0.82rem; font-weight:bold;">2. Tema específico o nueva norma de El Peruano (Opcional):</label>
      <textarea id="tema-especifico" class="input-box" rows="3" placeholder="Ej: 'Fiscalización de botaderos OEFA', 'ITS y FITSA en obras viales MTC', 'LMP efluentes PTAR', o deja en blanco para casos variados..."></textarea>

      <button class="btn btn-ai" id="btn-generar-ia" onclick="generarPreguntasConIA()">⚡ Crear 5 Preguntas Nuevas Ahora</button>
      <div id="ia-status" style="margin-top:12px; font-size:0.88rem; font-weight:bold;"></div>

      <hr style="margin:16px 0; border:none; border-top:1px solid #e2e8f0;">
      <label style="font-size:0.78rem; color:#64748b;">Opcional: Clave Gemini (debe empezar con AIzaSy...). Si la dejas vacía, usará el Motor IA Libre automáticamente:</label>
      <input type="password" id="api-key-input" class="input-box" placeholder="Dejar vacío para modo automático o pegar AIzaSy..." value="${apiKeyGuardada}">
    </div>
  `;
}

function limpiarTextoJSON(texto) {
  const inicio = texto.indexOf('[');
  const fin = texto.lastIndexOf(']');
  if (inicio !== -1 && fin !== -1) {
    return texto.substring(inicio, fin + 1);
  }
  return texto;
}

async function generarPreguntasConIA() {
  if (!navigator.onLine) {
    alert('Necesitas internet para descargar nuevas preguntas.');
    return;
  }

  const key = document.getElementById('api-key-input').value.trim();
  localStorage.setItem('ecoley_gemini_key', key);

  const modId = document.getElementById('modulo-destino').value;
  const modObj = dataNormativa.modulos.find(m => m.id === modId);
  const temaUsuario = document.getElementById('tema-especifico').value.trim();
  const statusDiv = document.getElementById('ia-status');
  const btn = document.getElementById('btn-generar-ia');

  btn.disabled = true;
  statusDiv.style.color = '#7e22ce';
  statusDiv.textContent = '⏳ Generando 5 casos prácticos de normativa ambiental peruana (tarda unos 8 segundos)...';

  const prompt = `Eres un experto en normativa ambiental peruana (MINAM, OEFA, MTC obras viales, MVCS saneamiento, SUNASS, DIGESA y SSOMA Ley 29783 / G.050).
Genera exactamente 5 preguntas de opción múltiple nivel ingeniero especialista para el módulo "${modObj.titulo}".
${temaUsuario ? 'Tema prioritario solicitado: ' + temaUsuario : 'Crea casos prácticos nuevos de supervisión en campo, obras viales, DME, canteras, botaderos, rellenos sanitarios, PTAR o agua potable.'}
REGLA: Cita el número exacto de Ley o Decreto Supremo peruano y el artículo en la explicación. Si un artículo específico requiere verificación, añade (VERIFICAR en SPIJ).
Devuelve ÚNICAMENTE un JSON Array válido sin texto adicional con este formato exacto:
[
  {
    "id": 1,
    "tipo": "Caso Práctico - IA",
    "pregunta": "¿Pregunta detallada?",
    "opciones": ["Respuesta correcta", "Opción incorrecta 1", "Opción incorrecta 2", "Opción incorrecta 3"],
    "correcta": 0,
    "explicacion": "Base Legal: D.S. N°... Explicación técnica. Fuente: MINAM/MTC/OEFA."
  }
]`;

  let nuevasPreguntas = null;

  // Intento 1: Si puso una clave válida de Gemini (empieza con AIza)
  if (key.startsWith('AIza')) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      const result = await response.json();
      const rawText = result.candidates[0].content.parts[0].text;
      nuevasPreguntas = JSON.parse(limpiarTextoJSON(rawText));
    } catch (e) {
      console.log('Pasando a motor libre de respaldo...');
    }
  }

  // Intento 2 (Automático y sin clave): Motor IA Libre Pollinations
  if (!nuevasPreguntas) {
    try {
      const response = await fetch('https://text.pollinations.ai/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'openai',
          messages: [
            { role: 'system', content: 'Respondes únicamente con un JSON array válido sin markdown.' },
            { role: 'user', content: prompt }
          ]
        })
      });
      const data = await response.json();
      const rawText = data.choices[0].message.content;
      nuevasPreguntas = JSON.parse(limpiarTextoJSON(rawText));
    } catch (err) {
      statusDiv.style.color = '#ef4444';
      statusDiv.textContent = '❌ Hubo un corte de red al generar. Intenta tocar el botón nuevamente en unos segundos.';
      btn.disabled = false;
      return;
    }
  }

  if (Array.isArray(nuevasPreguntas) && nuevasPreguntas.length > 0) {
    nuevasPreguntas.forEach((p, idx) => { p.id = Date.now() + idx; });
    if (!preguntasExtraIA[modId]) preguntasExtraIA[modId] = [];
    preguntasExtraIA[modId] = preguntasExtraIA[modId].concat(nuevasPreguntas);
    localStorage.setItem('ecoley_preguntas_ia', JSON.stringify(preguntasExtraIA));

    integrarPreguntasIA();
    statusDiv.style.color = '#16a34a';
    statusDiv.innerHTML = `✅ ¡Listo! Se crearon y guardaron ${nuevasPreguntas.length} preguntas nuevas en "${modObj.titulo}". Ve a la pestaña Módulos para entrenarlas.`;
  }
  btn.disabled = false;
}

// ==========================================
// MÓDULO SIMULACRO DE FISCALIZACIÓN (CHECKLISTS DE CAMPO)
// ==========================================
function mostrarChecklists() {
  const listas = dataNormativa.checklists || [];
  let html = `<h2>📋 Simulacro y Checklists de Campo</h2>
  <p style="font-size:0.85rem; color:#475569;">Listas de verificación rápida para tus supervisiones viales y municipales con base legal.</p>`;

  listas.forEach(chk => {
    let itemsHtml = '';
    chk.items.forEach(it => {
      itemsHtml += `
        <label class="check-item">
          <input type="checkbox">
          <div><strong>${it.criterio}</strong><br><span style="font-size:0.78rem; color:#15803d;">Base: ${it.norma}</span></div>
        </label>
      `;
    });
    html += `
      <div class="card">
        <span class="badge">${chk.entidad}</span>
        <h2>${chk.titulo}</h2>
        ${itemsHtml}
      </div>
    `;
  });
  mainContent.innerHTML = html;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

iniciarApp();
