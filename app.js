let dataNormativa = null;
let preguntasSesion = [];
let moduloActual = null;
let moduloIndiceActual = 0;
let nivelActual = 1; // 1: Base/Plazos, 2: Casuística Senior, 3: Fiscalizador Experto
let indicePregunta = 0;
let aciertosSesion = 0;
const PREGUNTAS_POR_SESION = 5;

let xpTotal = parseInt(localStorage.getItem('ecoley_xp')) || 0;
let vidas = parseInt(localStorage.getItem('ecoley_vidas') ?? '5');
let racha = parseInt(localStorage.getItem('ecoley_racha')) || 0;
let preguntasFalladas = JSON.parse(localStorage.getItem('ecoley_falladas') || '[]');
let preguntasVistas = JSON.parse(localStorage.getItem('ecoley_vistas') || '[]');
let preguntasExtraIA = JSON.parse(localStorage.getItem('ecoley_preguntas_ia') || '{}');
let nivelesSuperados = JSON.parse(localStorage.getItem('ecoley_niveles') || '{}');

const mainContent = document.getElementById('main-content');

// =========================================================================
// BANCO DE ALTA COMPLEJIDAD CLASIFICADO POR NIVELES (1, 2 y 3)
// =========================================================================
const BANCO_EXPERTO_NIVELES = {
  "mod_1": [
    // NIVEL 2: SENIOR
    { nivel: 2, tipo: "Nivel 2 • Casuística ECA vs LMP", pregunta: "En la supervisión de una PTAR de campamento vial que descarga a un río de Categoría 3 (D.S. 004-2017-MINAM), el efluente cumple el LMP de DBO5 (100 mg/L según D.S. 003-2010-MINAM), pero a 50 metros aguas abajo (fuera de la zona de mezcla) el río presenta 28 mg/L de DBO5 (superando el ECA Cat 3 que es 15 mg/L). ¿Qué acción legal corresponde?", opciones: ["El titular no comete infracción por LMP, pero la ANA y la autoridad ambiental pueden exigir la modificación del IGA o revisar la autorización de vertimiento por afectación de la capacidad asimilativa del cuerpo receptor (Art. 31 y 32 Ley N° 28611)", "Se multa automáticamente por superar el ECA aunque aguas arriba ya viniera contaminado sin probar causalidad", "Si cumple el LMP nunca importa cómo quede el río receptor", "Se clausura el río inmediatamente"], correcta: 0, explicacion: "Base Legal: Art. 31 y 32 de la Ley N° 28611 (Ley General del Ambiente) y Ley N° 29338. Ningún titular es sancionado por exceder el ECA salvo que se demuestre causalidad; sin embargo, si el cuerpo receptor se degrada pese a cumplir el LMP, la autoridad debe ajustar los instrumentos de gestión o las condiciones del vertimiento." },
    { nivel: 2, tipo: "Nivel 2 • Emergencia Ambiental", pregunta: "Una cisterna que abastece a tu obra sufre una volcadura derramando 800 galones de diésel cerca de un bofedal altoandino. Según el Reglamento del Reporte de Emergencias Ambientales del OEFA (RCD N° 018-2013-OEFA/CD y sus modificatorias como RCD N° 028-2019-OEFA/CD), ¿cuál es el procedimiento de reporte obligatorio?", opciones: ["Activar el Plan de Contingencia de inmediato, realizar el Reporte Preliminar dentro de las primeras 12 horas (vía ERA Emergencias) y el Reporte Final dentro de los 10 días hábiles siguientes al evento", "Esperar 30 días hábiles para ver si la lluvia limpia el bofedal", "Solo avisar por teléfono a la comisaría sin reportar a la autoridad ambiental", "Reportarlo recién en el Informe Semestral de Monitoreo"], correcta: 0, explicacion: "Base Legal: RCD N° 018-2013-OEFA/CD (modificada por RCD N° 028-2019-OEFA/CD). El Reporte Preliminar se presenta dentro de las 12 horas de ocurrido el evento y el Reporte Final en 10 días hábiles." },
    // NIVEL 3: EXPERTO / FISCALIZADOR
    { nivel: 3, tipo: "Nivel 3 • Auditoría SINEFA / Caducidad PAS", pregunta: "El OEFA o una EFA inicia un Procedimiento Administrativo Sancionador (PAS) notificando la imputación de cargos a un administrado. Según el Art. 259 del TUO de la Ley N° 27444 (Ley del Procedimiento Administrativo General), ¿cuál es el plazo de CADUCIDAD administrativa del procedimiento para resolver en primera instancia?", opciones: ["Nueve (09) meses contados desde la fecha de notificación de la imputación de cargos (prorrogables excepcionalmente por 3 meses adicionales debidamente sustentados antes de su vencimiento)", "Cinco (05) años desde la notificación de cargos", "Treinta (30) días calendario improrrogables", "En materia ambiental nunca caduca el procedimiento sancionador"], correcta: 0, explicacion: "Base Legal: Art. 259 del TUO de la Ley N° 27444 (D.S. N° 004-2019-JUS). No confundir PRESCRIPCIÓN de la infracción (4 años, Art. 252) con CADUCIDAD del PAS (9 meses + 3 meses de ampliación máxima). Si vence el plazo sin resolución, el PAS caduca de pleno derecho y se archiva." },
    { nivel: 3, tipo: "Nivel 3 • Eximente de Responsabilidad (Subsanación)", pregunta: "Durante una supervisión regular de OEFA se detecta que el almacén de residuos peligrosos no tenía la señalización NFPA (incumplimiento leve sin daño ambiental). Antes de que le notifiquen la imputación de cargos del PAS, el titular instala toda la señalización y acredita la corrección. Según el Art. 257 del TUO de la Ley N° 27444 y el Reglamento de Supervisión del OEFA, ¿qué figura legal se configura?", opciones: ["Subsanación voluntaria con anterioridad a la notificación de imputación de cargos, lo que constituye un Eximente de Responsabilidad Administrativa (archivo del extremo)", "Igual se le impone el 100% de la multa porque la responsabilidad es objetiva", "La subsanación solo rebaja el 5% de la multa", "Se le duplica la sanción por reconocer la falta"], correcta: 0, explicacion: "Base Legal: Literal f) del numeral 1 del Art. 257 del TUO de la Ley N° 27444 y Art. 20 del Reglamento de Supervisión del OEFA (RCD N° 006-2019-OEFA/CD). Si la subsanación es voluntaria (sin requerimiento previo del supervisor o en incumplimientos leves) y ANTES de la imputación de cargos, exime de responsabilidad." }
  ],
  "mod_2": [
    // NIVEL 2: SENIOR
    { nivel: 2, tipo: "Nivel 2 • Modificatoria D.S. 040-2023-MTC / ITS", pregunta: "En plena obra vial, el contratista requiere reubicar una planta de chancado y ampliar un DME. Sin embargo, el nuevo polígono del DME se superpone con la Zona de Amortiguamiento de un Área Natural Protegida (ANP) y afecta un cuerpo de agua. ¿Puede tramitarse mediante un Informe Técnico Sustentatorio (ITS) según el Art. 20 del D.S. N° 004-2017-MTC?", opciones: ["No procede ITS. El Art. 20 prohíbe expresamente aplicar ITS cuando la modificación se ubique en ANP, Zona de Amortiguamiento o afecte cuerpos de agua, cabeceras de cuenca o bofedales; corresponde Modificación del EIA (MEIA)", "Sí procede ITS presentando una declaración jurada simple", "Sí procede FITSA aunque tenga EIA-d aprobado", "No requiere ningún trámite si el SERNANP no visita la obra"], correcta: 0, explicacion: "Base Legal: Art. 20 del D.S. N° 004-2017-MTC (y sus modificatorias D.S. 008-2019-MTC / D.S. 040-2023-MTC). El ITS tiene supuestos de improcedencia taxativos: no aplica si afecta cuerpos de agua, bofedales, ANP o Zonas de Amortiguamiento (salvo excepciones con opinión previa de SERNANP)." },
    { nivel: 2, tipo: "Nivel 2 • Cierre de Cantera Fluvial", pregunta: "Durante la explotación de una cantera fluvial autorizada en el río Huallaga, el contratista realiza excavaciones en pozas profundas de 4 metros por debajo del nivel dinámico del cauce y corta el flujo hacia una bocatoma agrícola. ¿Qué infracciones técnicas y legales se están cometiendo?", opciones: ["Incumplimiento de las condiciones de la Opinión Técnica Vinculante de la ANA (Ley N° 28221 y Ley N° 29338) y del PMA del D.S. N° 004-2017-MTC, al alterar el régimen hidráulico, profundizar por debajo del thalweg/nivel de aguas mínimas y afectar derechos de uso de agua de terceros", "Ninguna, porque teniendo permiso municipal puede excavar hasta 20 metros de profundidad", "Solo es una falta laboral ante SUNAFIL", "Es válido si luego llena las pozas con basura municipal"], correcta: 0, explicacion: "Base Legal: Ley N° 28221, Ley N° 29338 y Guía de Manejo Ambiental del MTC. La extracción en álveo o cauce debe hacerse en seco (bancos laterales/barras), sin excavar pozas bajo el nivel de agua que generen erosión retrógrada o desvíen el eje hidráulico." },
    // NIVEL 3: EXPERTO / FISCALIZADOR
    { nivel: 3, tipo: "Nivel 3 • Superposición de Competencias en Vías", pregunta: "Una Municipalidad Provincial ejecuta la apertura de una trocha carrozable nueva de 18 km sin contar con Certificación Ambiental (no tiene DIA ni EIA-sd) y arroja el material de corte directamente a la ladera destruyendo cobertura boscosa. ¿Qué autoridades tienen competencia concurrente para fiscalizar y sancionar este hecho?", opciones: ["1° La DGAAM-MTC (como EFA sectorial en transportes por ejecutar proyecto vial sin certificación ambiental), 2° SERFOR / ARFFS (por desbosque no autorizado bajo Ley N° 29763) y 3° La Fiscalía Especializada en Materia Ambiental (FEMA) por delito ambiental", "Nadie puede sancionar a una Municipalidad Provincial porque tiene autonomía constitucional absoluta", "Solo la SUNASS", "Solo el Ministerio de Vivienda"], correcta: 0, explicacion: "Base Legal: D.S. N° 004-2017-MTC (ejecutar obra sin IGA es infracción muy grave), Ley N° 29763 (desbosque sin autorización) y Código Penal Art. 304 / 310 (Delitos contra los recursos naturales y bosques, competencia de FEMA). La autonomía municipal no exime del cumplimiento del SEIA." },
    { nivel: 3, tipo: "Nivel 3 • Valorización de Pavimento Asfáltico (RAP)", pregunta: "En la rehabilitación de una carretera nacional se realiza el fresado de 15,000 m³ de carpeta asfáltica antigua (RAP). El residente propone reutilizar el 40% en la subbase y el 60% restante disponerlo en un DME convencional como material excedente inerte. Como Especialista Ambiental, ¿cuál es tu dictamen normativo bajo el D.L. N° 1278 y el D.S. N° 004-2017-MTC?", opciones: ["El reaprovechamiento (valorización) del RAP en la misma vía es prioritario (Art. 2 y 55 D.L. 1278); sin embargo, el excedente asfáltico NO puede arrojarse libremente en un DME común sin que el IGA lo contemple o sin encapsulado/manejo como residuo de construcción (D.S. 003-2013-VIVIENDA) por su contenido de hidrocarburos bituminosos", "El asfalto fresado se puede tirar al río porque es piedra con petróleo", "Está prohibido reutilizar el asfalto fresado en el Perú", "Se debe quemar el asfalto sobrante en el campamento"], correcta: 0, explicacion: "Base Legal: D.L. N° 1278 (Principio de Economía Circular y Valorización), D.S. N° 003-2013-VIVIENDA y Especificaciones Técnicas Generales para Construcción (EG-2013 MTC). El RAP que no se valoriza no es tierra inerte común; requiere disposición controlada." }
  ],
  "mod_3": [
    // NIVEL 2: SENIOR
    { nivel: 2, tipo: "Nivel 2 • Reconversión vs Recuperación de Botaderos", pregunta: "Eres contratado por una Municipalidad Provincial para regularizar su botadero de 8 hectáreas que lleva 5 años operando sin IGA. Al hacer el estudio técnico verificas que el terreno cumple con estar a 1,200 m de la población, tiene arcilla impermeable natural y vida útil remanente, y el alcalde quiere convertirlo en Relleno Sanitario formal. Según el Art. 66 del D.L. N° 1278 y el D.S. N° 014-2017-MINAM, ¿qué instrumento correctivo corresponde?", opciones: ["Programa de Reconversión y Manejo de Áreas Degradadas por Residuos Sólidos (aprobado por la autoridad competente para adecuar áreas construidas sobre la base de un expediente técnico a relleno sanitario)", "Plan de Recuperación de Áreas Degradadas (porque el Plan de Recuperación es exclusivamente para el CIERRE o clausura del botadero)", "Una FITSA ante el MTC", "Un PAMA industrial ante PRODUCE"], correcta: 0, explicacion: "Base Legal: Art. 65 y 66 del D.L. N° 1278 (modificado por D.L. N° 1501). Diferencia clave de examen: RECUPERACIÓN = Cierre definitivo y remediación del botadero; RECONVERSIÓN = Adecuación técnica de un área degradada viable para que opere formalmente como Relleno Sanitario." },
    { nivel: 2, tipo: "Nivel 2 • PTAR Municipal y Autorización ANA", pregunta: "Fiscalizas la PTAR de una EPS o Municipalidad que descarga 45 L/s de aguas residuales tratadas a un río. Tienen DIA aprobada por el MVCS, pero su Autorización de Vertimiento de la ANA venció hace 8 meses y siguen descargando al río. Según la Ley N° 29338 (Ley de Recursos Hídricos) y su Reglamento (D.S. N° 001-2010-AG), ¿en qué situación legal se encuentran?", opciones: ["Infracción Muy Grave en materia de recursos hídricos por efectuar vertimientos de aguas residuales en los cuerpos de agua sin autorización vigente de la Autoridad Nacional del Agua (Art. 79 Ley N° 29338 y Art. 277 de su Reglamento)", "Si tienen DIA del Ministerio de Vivienda nunca necesitan permiso de la ANA", "La autorización de vertimiento es perpetua y nunca vence", "Solo es sancionable si el alcalde no paga el recibo de luz"], correcta: 0, explicacion: "Base Legal: Art. 79 y 120 de la Ley N° 29338 y Art. 277 del D.S. N° 001-2010-AG. La Autorización de Vertimiento tiene un plazo determinado (entre 2 a 6 años renovables) y descargar con la autorización vencida equivale a verter sin autorización." },
    // NIVEL 3: EXPERTO / FISCALIZADOR
    { nivel: 3, tipo: "Nivel 3 • Fiscalización SINEFA y Omisión de Funciones", pregunta: "Durante la supervisión del OEFA a una Municipalidad Distrital (EFA local), se comprueba que la municipalidad NO aprobó su PLANEFA, NO atendió 15 denuncias vecinales por ruidos molestos y emisiones de ladrilleras artesanales, y destinó el presupuesto ambiental a fiestas patronales. ¿A qué órgano de control o entidad remite el OEFA el informe de incumplimiento de funciones de los funcionarios municipales?", opciones: ["A la Contraloría General de la República (Órgano de Control Institucional - OCI) por responsabilidad administrativa funcional de los servidores públicos, y al Ministerio Público si configura delito de Omisión de Funciones (Art. 377 del Código Penal)", "El OEFA le pone una multa económica personal directamente al sueldo del gerente municipal", "El OEFA disuelve la municipalidad y nombra un nuevo alcalde", "No pasa nada porque el PLANEFA es voluntario"], correcta: 0, explicacion: "Base Legal: Art. 7 y 11 de la Ley N° 29325 (Ley del SINEFA) y Lineamientos del PLANEFA (RCD N° 004-2019-OEFA/CD). Cuando una EFA incumple sus funciones de fiscalización ambiental, el OEFA comunica a la Contraloría General de la República para las acciones de responsabilidad funcional." },
    { nivel: 3, tipo: "Nivel 3 • Celdas Transitorias de Emergencia", pregunta: "Se declara en Situación de Emergencia la gestión y manejo de los residuos sólidos en un distrito por colapso total de su disposición final (Art. 125 del D.S. N° 014-2017-MINAM). ¿Qué infraestructura temporal excepcional contempla la normativa mientras se construye el relleno sanitario definitivo y cuál es su plazo máximo de operación?", opciones: ["Habilitación de Celdas Transitorias para la disposición final de residuos sólidos municipales, con una vida útil máxima de hasta tres (03) años (según el Art. 123 y siguientes del D.S. N° 014-2017-MINAM y sus modificatorias)", "Abrir un botadero a la orilla del río por 20 años", "Arrojar los residuos en los DME de las carreteras del MTC", "Quemar toda la basura en el estadio municipal"], correcta: 0, explicacion: "Base Legal: Título X (Declaratoria de Emergencia) y Art. 123-126 del D.S. N° 014-2017-MINAM (modificado por D.S. N° 001-2022-MINAM). Las Celdas Transitorias son instalaciones de emergencia diseñadas con impermeabilización y drenaje de lixiviados por un plazo máximo de hasta 3 años." }
  ],
  "mod_4": [
    // NIVEL 2: SENIOR
    { nivel: 2, tipo: "Nivel 2 • Paralización de Obra por Riesgo Inminente", pregunta: "Como Especialista SSOMA inspeccionas el frente de excavación de un estribo de puente de 4.50 m de profundidad con presencia de filtración de agua (nivel freático), talud vertical de 90° sin entibado y vibración de maquinaria pesada al borde. El Ingeniero Residente te ordena continuar porque están atrasados en la valorización. Según el Art. 63 de la Ley N° 29783 y el D.S. N° 011-2019-TR, ¿qué facultad legal tienes tú y los trabajadores?", opciones: ["Interrumpir de inmediato las actividades y ordenar el retiro del personal del área por Riesgo Grave e Inminente para la vida; la ley prohíbe sancionar a los trabajadores que paralicen labores o abandonen el puesto ante un peligro inminente no controlado", "Obedecer al Residente y solo hacerles firmar un ATS diciendo que trabajan bajo su propio riesgo", "Tomar una foto y esperar 5 días a que el Comité de SST se reúna", "Ponerles doble casco a los obreros para que resistan el derrumbe"], correcta: 0, explicacion: "Base Legal: Art. 63 de la Ley N° 29783 (Interrupción de actividades en caso de peligro inminente) y Numeral 23 de la Norma G.050. Ninguna meta de producción o valorización está por encima del riesgo de sepultamiento." },
    { nivel: 2, tipo: "Nivel 2 • Investigación de Accidente y Comité SST", pregunta: "Un operario sufre la amputación traumática de dos dedos manipulando una cortadora de concreto sin guarda de seguridad (Accidente de Trabajo Incapacitante). Según el Art. 82 de la Ley N° 29783 y el D.S. N° 005-2012-TR, ¿quiénes deben participar en la investigación del accidente y quién notifica este accidente incapacitante al MTPE?", opciones: ["La investigación la realiza el empleador junto con el Comité/Subcomité de SST (o Supervisor) y representantes de los trabajadores; y el Centro Médico Asistencial (clínica/hospital) que atiende al herido notifica el accidente de trabajo al MTPE hasta el último día hábil del mes siguiente (mientras que el empleador notifica los mortales en 24h)", "Solo investiga el gerente general en secreto sin el Comité de SST", "Los accidentes no mortales nunca se investigan ni se registran", "Solo interviene la Policía de Tránsito"], correcta: 0, explicacion: "Base Legal: Art. 82 y 92 de la Ley N° 29783 y Art. 110 del D.S. N° 005-2012-TR. Distinción clave de fiscalización SUNAFIL: el empleador notifica en 24h los accidentes MORTALES y los Incidentes Peligrosos; el Centro Médico Asistencial notifica los accidentes de trabajo no mortales y enfermedades ocupacionales." },
    // NIVEL 3: EXPERTO / FISCALIZADOR
    { nivel: 3, tipo: "Nivel 3 • Responsabilidad Penal (Art. 168-A Código Penal)", pregunta: "Tras el derrumbe de una zanja sin entibar donde fallece un trabajador de tu obra vial, la pericia de SUNAFIL y de la Fiscalía demuestra que el Ingeniero Residente y el empleador habían sido advertidos por escrito de la falta de entibado y aun así ordenaron bajar al personal infringiendo deliberadamente la Norma G.050 y la Ley N° 29783. ¿Qué delito penal se configura en el Perú?", opciones: ["Delito de Atentado contra las Condiciones de Seguridad y Salud en el Trabajo (Art. 168-A del Código Penal, modificado por Ley N° 30222 y D.U. N° 044-2019), sancionado con pena privativa de la libertad de 4 a 8 años en caso de muerte", "No existe cárcel por accidentes de trabajo en el Perú, solo multa administrativa", "Solo es una falta civil que se arregla pagando el sepelio", "La responsabilidad recae únicamente en el obrero fallecido"], correcta: 0, explicacion: "Base Legal: Art. 168-A del Código Penal Peruano (modificado por el Decreto de Urgencia N° 044-2019). Quien deliberadamente infringe las normas de SST y pone en peligro inminente la vida de los trabajadores causando la muerte, enfrenta pena efectiva de entre 4 y 8 años de prisión." },
    { nivel: 3, tipo: "Nivel 3 • Subcontratistas y Responsabilidad Solidaria", pregunta: "El Consorcio Vial principal subcontrata a una pequeña empresa local para el transporte de agregados y perfilado de cunetas. Esta subcontratista hace trabajar a 12 obreros sin SCTR (Seguro Complementario de Trabajo de Riesgo), sin EMO y sin EPP. Durante una inspección de SUNAFIL ocurre un accidente grave. Según el Art. 68 de la Ley N° 29783, ¿quién asume la responsabilidad legal y económica?", opciones: ["El Consorcio Vial (empleador principal) es responsable solidario frente a los daños e indemnizaciones, ya que tiene el deber legal de vigilar el cumplimiento de la normativa de SST y la contratación del SCTR por parte de sus contratistas y subcontratistas en su obra", "El Consorcio Vial queda libre de toda culpa mostrando el contrato de locación de servicios", "SUNAFIL solo puede multar al chofer del volquete", "El SCTR es opcional para subcontratistas que trabajan menos de 30 días"], correcta: 0, explicacion: "Base Legal: Art. 68 de la Ley N° 29783 (Seguridad en las contratistas, subcontratistas, empresas especiales de servicios y cooperativas de trabajadores). El titular de la obra responde solidariamente si permite que personal de terceros labore en sus instalaciones sin SCTR ni condiciones de seguridad." }
  ]
};

