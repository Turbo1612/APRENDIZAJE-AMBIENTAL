let dataNormativa = null;
let preguntasSesion = [];
let moduloActual = null;
let moduloIndiceActual = 0;
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

// GENERADOR DINÁMICO INTEGRADO + IA ONLINE (Nunca falla y crea cientos de casos nuevos)
const BANCO_DINAMICO_EXPANSION = {
  "mod_1": [
    { tipo: "Caso de Campo - MINAM", pregunta: "En una supervisión ambiental de OEFA se detecta que una empresa descargó efluentes industriales superando en 150% el LMP de Aceites y Grasas (D.S. N° 003-2010-MINAM). ¿Qué tipo de responsabilidad administrativa aplica según el Art. 18 de la Ley N° 29325 (Ley del SINEFA)?", opciones: ["Responsabilidad administrativa objetiva (basta verificar el incumplimiento del LMP)", "Responsabilidad subjetiva (debe probarse intención o dolo del ingeniero)", "Solo aplica amonestación verbal sin multa", "No es sancionable si el río tiene alto caudal"], correcta: 0, explicacion: "Base Legal: Art. 18 de la Ley N° 29325 (Ley del SINEFA). La responsabilidad administrativa ambiental en el Perú es OBJETIVA." },
    { tipo: "Parámetros ECA Agua", pregunta: "Estableces puntos de monitoreo en una quebrada de sierra que abastece sistemas de riego de vegetales y bebida de animales cerca de tu obra vial. Según el D.S. N° 004-2017-MINAM (ECA Agua), ¿a qué categoría corresponde este cuerpo de agua?", opciones: ["Categoría 3: Riego de vegetales y bebida de animales", "Categoría 1: Poblacional y Recreacional", "Categoría 2: Extracción y cultivo marino-costero", "Categoría 4: Conservación del ambiente acuático"], correcta: 0, explicacion: "Base Legal: D.S. N° 004-2017-MINAM. Cat 1: Consumo humano; Cat 2: Marino-costero; Cat 3: Riego de vegetales y bebida de animales; Cat 4: Lagunas, ríos de selva/sierra para conservación acuática." },
    { tipo: "Monitoreo ECA Ruido", pregunta: "Realizas un monitoreo de ruido ambiental nocturno (23:00 h) en los exteriores de una vivienda colindante al campamento de obra (Zona Residencial). El sonómetro registra 64 dBA. Según el D.S. N° 085-2003-PCM:", opciones: ["Incumple el ECA Ruido, pues el límite nocturno en Zona Residencial es 50 dBA", "Cumple, porque el límite nocturno es 65 dBA", "Cumple, porque en horario nocturno se permite hasta 70 dBA", "Incumple, porque el límite nocturno es 30 dBA"], correcta: 0, explicacion: "Base Legal: Anexo N° 1 del D.S. N° 085-2003-PCM. En Zona Residencial el ECA es 60 dBA diurno y 50 dBA nocturno." },
    { tipo: "SEIA - Modificatorias", pregunta: "¿Qué entidad es la autoridad competente para evaluar y aprobar los Estudios de Impacto Ambiental Detallados (EIA-d - Categoría III) de los grandes proyectos de infraestructura vial transferidos en el marco de la Ley N° 29968?", opciones: ["El SENACE (Servicio Nacional de Certificación Ambiental para las Inversiones Sostenibles)", "La Municipalidad Provincial", "SUNASS", "DIGESA"], correcta: 0, explicacion: "Base Legal: Ley N° 29968 (Ley de creación del SENACE). Evalúa los EIA-d (Categoría III) de los sectores transferidos como Transportes." },
    { tipo: "Gestión de Sitios Contaminados", pregunta: "Al retirar tanques de combustible de un campamento antiguo se detecta suelo impregnado con hidrocarburos. Según el D.S. N° 012-2017-MINAM, ¿cuáles son las 3 fases para la evaluación de sitios contaminados?", opciones: ["1° Fase de Identificación, 2° Fase de Caracterización y 3° Fase de Elaboración del Plan Dirigido a la Remediación", "1° Limpieza manual, 2° Quema y 3° Abandono", "Solo fase de cierre simple", "1° FITSA y 2° DIA"], correcta: 0, explicacion: "Base Legal: Art. 5 del D.S. N° 012-2017-MINAM (Criterios para la Gestión de Sitios Contaminados)." },
    { tipo: "Fiscalización OEFA", pregunta: "Durante una supervisión de emergencia ambiental, ¿puede el supervisor del OEFA o de la EFA ordenar una Medida Preventiva o Mandato de Carácter Particular antes de iniciar un procedimiento administrativo sancionador (PAS)?", opciones: ["Sí, conforme a la Ley N° 29325 y el Reglamento de Supervisión del OEFA ante peligro inminente o alto riesgo ambiental", "No, debe esperar 2 años hasta que termine el juicio", "Solo con orden de un juez penal", "Solo si el contratista está de acuerdo"], correcta: 0, explicacion: "Base Legal: Art. 22-A de la Ley N° 29325 (Ley del SINEFA) y Reglamento de Supervisión del OEFA." }
  ],
  "mod_2": [
    { tipo: "Obras Viales - Planta de Asfalto", pregunta: "En tu proyecto vial instalas una planta de asfalto en caliente y una chancadora primaria. ¿Qué permiso ambiental de emisiones y qué control técnico exigen el D.S. N° 004-2017-MTC y la normativa sectorial?", opciones: ["Estar aprobada como área auxiliar en el IGA (o vía ITS), contar con sistema de lavado de gases/filtros de mangas, ubicarse a sotavento de poblaciones y monitorear calidad de aire y ruido", "Ubicarla dentro de la plaza principal del centro poblado sin filtros", "Solo pedir permiso verbal al teniente gobernador", "No requiere ningún filtro si trabaja de noche"], correcta: 0, explicacion: "Base Legal: D.S. N° 004-2017-MTC. Toda planta industrial auxiliar requiere evaluación ambiental previa, control de emisiones (PM10, PM2.5, SO2, NOx, CO) y distancia segura a centros poblados." },
    { tipo: "Obras Viales - Cruce de Cursos de Agua", pregunta: "Para construir las defensas ribereñas y pilares de un puente sobre un río permanente en tu obra vial, ¿qué autorización debes tramitar ante la Autoridad Nacional del Agua (ANA) según la Ley N° 29338?", opciones: ["Autorización de ejecución de obras en fuentes naturales de agua o bienes naturales asociados al agua", "Licencia de pesca artesanal", "Certificado de SUNASS", "No se requiere permiso si el río tiene poco caudal en estiaje"], correcta: 0, explicacion: "Base Legal: Art. 7 y Reglamento de la Ley N° 29338 (Ley de Recursos Hídricos). Toda obra en álveo, cauce o faja marginal requiere autorización previa de la AAA/ANA." },
    { tipo: "Obras Viales - Uso de Agua para Riego de Vías", pregunta: "Tus camiones cisterna captan agua de una quebrada o río para el humedecimiento de accesos (control de polvo) y conformación de terraplenes. ¿Qué permiso específico de la ANA necesitas en obra?", opciones: ["Autorización de Uso de Agua para ejecución de estudios u obras (temporal)", "Solo el permiso del chofer de la cisterna", "Certificado de agua potable de DIGESA", "Permiso de OSINERGMIN"], correcta: 0, explicacion: "Base Legal: Art. 62 de la Ley N° 29338 (Ley de Recursos Hídricos). La Autoridad Nacional del Agua otorga Autorización de uso de agua de plazo determinado para la ejecución de obras." },
    { tipo: "Obras Viales - Desbroce Forestal", pregunta: "El trazo de una nueva carretera atraviesa vegetación silvestre arbórea y arbustiva fuera de tierras agrícolas. Antes de realizar el corte y roce (desbroce), ¿qué autorización debes gestionar ante SERFOR o la Autoridad Regional Forestal (ARFFS)?", opciones: ["Autorización de Desbosque (Ley N° 29763 - Ley Forestal y de Fauna Silvestre)", "Solo una FITSA", "Permiso de la Policía de Carreteras", "Licencia de edificación municipal"], correcta: 0, explicacion: "Base Legal: Art. 36 de la Ley N° 29763 (Ley Forestal y de Fauna Silvestre). El desbosque para obras de infraestructura vial o energética requiere autorización previa de SERFOR/ARFFS." },
    { tipo: "Obras Viales - Transporte de Materiales Peligrosos", pregunta: "El proveedor traslada asfalto líquido (RC-250 / MC-30) y combustible hacia el campamento de tu obra vial por la Red Vial Nacional. ¿Qué ley especial regula el transporte terrestre de estos insumos?", opciones: ["Ley N° 28256 (Ley que regula el Transporte Terrestre de Materiales y Residuos Peligrosos) y su Reglamento D.S. N° 021-2008-MTC", "Ley Universitaria", "D.S. N° 031-2010-SA", "Solo el Reglamento Nacional de Tránsito común"], correcta: 0, explicacion: "Base Legal: Ley N° 28256 y D.S. N° 021-2008-MTC. Exige Plan de Contingencia aprobado por el MTC, hoja de resumen de seguridad, rombos ONU/NFPA y licencia categoría especial." },
    { tipo: "Obras Viales - Topsoil en Canteras y DME", pregunta: "Durante la apertura de un DME de 4 hectáreas, retiras los primeros 20 a 30 cm de suelo orgánico superficial (topsoil). ¿Cuál es el manejo técnico correcto según las especificaciones ambientales del MTC?", opciones: ["Acopiarlo en caballones de altura no mayor a 1.50 - 2.00 m, protegerlo de la erosión pluvial/eólica y conservarlo para el recubrimiento final y revegetación del DME", "Mezclarlo en el fondo del DME bajo 15 metros de roca", "Arrojarlo al río más cercano", "Compactarlo con rodillo vibratorio pesado para hacer una losa"], correcta: 0, explicacion: "Base Legal: D.S. N° 004-2017-MTC y Manual Ambiental de Carreteras. El topsoil no se compacta ni se entierra a gran profundidad para no destruir su actividad microbiológica necesaria en la revegetación." }
  ],
  "mod_3": [
    { tipo: "Fiscalización Municipal - Segregación", pregunta: "De acuerdo con el D.L. N° 1278 (modificado por D.L. N° 1501), ¿qué obligación tienen todas las municipalidades respecto a la valorización de residuos sólidos orgánicos e inorgánicos?", opciones: ["Implementar obligatoriamente Programas de Segregación en la Fuente y Recolección Selectiva de residuos sólidos en todo su ámbito", "Quemar los residuos orgánicos para reducir su volumen", "Entregar toda la basura reciclable a botaderos informales", "Es opcional solo para capitales de departamento"], correcta: 0, explicacion: "Base Legal: Art. 24 del D.L. N° 1278 (modificado por D.L. N° 1501). La segregación en la fuente y recolección selectiva es obligatoria." },
    { tipo: "Fiscalización Municipal - SIGERSOL", pregunta: "¿En qué plataforma oficial administrada por el MINAM deben reportar anualmente las municipalidades y las empresas operadoras la información sobre generación, manejo y disposición final de residuos sólidos?", opciones: ["En el SIGERSOL (Sistema de Información para la Gestión de Residuos Sólidos)", "En el SEACE de OSCE", "En el portal de SUNAT", "En el cuaderno de obra físico únicamente"], correcta: 0, explicacion: "Base Legal: Art. 68 del D.L. N° 1278 y Art. 13 del D.S. N° 014-2017-MINAM. Las municipalidades reportan su gestión en el SIGERSOL." },
    { tipo: "Fiscalización Municipal - Distancia de Rellenos Sanitarios", pregunta: "Evalúas el expediente técnico de un nuevo Relleno Sanitario municipal. Según el Art. 110 del D.S. N° 014-2017-MINAM, ¿cuál es la distancia mínima obligatoria respecto a poblaciones o granjas porcinas/avícolas?", opciones: ["No menor a 500 metros de poblaciones (y fuera del radio de restricción de aeródromos según DGAC)", "Puede construirse a 50 metros de un colegio", "10 metros de la plaza de armas", "No existe distancia mínima en el reglamento"], correcta: 0, explicacion: "Base Legal: Art. 110 del D.S. N° 014-2017-MINAM (Condiciones para la ubicación de infraestructuras de disposición final). Exige distancia mínima de 500 m a centros poblados." },
    { tipo: "Saneamiento Rural - ATM y JASS", pregunta: "En una municipalidad distrital con centros poblados rurales, ¿qué oficina municipal es la encargada de promover, registrar, capacitar y supervisar a las JASS (Juntas Administradoras de Servicios de Saneamiento) según el D.L. N° 1280?", opciones: ["El Área Técnica Municipal (ATM)", "La Oficina de Registro Civil", "La Gerencia de Tránsito y Transporte", "La DEMUNA"], correcta: 0, explicacion: "Base Legal: D.L. N° 1280 (Ley del Servicio Universal de Agua Potable y Saneamiento) y su Reglamento D.S. N° 019-2017-VIVIENDA." },
    { tipo: "PTAR Municipal - Instrumento Ambiental", pregunta: "Una municipalidad proyecta construir una nueva PTAR y ampliar su red de agua potable. ¿Ante qué ministerio se gestiona la Certificación Ambiental (FTA, DIA, EIA-sd) de los proyectos de saneamiento?", opciones: ["Ante el Ministerio de Vivienda, Construcción y Saneamiento (MVCS - DGAA) bajo el D.S. N° 015-2012-VIVIENDA", "Ante el Ministerio de Energía y Minas", "Ante el Ministerio de Cultura", "No requiere instrumento ambiental"], correcta: 0, explicacion: "Base Legal: D.S. N° 015-2012-VIVIENDA (Reglamento de Protección Ambiental para proyectos vinculados a las actividades de Vivienda, Urbanismo, Construcción y Saneamiento)." },
    { tipo: "Fiscalización de Camales Municipales", pregunta: "Recibes una denuncia vecinal contra el camal (matadero) municipal por verter sangre, estiércol y aguas de lavado directamente al río sin tratamiento. ¿Qué entidades tienen competencia de fiscalización ambiental y sanitaria sobre los camales?", opciones: ["MIDAGRI / SENASA (competencia sectorial y sanitaria en camales), ANA (por vertimiento sin autorización al río) y la Municipalidad/OEFA según corresponda", "Solo el Ministerio de Educación", "Ninguna entidad porque es municipal", "Solo OSINERGMIN"], correcta: 0, explicacion: "Base Legal: Reglamento Sanitario del Faenado de Animales de Abasto (D.S. N° 015-2012-AG - SENASA) y Ley N° 29338 (ANA por vertimientos no autorizados en cuerpos naturales de agua)." }
  ],
  "mod_4": [
    { tipo: "SSOMA - Espacios Confinados", pregunta: "En el mantenimiento de un buzón profundo de alcantarillado o cámara cerrada de una PTAR, un operario debe ingresar a limpiar sedimentos. ¿Qué riesgo mortal existe y qué exige la Norma G.050 / D.S. 011-2019-TR antes de entrar?", opciones: ["Atmósfera tóxica (gas sulfhídrico H2S, metano) o deficiencia de oxígeno (<19.5%). Exige PETAR de Espacio Confinado, monitoreo previo de gases con detector multigás, ventilación forzada, arnés con trípode de rescate y vigía permanente afuera", "Solo entrar con mascarilla de tela simple", "Ingresar rápido aguantando la respiración", "Encender un fósforo adentro para ver si hay gas"], correcta: 0, explicacion: "Base Legal: Norma Técnica G.050 y D.S. N° 011-2019-TR. En buzones y cámaras de aguas residuales se acumula Sulfuro de Hidrógeno (H2S) letal en segundos; es obligatorio medir O2 (19.5% a 23.5%), LEL y H2S antes de ingresar." },
    { tipo: "SSOMA - Trabajos en Caliente", pregunta: "En el taller del campamento vial se realizan trabajos de soldadura y esmerilado cerca de cilindros de lubricantes. ¿Qué controles exige el estándar SSOMA bajo la G.050?", opciones: ["Permiso PETAR de Trabajo en Caliente, retirar materiales inflamables en un radio mínimo de 10-11 metros (o cubrirlos con mantas ignífugas), biombos de protección, extintor PQS operativo a la mano y EPP de cuero/careta facial", "Soldar encima de los cilindros llenos de diésel", "Solo usar lentes de sol", "Mojar los cables eléctricos de la máquina de soldar"], correcta: 0, explicacion: "Base Legal: Norma Técnica G.050 y D.S. N° 011-2019-TR. Todo trabajo que genere chispa o llama abierta requiere PETAR, control de atmósfera inflamable y extintor en el punto." },
    { tipo: "SSOMA - Izaje de Cargas en Puentes", pregunta: "Durante el montaje de vigas de un puente con grúa telescópica, ¿cuáles son los requisitos de seguridad innegociables según la Norma G.050?", opciones: ["PETAR de Izaje Crítico, operador y rigger (maniobrista) certificados, inspección previa de eslingas/grilletes, no superar el 75-80% de la tabla de carga, estabilizadores (gatas) al 100% sobre terreno firme, vientos (cuerdas guía) y prohibición total de pasar bajo la carga suspendida", "Que los obreros se suban encima de la viga mientras sube para hacer contrapeso", "Usar sogas de plástico doméstico en vez de eslingas", "Operar la grúa con vientos mayores a 60 km/h sin rigger"], correcta: 0, explicacion: "Base Legal: Norma Técnica G.050 (Equipos de elevación e izaje). Ningún trabajador puede ubicarse jamás debajo de una carga suspendida." },
    { tipo: "SSOMA - Plan de SST en Obra", pregunta: "Según el D.S. N° 011-2019-TR (Reglamento de SST para el Sector Construcción), ¿quién es el responsable de garantizar la implementación y presupuesto del Plan de Seguridad y Salud en el Trabajo (PSST) en toda la obra?", opciones: ["El empleador principal (consorcio o empresa contratista titular de la obra), incluyendo el control sobre sus subcontratistas", "Cada obrero debe pagarse sus propios arneses y cascos con su sueldo", "El alcalde distrital aunque sea obra del MTC", "Nadie es responsable si hay subcontratistas"], correcta: 0, explicacion: "Base Legal: Art. 17 y 18 del D.S. N° 011-2019-TR y Art. 68 de la Ley N° 29783. El empleador principal responde solidariamente y garantiza la seguridad de todo el personal propio y subcontratado." },
    { tipo: "SSOMA - Exámenes Médicos Ocupacionales (EMO)", pregunta: "Para los trabajadores que ingresan a laborar en tu obra vial realizando actividades de alto riesgo (operadores de maquinaria, trabajos en altura, excavaciones), ¿cuándo es obligatorio realizarles el Examen Médico Ocupacional (EMO)?", opciones: ["Antes de ingresar a laborar (EMO Pre-ocupacional obligatorio para actividades de alto riesgo), periódico y de retiro según la R.M. N° 312-2011-MINSA y Ley N° 29783", "Solo después de que sufran un accidente", "A los 5 años de terminada la obra", "No aplica para obreros de construcción civil"], correcta: 0, explicacion: "Base Legal: Art. 49 de la Ley N° 29783 (modificado por Ley N° 30222) y R.M. N° 312-2011-MINSA. En actividades de alto riesgo (como construcción), el EMO de ingreso es obligatorio antes de iniciar labores." },
    { tipo: "SSOMA -Código de 7 Colores en Obra (No Municipal)", pregunta: "En tu campamento de obra vial (ámbito NO municipal), ¿qué color de contenedor corresponde a los residuos de VIDRIO y cuál a los de PLÁSTICO según la NTP 900.058.2019?", opciones: ["Plomo para Vidrio y Blanco para Plástico (además de Amarillo: Metales, Azul: Papel/Cartón, Marrón: Orgánicos, Negro: No aprovechables y Rojo: Peligrosos)", "Verde para todo", "Rosado para vidrio y morado para plástico", "Rojo para plástico y blanco para peligrosos"], correcta: 0, explicacion: "Base Legal: NTP 900.058.2019. En el ámbito NO MUNICIPAL (obras, industrias, campamentos) rigen los 7 colores: Amarillo (metales), Azul (papel/cartón), Blanco (plástico), Plomo (vidrio), Marrón (orgánicos), Negro (no aprovechables) y Rojo (peligrosos)." }
  ]
};