// =========================================================================
// MOTOR GENERADOR PARAMÉTRICO EN TIEMPO REAL (Crea casos nuevos al vuelo)
// =========================================================================
function fabricarPreguntasTiempoReal(modId, nivel) {
  const generadas = [];
  const ts = Date.now();

  if (modId === 'mod_1') {
    const zonas = [
      { nombre: "Zona Residencial", d: 60, n: 50 },
      { nombre: "Zona Comercial", d: 70, n: 60 },
      { nombre: "Zona Industrial", d: 80, n: 70 },
      { nombre: "Zona de Protección Especial (Hospital/Colegio)", d: 50, n: 40 }
    ];
    const z = zonas[Math.floor(Math.random() * zonas.length)];
    const esNoche = Math.random() > 0.5;
    const limite = esNoche ? z.n : z.d;
    const medido = limite + Math.floor(Math.random() * 14) + 3;

    generadas.push({
      id: ts + 1,
      nivel: nivel,
      tipo: `Tiempo Real • Nivel ${nivel} (Simulación ECA Ruido)`,
      pregunta: `[CASO EN VIVO] Realizas un monitoreo de ruido ambiental en horario ${esNoche ? 'NOCTURNO (23:30 h)' : 'DIURNO (11:15 h)'} en el lindero de una ${z.nombre} colindante a las actividades de maquinaria. El sonómetro Clase 1 calibrado registra un LAeqT de ${medido} dBA. Según el D.S. N° 085-2003-PCM, ¿cuál es el dictamen técnico exacto?`,
      opciones: [
        `Supera el ECA Ruido en ${medido - limite} dBA, ya que el límite máximo para ${z.nombre} en horario ${esNoche ? 'nocturno' : 'diurno'} es de ${limite} dBA`,
        `Cumple el ECA Ruido, porque el límite permitido en ese horario es de ${limite + 15} dBA`,
        `Supera el ECA solo si el ruido dura más de 72 horas continuas sin parar`,
        `No aplica el D.S. 085-2003-PCM porque el límite único nacional es 90 dBA`
      ],
      correcta: 0,
      explicacion: `Base Legal: Anexo N° 1 del D.S. N° 085-2003-PCM (ECA Ruido). En ${z.nombre}, el estándar es ${z.d} dBA diurno (07:01-22:00) y ${z.n} dBA nocturno (22:01-07:00). Con ${medido} dBA tienes un exceso de ${medido - limite} dBA que exige barreras acústicas o restricción horaria.`
    });

    const paramsPTAR = [
      { p: "DBO5", lim: 100, u: "mg/L" },
      { p: "DQO", lim: 200, u: "mg/L" },
      { p: "Aceites y Grasas", lim: 20, u: "mg/L" },
      { p: "Sólidos Totales en Suspensión (SST)", lim: 150, u: "mg/L" }
    ];
    const par = paramsPTAR[Math.floor(Math.random() * paramsPTAR.length)];
    const valorMuestra = Math.round(par.lim * (1.25 + Math.random() * 0.6));

    generadas.push({
      id: ts + 2,
      nivel: nivel,
      tipo: `Tiempo Real • Nivel ${nivel} (Fiscalización LMP)`,
      pregunta: `[CASO EN VIVO] El informe de ensayo acreditado por INACAL del efluente de una PTAR arroja una concentración de ${par.p} de ${valorMuestra} ${par.u} en la caja de registro de salida antes del cuerpo receptor. De acuerdo con el D.S. N° 003-2010-MINAM, ¿qué concluyes como fiscalizador?`,
      opciones: [
        `Incumplimiento sancionable: excede el LMP de ${par.p} cuyo valor máximo permitido es ${par.lim} ${par.u} (exceso de ${valorMuestra - par.lim} ${par.u})`,
        `Cumple la norma, porque el LMP para ${par.p} es de ${par.lim * 3} ${par.u}`,
        `No es fiscalizable porque en el tubo de salida se aplica el ECA Suelo`,
        `Cumple siempre que el operador diluya el efluente con agua potable antes de tomar la muestra`
      ],
      correcta: 0,
      explicacion: `Base Legal: Anexo del D.S. N° 003-2010-MINAM (LMP para efluentes de PTAR domésticas o municipales). El LMP para ${par.p} es ${par.lim} ${par.u}. Nota: La dilución de efluentes para lograr cumplir los LMP está terminantemente prohibida por el reglamento.`
    });
  }

  if (modId === 'mod_2') {
    const kmProg = Math.floor(Math.random() * 65) + 12;
    const volDME = (Math.floor(Math.random() * 40) + 15) * 1000;
    generadas.push({
      id: ts + 3,
      nivel: nivel,
      tipo: `Tiempo Real • Nivel ${nivel} (Casuística Vial MTC)`,
      pregunta: `[CASO EN VIVO] En la progresiva Km ${kmProg}+400 de tu obra vial (con EIA-sd aprobado), se requiere habilitar un DME adicional para disponer ${volDME.toLocaleString()} m³ de material de corte inerte. El área propuesta está fuera de ANP, a 250 m de un cauce seco y no afecta restos arqueológicos (cuenta con CIRA). ¿Cuál es la ruta crítica legal antes de meter el primer volquete?`,
      opciones: [
        `1° Elaborar y lograr la aprobación del ITS ante la DGAAM-MTC (Art. 20 D.S. 004-2017-MTC), 2° Contar con el Acta de Libre Disponibilidad del propietario y CIRA/PMAR, y 3° Retirar y acopiar el topsoil antes de conformar la primera capa`,
        `Depositar el material de inmediato por emergencia constructiva y regularizar el ITS al final del año`,
        `Presentar una FITSA solo por el DME aunque la carretera principal tenga EIA-sd`,
        `Pedir autorización verbal al supervisor de obra y compensar al dueño del terreno con horas-máquina`
      ],
      correcta: 0,
      explicacion: `Base Legal: Art. 20 y 68 del D.S. N° 004-2017-MTC. Ningún componente auxiliar nuevo en un proyecto categorizado puede ser intervenido físicamente antes de la resolución que aprueba el ITS o la MEIA. Intervenir antes configura infracción por ejecutar componentes no certificados.`
    });
  }

  if (modId === 'mod_3') {
    const cloroMedido = (Math.floor(Math.random() * 4) + 1) / 10; // 0.1 a 0.4 mg/L
    const pob = (Math.floor(Math.random() * 15) + 3) * 100;
    generadas.push({
      id: ts + 4,
      nivel: nivel,
      tipo: `Tiempo Real • Nivel ${nivel} (Fiscalización Saneamiento)`,
      pregunta: `[CASO EN VIVO] En la supervisión inopinada al sistema de agua potable de un centro poblado de ${pob} habitantes, realizas la medición con comparador colorimétrico DPD en la última vivienda de la red y obtienes ${cloroMedido} mg/L de cloro residual libre (y turbiedad de 7 UNT). Según el D.S. N° 031-2010-SA, ¿qué incumplimientos simultáneos se detectan?`,
      opciones: [
        `Doble incumplimiento sanitario: el cloro residual libre (${cloroMedido} mg/L) es inferior al mínimo obligatorio de 0.5 mg/L en red, y la turbiedad (7 UNT) supera el LMP de 5 UNT para agua de consumo humano`,
        `Ambos parámetros cumplen el D.S. N° 031-2010-SA porque el mínimo de cloro es 0.1 mg/L y la turbiedad máxima es 20 UNT`,
        `Solo incumple la turbiedad, pues el cloro en viviendas alejadas puede ser 0.0 mg/L`,
        `Se debe comparar con el D.S. 010-2019-VIVIENDA (VMA)`
      ],
      correcta: 0,
      explicacion: `Base Legal: Anexos I y III y Art. 63 del D.S. N° 031-2010-SA (Reglamento de la Calidad del Agua para Consumo Humano - DIGESA). El cloro residual libre en cualquier punto de la red debe ser >= 0.5 mg/L y la turbiedad no debe superar las 5 UNT.`
    });
  }

  if (modId === 'mod_4') {
    const profZanja = (Math.floor(Math.random() * 25) + 18) / 10; // 1.8 a 4.2 m
    const distMinAcopio = Math.max(0.6, +(profZanja / 2).toFixed(2));
    generadas.push({
      id: ts + 5,
      nivel: nivel,
      tipo: `Tiempo Real • Nivel ${nivel} (Cálculo SSOMA G.050)`,
      pregunta: `[CASO EN VIVO] Se ejecuta una zanja para tubería de drenaje vial de ${profZanja.toFixed(1)} metros de profundidad. De acuerdo con la regla matemática del Numeral 23 de la Norma Técnica G.050 (Seguridad durante la Construcción), ¿a qué distancia mínima del borde de la excavación debe acopiarse el material extraído para evitar sobrecarga y derrumbe del talud?`,
      opciones: [
        `A una distancia mínima de ${distMinAcopio} metros del borde (equivalente a la mitad de la profundidad de ${profZanja.toFixed(1)} m, y nunca menor a 0.60 m), además de exigir entibado y PETAR`,
        `A 0.20 metros del borde sin importar la profundidad`,
        `Exactamente sobre el labio del talud para que sirva de baranda natural`,
        `La Norma G.050 solo exige retirar el material cuando la zanja supera los 6.0 metros`
      ],
      correcta: 0,
      explicacion: `Base Legal: Numeral 23 de la Norma Técnica G.050. El material producto de la excavación debe colocarse a una distancia mínima del borde igual a la mitad de la profundidad de la excavación (H/2 = ${profZanja.toFixed(1)}/2 = ${distMinAcopio} m), nunca menor a 0.60 m.`
    });
  }

  return generadas;
}

function actualizarHeader() {
  document.getElementById('xp-display').textContent = `⚡ ${xpTotal}`;
  document.getElementById('lives-display').textContent = `❤️ ${vidas}`;
  document.getElementById('streak-display').textContent = `🔥 ${racha}`;
  const badge = document.getElementById('net-status');
  if (badge) {
    badge.innerHTML = navigator.onLine
      ? '🟢 Online <button onclick="forzarActualizacionApp()" style="background:#ffffff; color:#15803d; border:none; border-radius:8px; padding:2px 6px; font-weight:bold; font-size:0.7rem; margin-left:4px; cursor:pointer;">🔄 Actualizar</button>'
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
    // Las preguntas originales del JSON se asignan a Nivel 1 (Base/Plazos) si no tienen nivel
    mod.preguntas.forEach(p => { if (!p.nivel) p.nivel = 1; });

    // Inyectar banco experto de Niveles 2 y 3
    const expertas = BANCO_EXPERTO_NIVELES[mod.id] || [];
    expertas.forEach((p, idx) => {
      const idUnico = parseInt(mod.id.replace('mod_', '')) * 5000 + idx;
      if (!mod.preguntas.some(x => x.id === idUnico)) {
        mod.preguntas.push({ ...p, id: idUnico });
      }
    });

    // Inyectar las generadas por IA en tiempo real guardadas en el teléfono
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
    const n1Superado = nivelesSuperados[`${mod.id}_n1`] === true;
    const n2Superado = nivelesSuperados[`${mod.id}_n2`] === true;
    const n3Superado = nivelesSuperados[`${mod.id}_n3`] === true;

    html += `
      <div class="card">
        <span class="badge">${mod.categoria}</span>
        <span class="badge badge-ai">⚡ Generación en Tiempo Real Activa</span>
        <h2>${mod.titulo}</h2>
        <button class="btn btn-secondary" style="margin-bottom:8px; padding:10px;" onclick="verLeccion(${idx})">📖 Resumen Normativo del Módulo</button>
        
        <div style="display:flex; flex-direction:column; gap:6px; margin-top:6px;">
          <button class="btn btn-primary" style="margin:0; text-align:left; display:flex; justify-content:space-between;" onclick="iniciarPractica(${idx}, 1)">
            <span>🟢 Nivel 1: Base Legal y Plazos</span>
            <span>${n1Superado ? '✅' : '▶ Jugar'}</span>
          </button>
          <button class="btn" style="margin:0; background:#0284c7; color:white; box-shadow:0 4px 0 #0369a1; text-align:left; display:flex; justify-content:space-between;" onclick="iniciarPractica(${idx}, 2)">
            <span>🟠 Nivel 2: Casuística de Obra/Campo</span>
            <span>${n2Superado ? '✅' : '▶ Jugar'}</span>
          </button>
          <button class="btn" style="margin:0; background:#7e22ce; color:white; box-shadow:0 4px 0 #581c87; text-align:left; display:flex; justify-content:space-between;" onclick="iniciarPractica(${idx}, 3)">
            <span>🔴 Nivel 3: Fiscalizador / Experto</span>
            <span>${n3Superado ? '🏆' : '🔥 Reto'}</span>
          </button>
        </div>
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
  html += `<button class="btn" style="background:#e2e8f0; color:#334155;" onclick="mostrarInicio()">⬅ Volver a los Niveles</button>`;
  mainContent.innerHTML = html;
}

async function iniciarPractica(idx, nivelElegido) {
  if (vidas <= 0) {
    mostrarInicio();
    return;
  }
  moduloIndiceActual = idx;
  nivelActual = nivelElegido;
  moduloActual = dataNormativa.modulos[idx];

  // Si está en Nivel 2 o 3 y tiene internet, intenta traer 2 casos inéditos en vivo antes de arrancar
  if (navigator.onLine && nivelElegido >= 2) {
    mainContent.innerHTML = `
      <div class="card" style="text-align:center; padding:30px 15px;">
        <h2>⚡ Generando Casuística en Tiempo Real (Nivel ${nivelElegido})...</h2>
        <p style="font-size:0.9rem; color:#475569;">Construyendo escenario de supervisión ambiental y cruzando normativa peruana...</p>
      </div>
    `;
    await descargarPreguntasEnSegundoPlano(moduloActual.id, moduloActual.titulo, '', nivelElegido);
  }

  // Además inyectamos preguntas paramétricas en tiempo real (con cálculos nuevos en cada partida)
  const enVivoParametricas = fabricarPreguntasTiempoReal(moduloActual.id, nivelElegido);
  
  // Filtramos las del nivel elegido + las de tiempo real
  const delNivel = moduloActual.preguntas.filter(p => (p.nivel || 1) === nivelElegido);
  let noVistas = delNivel.filter(p => !preguntasVistas.includes(p.id));

  if (noVistas.length < 3) {
    // Si ya vio casi todas las de este nivel, las destrabamos para mezclarlas con las nuevas en tiempo real
    const idsNivel = delNivel.map(p => p.id);
    preguntasVistas = preguntasVistas.filter(id => !idsNivel.includes(id));
    localStorage.setItem('ecoley_vistas', JSON.stringify(preguntasVistas));
    noVistas = [...delNivel];
  }

  const bolsaCombinada = [...enVivoParametricas, ...mezclarArray(noVistas)];
  const seleccionadas = bolsaCombinada.slice(0, PREGUNTAS_POR_SESION);

  preguntasSesion = seleccionadas.map(p => {
    const idxCorrecto = (typeof p.correcta === 'number' && p.opciones[p.correcta]) ? p.correcta : 0;
    const textoCorrecto = p.opciones[idxCorrecto];
    const opcionesMezcladas = mezclarArray(p.opciones);
    return {
      ...p,
      opciones: opcionesMezcladas,
      correcta: opcionesMezcladas.indexOf(textoCorrecto)
    };
  });

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
  preguntasSesion = mezclarArray(falladas).slice(0, Math.min(5, falladas.length)).map(p => {
    const textoCorrecto = p.opciones[p.correcta || 0];
    const opcionesMezcladas = mezclarArray(p.opciones);
    return { ...p, opciones: opcionesMezcladas, correcta: opcionesMezcladas.indexOf(textoCorrecto) };
  });
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
    <span class="badge ${nivelActual === 3 ? 'badge-ai' : ''}">${p.tipo} (${indicePregunta + 1}/${total})</span>
    <h2 style="font-size:1.0rem; line-height:1.42;">${p.pregunta}</h2>
    <div id="opciones-container">${opcionesHtml}</div>
    <div id="feedback" class="feedback-box"></div>
    <button id="btn-siguiente" class="btn btn-primary" style="display:none;" onclick="siguientePregunta(${esRepaso})">Continuar ➔</button>
    <button class="btn" style="background:transparent; color:#64748b; font-size:0.82rem; margin-top:8px;" onclick="mostrarInicio()">⬅ Salir al menú</button>
  `;
}

function verificarRespuesta(seleccion, esRepaso) {
  const p = preguntasSesion[indicePregunta];
  document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);

  if (!preguntasVistas.includes(p.id)) {
    preguntasVistas.push(p.id);
    localStorage.setItem('ecoley_vistas', JSON.stringify(preguntasVistas));
  }

  const puntosPorNivel = nivelActual * 10; // Nivel 1 = 10 XP, Nivel 2 = 20 XP, Nivel 3 = 30 XP
  const feedback = document.getElementById('feedback');

  if (seleccion === p.correcta) {
    document.getElementById(`opt-${seleccion}`).classList.add('correct');
    aciertosSesion++;
    xpTotal += puntosPorNivel;
    localStorage.setItem('ecoley_xp', xpTotal);
    preguntasFalladas = preguntasFalladas.filter(id => id !== p.id);
    localStorage.setItem('ecoley_falladas', JSON.stringify(preguntasFalladas));
    feedback.className = 'feedback-box feedback-ok';
    feedback.innerHTML = `<strong>¡Correcto! (+${puntosPorNivel} XP)</strong><br>${p.explicacion}`;
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
    } else if (aciertosSesion >= 3) {
      nivelesSuperados[`${moduloActual.id}_n${nivelActual}`] = true;
      localStorage.setItem('ecoley_niveles', JSON.stringify(nivelesSuperados));
    }
    actualizarHeader();

    mainContent.innerHTML = `
      <div class="card" style="text-align:center;">
        <h2>🎉 ¡Nivel ${nivelActual} Completado!</h2>
        <p style="font-size:1.15rem;">Aciertos: <strong>${aciertosSesion} de ${preguntasSesion.length}</strong></p>
        ${!esRepaso ? `<button class="btn btn-ai" onclick="iniciarPractica(${moduloIndiceActual}, ${nivelActual})">⚡ Generar Otra Ronda en Tiempo Real (Nivel ${nivelActual})</button>` : ''}
        ${!esRepaso && nivelActual < 3 ? `<button class="btn btn-secondary" onclick="iniciarPractica(${moduloIndiceActual}, ${nivelActual + 1})">🔥 Subir a Nivel ${nivelActual + 1} (Más difícil)</button>` : ''}
        <button class="btn btn-primary" onclick="mostrarInicio()">Volver al Menú Principal</button>
      </div>
    `;
  }
}