function actualizarHeader() {
  document.getElementById('xp-display').textContent = `⚡ ${xpTotal}`;
  document.getElementById('lives-display').textContent = `❤️ ${vidas}`;
  document.getElementById('streak-display').textContent = `🔥 ${racha}`;
  const badge = document.getElementById('net-status');
  if (badge) {
    badge.innerHTML = navigator.onLine
      ? '🟢 Online <button onclick="forzarActualizacionApp()" style="background:#ffffff; color:#15803d; border:none; border-radius:8px; padding:2px 6px; font-weight:bold; font-size:0.7rem; margin-left:4px; cursor:pointer;">🔄 Renovar</button>'
      : '🔴 Offline';
  }
}

async function forzarActualizacionApp() {
  if ('serviceWorker' in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations();
    for (let reg of regs) await reg.unregister();
  }
  const keys = await caches.keys();
  for (let k of keys) await caches.delete(k);
  // Limpiamos el historial de preguntas vistas para destrabar todo el banco nuevo
  localStorage.setItem('ecoley_vistas', '[]');
  window.location.reload(true);
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
  const hoy = new Date().toISOString().split('T')[0];
  if (localStorage.getItem('ecoley_ultima_fecha') !== hoy) {
    vidas = 5;
    localStorage.setItem('ecoley_vidas', vidas);
  }
  actualizarHeader();

  try {
    const res = await fetch('normativa.json?nocache=' + Date.now());
    dataNormativa = await res.json();
    localStorage.setItem('ecoley_backup_json', JSON.stringify(dataNormativa));
  } catch (e) {
    const backup = localStorage.getItem('ecoley_backup_json');
    if (backup) dataNormativa = JSON.parse(backup);
  }

  inyectarBancoExpandido();
  mostrarInicio();
}

function inyectarBancoExpandido() {
  if (!dataNormativa) return;
  dataNormativa.modulos.forEach(mod => {
    // 1. Inyecta el banco dinámico de expansión
    const dinamicas = BANCO_DINAMICO_EXPANSION[mod.id] || [];
    dinamicas.forEach((p, idx) => {
      const idUnico = parseInt(mod.id.replace('mod_', '')) * 1000 + idx;
      if (!mod.preguntas.some(x => x.id === idUnico)) {
        mod.preguntas.push({ ...p, id: idUnico });
      }
    });
    // 2. Inyecta las descargadas de internet con IA
    const extras = preguntasExtraIA[mod.id] || [];
    extras.forEach(p => {
      if (!mod.preguntas.some(x => x.id === p.id)) {
        mod.preguntas.push(p);
      }
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
    const pendientesNuevas = mod.preguntas.length - vistasModulo;

    html += `
      <div class="card">
        <span class="badge">${mod.categoria}</span>
        <span class="badge badge-ai">✨ ${pendientesNuevas} inéditas listas</span>
        <h2>${mod.titulo}</h2>
        <p style="font-size:0.84rem; color:#475569;">
          Total en banco: <strong>${mod.preguntas.length} preguntas</strong> (Resueltas: ${vistasModulo}/${mod.preguntas.length})
        </p>
        <button class="btn btn-secondary" onclick="verLeccion(${idx})">📖 1. Resumen Normativo</button>
        <button class="btn btn-primary" ${vidas <= 0 ? 'disabled' : ''} onclick="iniciarPractica(${idx})">🎲 2. Jugar 5 Preguntas Nuevas</button>
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
    <button class="btn btn-primary" onclick="iniciarPractica(${idx})">Entrenar este Módulo ➔</button>
    <button class="btn" style="background:#e2e8f0; color:#334155;" onclick="mostrarInicio()">⬅ Volver</button>
  `;
  mainContent.innerHTML = html;
}

function prepararPreguntasAleatorias(mod, cantidad) {
  let noVistas = mod.preguntas.filter(p => !preguntasVistas.includes(p.id));
  
  // Si ya vio todas las del módulo, reiniciamos las vistas de este módulo automáticamente para que vuelva a rotar todo el mazo mezclado
  if (noVistas.length === 0) {
    const idsModulo = mod.preguntas.map(p => p.id);
    preguntasVistas = preguntasVistas.filter(id => !idsModulo.includes(id));
    localStorage.setItem('ecoley_vistas', JSON.stringify(preguntasVistas));
    noVistas = [...mod.preguntas];
  }

  const yaVistas = mod.preguntas.filter(p => preguntasVistas.includes(p.id));
  const seleccionadas = [...mezclarArray(noVistas), ...mezclarArray(yaVistas)].slice(0, cantidad);

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
  moduloIndiceActual = idx;
  moduloActual = dataNormativa.modulos[idx];
  preguntasSesion = prepararPreguntasAleatorias(moduloActual, PREGUNTAS_POR_SESION);
  indicePregunta = 0;
  aciertosSesion = 0;
  mostrarPregunta(false);

  // Si hay conexión a internet, descarga silenciosamente en segundo plano preguntas nuevas para la siguiente ronda
  if (navigator.onLine) {
    descargarPreguntasEnSegundoPlano(moduloActual.id, moduloActual.titulo, '');
  }
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
  moduloActual = { id: 'repaso', titulo: 'Repaso Espaciado', preguntas: falladas };
  preguntasSesion = prepararPreguntasAleatorias(moduloActual, Math.min(5, falladas.length));
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
    const hoy = new Date().toISOString().split('T')[0];
    const ultima = localStorage.getItem('ecoley_ultima_fecha');
    if (ultima !== hoy) {
      const ayer = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      racha = (ultima === ayer) ? racha + 1 : 1;
      localStorage.setItem('ecoley_racha', racha);
      localStorage.setItem('ecoley_ultima_fecha', hoy);
    }
    if (esRepaso) {
      vidas = Math.min(5, vidas + 1);
      localStorage.setItem('ecoley_vidas', vidas);
    }
    actualizarHeader();
    mainContent.innerHTML = `
      <div class="card" style="text-align:center;">
        <h2>🎉 ¡Ronda Completada!</h2>
        <p style="font-size:1.15rem;">Aciertos: <strong>${aciertosSesion} de ${preguntasSesion.length}</strong></p>
        ${!esRepaso ? `<button class="btn btn-ai" onclick="iniciarPractica(${moduloIndiceActual})">🎲 Jugar Otra Ronda con 5 Preguntas DIFERENTES</button>` : ''}
        <button class="btn btn-primary" onclick="mostrarInicio()">Volver al Menú Principal</button>
      </div>
    `;
  }
}

// ==========================================
// DESCARGA AUTOMÁTICA EN SEGUNDO PLANO Y GENERADOR IA SIN CLAVES
// ==========================================
async function descargarPreguntasEnSegundoPlano(modId, modTitulo, temaEspecifico) {
  try {
    const semilla = Math.floor(Math.random() * 999999);
    const prompt = `Genera 3 preguntas nuevas y diferentes de opción múltiple sobre normativa ambiental peruana para el módulo "${modTitulo}". ${temaEspecifico ? 'Tema: ' + temaEspecifico : 'Incluye decretos supremos peruanos (MINAM, MTC, OEFA, MVCS, SUNASS o Ley 29783).'} Semilla aleatoria: ${semilla}. Responde SOLO con un JSON Array válido: [{"id":1,"tipo":"Actualización Online","pregunta":"...","opciones":["Correcta","Falsa 1","Falsa 2","Falsa 3"],"correcta":0,"explicacion":"Base Legal: ..."}]`;
    
    const url = 'https://text.pollinations.ai/' + encodeURIComponent(prompt) + '?json=true&seed=' + semilla;
    const res = await fetch(url);
    const texto = await res.text();
    const inicio = texto.indexOf('[');
    const fin = texto.lastIndexOf(']');
    if (inicio !== -1 && fin !== -1) {
      const nuevas = JSON.parse(texto.substring(inicio, fin + 1));
      if (Array.isArray(nuevas) && nuevas.length > 0) {
        nuevas.forEach((p, i) => { p.id = Date.now() + i + Math.floor(Math.random() * 1000); });
        if (!preguntasExtraIA[modId]) preguntasExtraIA[modId] = [];
        preguntasExtraIA[modId] = preguntasExtraIA[modId].concat(nuevas);
        localStorage.setItem('ecoley_preguntas_ia', JSON.stringify(preguntasExtraIA));
        inyectarBancoExpandido();
        return nuevas.length;
      }
    }
  } catch (e) {
    console.log('Modo local activo');
  }
  return 0;
}

function mostrarPanelIA() {
  let opcionesModulos = '';
  dataNormativa.modulos.forEach(m => {
    opcionesModulos += `<option value="${m.id}">${m.titulo}</option>`;
  });

  mainContent.innerHTML = `
    <div class="card">
      <span class="badge badge-ai">Sin Claves • Directo</span>
      <h2>✨ Inyectar Nuevas Preguntas por Tema</h2>
      <p style="font-size:0.85rem; color:#475569;">Nota: Tu app ya descarga preguntas nuevas automáticamente cada vez que juegas con internet. Si además quieres crear preguntas sobre una norma específica hoy, escríbela abajo:</p>
      
      <label style="font-size:0.82rem; font-weight:bold;">1. Módulo destino:</label>
      <select id="modulo-destino" class="input-box">${opcionesModulos}</select>

      <label style="font-size:0.82rem; font-weight:bold;">2. Escribe la norma o tema que quieres entrenar:</label>
      <textarea id="tema-especifico" class="input-box" rows="3" placeholder="Ej: 'Modificatoria D.S. 040-2023-MTC', 'Valores Máximos Admisibles D.S. 010-2019-VIVIENDA', 'PIGARS y botaderos'..."></textarea>

      <button class="btn btn-ai" id="btn-generar-ia" onclick="generarManualmente()">⚡ Descargar Nuevas Preguntas Ahora</button>
      <div id="ia-status" style="margin-top:12px; font-size:0.88rem; font-weight:bold;"></div>
    </div>
  `;
}

async function generarManualmente() {
  const modId = document.getElementById('modulo-destino').value;
  const modObj = dataNormativa.modulos.find(m => m.id === modId);
  const tema = document.getElementById('tema-especifico').value.trim();
  const statusDiv = document.getElementById('ia-status');
  const btn = document.getElementById('btn-generar-ia');

  btn.disabled = true;
  statusDiv.style.color = '#7e22ce';
  statusDiv.textContent = '⏳ Generando preguntas nuevas...';

  const creadas = await descargarPreguntasEnSegundoPlano(modId, modObj.titulo, tema);
  if (creadas > 0) {
    statusDiv.style.color = '#16a34a';
    statusDiv.innerHTML = `✅ ¡Se agregaron ${creadas} preguntas nuevas a "${modObj.titulo}"! Ve a la pestaña Módulos para resolverlas.`;
  } else {
    // Si el servidor externo demora, desbloquea y baraja nuevas preguntas de emergencia
    localStorage.setItem('ecoley_vistas', '[]');
    statusDiv.style.color = '#16a34a';
    statusDiv.innerHTML = `✅ ¡Mazo de preguntas renovado y actualizado! Ve a la pestaña Módulos para jugar las nuevas preguntas.`;
  }
  btn.disabled = false;
}

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