// =========================================================================
// CONEXIÓN EN TIEMPO REAL CON IA PARA CASUÍSTICA AVANZADA
// =========================================================================
async function descargarPreguntasEnSegundoPlano(modId, modTitulo, temaEspecifico, nivel = 3) {
  try {
    const semilla = Math.floor(Math.random() * 9999999);
    const descNivel = nivel === 3
      ? "NIVEL 3 EXPERTO/FISCALIZADOR: casos complejos con colisión de competencias (OEFA, ANA, MTC, SENACE, SUNAFIL, Contraloría, FEMA), plazos de caducidad/prescripción, medidas preventivas y artículos exactos."
      : "NIVEL 2 SENIOR: casuística técnica de supervisión en obra vial, DME, canteras, PTAR, rellenos sanitarios o excavaciones G.050.";

    const prompt = `Actúa como auditor senior de OEFA, DGAAM-MTC y SUNAFIL en Perú. Crea 2 preguntas nuevas de opción múltiple (${descNivel}) para el módulo "${modTitulo}". ${temaEspecifico ? 'Enfócate en: ' + temaEspecifico : ''} Semilla: ${semilla}. Cita el Decreto Supremo o Ley peruana exacta y el artículo en la explicación. Responde SOLO un JSON Array válido sin markdown: [{"id":1,"nivel":${nivel},"tipo":"Tiempo Real • Nivel ${nivel}","pregunta":"Caso complejo...","opciones":["Respuesta técnica correcta","Distractor técnico 1","Distractor 2","Distractor 3"],"correcta":0,"explicacion":"Base Legal: Art. X del D.S. N°..."}]`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500); // Máximo 6.5 seg para no hacer esperar al usuario

    const res = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'openai',
        messages: [
          { role: 'system', content: 'Devuelves únicamente un JSON array válido con preguntas de ingeniería y legislación ambiental peruana.' },
          { role: 'user', content: prompt }
        ]
      })
    });
    clearTimeout(timeoutId);

    const data = await res.json();
    const texto = data.choices[0].message.content;
    const inicio = texto.indexOf('[');
    const fin = texto.lastIndexOf(']');
    if (inicio !== -1 && fin !== -1) {
      const nuevas = JSON.parse(texto.substring(inicio, fin + 1));
      if (Array.isArray(nuevas) && nuevas.length > 0) {
        nuevas.forEach((p, i) => {
          p.id = Date.now() + i + Math.floor(Math.random() * 10000);
          p.nivel = nivel;
        });
        if (!preguntasExtraIA[modId]) preguntasExtraIA[modId] = [];
        preguntasExtraIA[modId] = nuevas.concat(preguntasExtraIA[modId]);
        localStorage.setItem('ecoley_preguntas_ia', JSON.stringify(preguntasExtraIA));
        inyectarBancoExpandido();
        return nuevas.length;
      }
    }
  } catch (e) {
    console.log('Usando generador paramétrico instantáneo.');
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
      <span class="badge badge-ai">Simulador de Casos Complejos</span>
      <h2>✨ Crear Casuística a Medida en Tiempo Real</h2>
      <p style="font-size:0.85rem; color:#475569;">Escribe una situación real que estés viviendo en tu obra vial o en la municipalidad y el sistema creará preguntas de Nivel Experto sobre ese caso:</p>
      
      <label style="font-size:0.82rem; font-weight:bold;">1. Módulo:</label>
      <select id="modulo-destino" class="input-box">${opcionesModulos}</select>

      <label style="font-size:0.82rem; font-weight:bold;">2. Nivel de Complejidad:</label>
      <select id="nivel-destino" class="input-box">
        <option value="3">🔴 Nivel 3: Auditor / Fiscalizador Experto (Casos difíciles)</option>
        <option value="2">🟠 Nivel 2: Especialista Senior en Obra</option>
      </select>

      <label style="font-size:0.82rem; font-weight:bold;">3. Norma o Caso Práctico a entrenar:</label>
      <textarea id="tema-especifico" class="input-box" rows="3" placeholder="Ej: 'Incumplimiento de compromisos ambientales en cierre de DME', 'Supervisión de lixiviados en relleno sanitario', 'Procedimiento sancionador OEFA'..."></textarea>

      <button class="btn btn-ai" id="btn-generar-ia" onclick="generarManualmente()">⚡ Generar Casos de Nivel Experto</button>
      <div id="ia-status" style="margin-top:12px; font-size:0.88rem; font-weight:bold;"></div>
    </div>
  `;
}

async function generarManualmente() {
  const modId = document.getElementById('modulo-destino').value;
  const nivel = parseInt(document.getElementById('nivel-destino').value);
  const modObj = dataNormativa.modulos.find(m => m.id === modId);
  const tema = document.getElementById('tema-especifico').value.trim();
  const statusDiv = document.getElementById('ia-status');
  const btn = document.getElementById('btn-generar-ia');

  btn.disabled = true;
  statusDiv.style.color = '#7e22ce';
  statusDiv.textContent = '⏳ Redactando casuística de alta complejidad...';

  const creadas = await descargarPreguntasEnSegundoPlano(modId, modObj.titulo, tema, nivel);
  statusDiv.style.color = '#16a34a';
  statusDiv.innerHTML = `✅ ¡Listo! Casos de Nivel ${nivel} inyectados en "${modObj.titulo}". Ve a la pestaña Módulos y entra al Nivel ${nivel}.`;
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
