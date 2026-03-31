import { useState, useEffect } from 'react'

// ─── DATOS DE LOS CUESTIONARIOS ───────────────────────────────────────────────

const BAI_OPCIONES = [
  { label: 'En absoluto', value: 0 },
  { label: 'Levemente', value: 1 },
  { label: 'Moderadamente', value: 2 },
  { label: 'Severamente', value: 3 },
]

const BAI_PREGUNTAS = [
  'Sensación de torpeza o entumecimiento', 'Sensación de acaloramiento', 'Temblor en las piernas',
  'Incapacidad para relajarse', 'Temor a que ocurra lo peor', 'Mareos o aturdimiento',
  'Palpitaciones o corazón acelerado', 'Sensación de inestabilidad', 'Atemorizado',
  'Nerviosismo', 'Sensación de estar bloqueado', 'Temblores en las manos',
  'Inquietud o inseguridad', 'Miedo a perder el control', 'Sensación de ahogo',
  'Temor a morir', 'Sensación de miedo', 'Problemas digestivos',
  'Sensación de desvanecimiento', 'Rubor facial', 'Sudoración fría o caliente',
]

const PSS_OPCIONES = [
  { label: 'Nunca', value: 0 },
  { label: 'Casi nunca', value: 1 },
  { label: 'De vez en cuando', value: 2 },
  { label: 'A menudo', value: 3 },
  { label: 'Muy a menudo', value: 4 },
]

const PSS_PREGUNTAS = [
  '¿Con qué frecuencia te has sentido afectado por algo que ocurrió inesperadamente?',
  '¿Con qué frecuencia te has sentido incapaz de controlar las cosas importantes en tu vida?',
  '¿Con qué frecuencia te has sentido nervioso o estresado?',
  '¿Con qué frecuencia has manejado con éxito los pequeños problemas irritantes de la vida?', 
  '¿Con qué frecuencia has sentido que has afrontado efectivamente los cambios importantes?', 
  '¿Con qué frecuencia has estado seguro sobre tu capacidad para manejar tus problemas?', 
  '¿Con qué frecuencia has sentido que las cosas van bien?', 
  '¿Con qué frecuencia has sentido que no podías afrontar todas las cosas que tenías que hacer?',
  '¿Con qué frecuencia has podido controlar las dificultades de tu vida?', 
  '¿Con qué frecuencia has sentido que tenías todo bajo control?', 
  '¿Con qué frecuencia has estado enfadado porque las cosas estaban fuera de tu control?',
  '¿Con qué frecuencia has pensado sobre las cosas que te faltan por hacer?',
  '¿Con qué frecuencia has podido controlar la forma de pasar el tiempo?', 
  '¿Con qué frecuencia has sentido que las dificultades se acumulan tanto que no puedes superarlas?',
]

const BDI_PREGUNTAS = [
  { enunciado: 'Estado de ánimo', opciones: ['No me siento triste.', 'Me siento triste gran parte del tiempo.', 'Me siento triste todo el tiempo.', 'No puedo soportarlo.'] },
  { enunciado: 'Perspectiva sobre el futuro', opciones: ['No estoy desalentado.', 'Me siento más desalentado que antes.', 'No espero que las cosas funcionen.', 'Siento que no hay esperanza.'] },
  { enunciado: 'Sentido de fracaso', opciones: ['No me siento un fracasado.', 'He fracasado más de lo debido.', 'Veo muchos fracasos.', 'Soy un fracaso total.'] },
  { enunciado: 'Sentido del placer', opciones: ['Disfruto como siempre.', 'No disfruto tanto como antes.', 'Obtengo muy poco placer.', 'No puedo obtener ningún placer.'] },
  { enunciado: 'Sentimientos de culpa', opciones: ['No me siento culpable.', 'Me siento culpable por varias cosas.', 'Me siento culpable casi siempre.', 'Me siento culpable todo el tiempo.'] },
  { enunciado: 'Sentimientos de castigo', opciones: ['No siento que esté siendo castigado.', 'Siento que tal vez pueda ser castigado.', 'Espero ser castigado.', 'Siento que estoy siendo castigado.'] },
  { enunciado: 'Autopercepción', opciones: ['Siento lo mismo sobre mí.', 'He perdido la confianza en mí mismo.', 'Estoy decepcionado conmigo mismo.', 'No me gusto a mí mismo.'] },
  { enunciado: 'Autocrítica', opciones: ['No me culpo más de lo habitual.', 'Estoy más crítico conmigo mismo.', 'Me critico por todos mis errores.', 'Me culpo por todo lo malo.'] },
  { enunciado: 'Pensamientos suicidas', opciones: ['No tengo pensamientos de hacerme daño.', 'He tenido pensamientos, pero no lo haría.', 'Querría matarme.', 'Me mataría si pudiera.'] },
  { enunciado: 'Llanto', opciones: ['No lloro más de lo habitual.', 'Lloro más que antes.', 'Lloro por cualquier pequeñez.', 'Siento ganas de llorar, pero no puedo.'] },
  { enunciado: 'Inquietud', opciones: ['No estoy más inquieto de lo habitual.', 'Me siento más inquieto.', 'Me es difícil quedarme quieto.', 'Tengo que estar siempre en movimiento.'] },
  { enunciado: 'Interés en los demás', opciones: ['No he perdido el interés.', 'Estoy menos interesado que antes.', 'He perdido casi todo el interés.', 'Me es difícil interesarme por algo.'] },
  { enunciado: 'Toma de decisiones', opciones: ['Tomo decisiones tan bien como siempre.', 'Me resulta más difícil.', 'Tengo mucha más dificultad.', 'Tengo problemas para cualquier decisión.'] },
  { enunciado: 'Autovaloración', opciones: ['No siento que no sea valioso.', 'No me siento tan útil como antes.', 'Me siento menos valioso que otros.', 'Siento que no valgo nada.'] },
  { enunciado: 'Nivel de energía', opciones: ['Tengo tanta energía como siempre.', 'Tengo menos energía.', 'No tengo suficiente energía.', 'No tengo energía para nada.'] },
  { enunciado: 'Hábitos de sueño', opciones: ['Sin cambios en el sueño.', 'Duermo un poco más o menos.', 'Duermo mucho más o menos.', 'Duermo casi todo el día o no duermo nada.'] },
  { enunciado: 'Irritabilidad', opciones: ['No estoy más irritable.', 'Estoy más irritable.', 'Mucho más irritable.', 'Irritable todo el tiempo.'] },
  { enunciado: 'Apetito', opciones: ['Sin cambios en el apetito.', 'Un poco más o menos.', 'Mucho más o menos.', 'Sin apetito o quiero comer todo el día.'] },
  { enunciado: 'Concentración', opciones: ['Me concentro bien.', 'No tan bien como siempre.', 'Me es difícil mantener la mente en algo.', 'No puedo concentrarme en nada.'] },
  { enunciado: 'Fatiga', opciones: ['No estoy más cansado.', 'Me canso más fácilmente.', 'Demasiado cansado para muchas cosas.', 'Demasiado cansado para la mayoría de cosas.'] },
  { enunciado: 'Interés sexual', opciones: ['Sin cambios recientes.', 'Menos interesado.', 'Mucho menos interesado.', 'Pérdida completa de interés.'] },
]

const TEMA_VISUAL = {
  ansiedad: {
    title: 'Inventario de Ansiedad',
    subtitle: 'Inventario de Ansiedad de Beck (BAI)',
    colorClass: 'text-[#D97706]',
    progressClass: 'bg-[#F59E0B]',
    badgeClass: 'bg-[#FEF3C7] text-[#D97706]',
    btnClass: 'bg-[#F59E0B] hover:bg-[#D97706] text-white',
    selectedClass: 'border-[#F59E0B] bg-[#FEF3C7]/50 text-[#D97706] border-2 shadow-inner',
    dotActive: 'bg-[#F59E0B]'
  },
  estres: {
    title: 'Escala de Estrés Percibido',
    subtitle: 'Escala de Estrés Percibido (PSS-14)',
    colorClass: 'text-[#DC2626]',
    progressClass: 'bg-[#EF4444]',
    badgeClass: 'bg-[#FEE2E2] text-[#DC2626]',
    btnClass: 'bg-[#EF4444] hover:bg-[#DC2626] text-white',
    selectedClass: 'border-[#EF4444] bg-[#FEE2E2]/50 text-[#DC2626] border-2 shadow-inner',
    dotActive: 'bg-[#EF4444]'
  },
  depresion: {
    title: 'Inventario de Depresión',
    subtitle: 'Inventario de Depresión de Beck (BDI-II)',
    colorClass: 'text-[#4F46E5]',
    progressClass: 'bg-[#6366F1]',
    badgeClass: 'bg-[#E0E7FF] text-[#4F46E5]',
    btnClass: 'bg-[#6366F1] hover:bg-[#4F46E5] text-white',
    selectedClass: 'border-[#6366F1] bg-[#E0E7FF]/50 text-[#4F46E5] border-2 shadow-inner',
    dotActive: 'bg-[#6366F1]'
  }
}

export default function CuestionarioModal({ tipo, onClose, onSubmit }) {
  const cfgTema = TEMA_VISUAL[tipo] || TEMA_VISUAL.ansiedad
  
  const dataCfg = {
    ansiedad: { id_db: 2, max: 63, preguntas: BAI_PREGUNTAS.map((t, i) => ({ id: i, texto: t })), opciones: BAI_OPCIONES, tipo: 'escala' },
    estres: { id_db: 1, max: 42, preguntas: PSS_PREGUNTAS.map((t, i) => ({ id: i, texto: t })), opciones: PSS_OPCIONES, tipo: 'escala' },
    depresion: { id_db: 3, max: 63, preguntas: BDI_PREGUNTAS.map((item, i) => ({ id: i, texto: item.enunciado, opciones: item.opciones })), tipo: 'texto' },
  }[tipo]

  const total = dataCfg.preguntas.length
  const [step, setStep] = useState(0)
  const [respuestas, setRespuestas] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const preguntaActual = dataCfg.preguntas[step]
  
  // --- PROTECCIÓN CRUCIAL PARA DEPRESIÓN ---
  const opcionesRender = dataCfg.tipo === 'texto' 
    ? (preguntaActual?.opciones || []) 
    : (dataCfg.opciones || [])

  const seleccionada = respuestas[step] ?? null
  const progreso = Math.round(((step + (seleccionada !== null ? 1 : 0)) / total) * 100)

  const elegir = (value) => {
    setRespuestas(prev => ({ ...prev, [step]: value }))
    if (step < total - 1) {
      setTimeout(() => setStep(s => s + 1), 280)
    }
  }

  const enviar = async () => {
    if (Object.keys(respuestas).length < total) return
    setEnviando(true)
    try {
      let puntajeFinal = 0;
      if (tipo === 'estres') {
        const inversas = [3, 4, 5, 6, 8, 9, 12];
        Object.entries(respuestas).forEach(([idx, valor]) => {
          puntajeFinal += inversas.includes(parseInt(idx)) ? (4 - valor) : valor;
        });
      } else {
        puntajeFinal = Object.values(respuestas).reduce((acc, curr) => acc + curr, 0);
      }
      const res = await onSubmit(dataCfg.id_db, puntajeFinal);
      setResultado({
        puntaje: puntajeFinal,
        nivel: res.data.nivel,
        sugerencia: res.data.sugerencia,
        max: dataCfg.max
      });
    } catch (err) {
      console.error("Error al guardar:", err)
    } finally {
      setEnviando(false)
    }
  }

  if (resultado) {
    const radio = 58;
    const circulo = 2 * Math.PI * radio;
    const offset = circulo - (circulo * (resultado.puntaje / resultado.max));
    return (
      <ModalShell onClose={onClose}>
        <div className="flex flex-col items-center py-10 px-8 text-center overflow-y-auto">
          <div className={`mb-4 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-50 ${cfgTema.colorClass}`}>
            Nivel {resultado.nivel}
          </div>
          <div className="relative mb-8 flex items-center justify-center">
             <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r={radio} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                <circle cx="64" cy="64" r={radio} stroke="currentColor" strokeWidth="8" fill="transparent" 
                        strokeDasharray={circulo} 
                        strokeDashoffset={offset} 
                        className={`${cfgTema.progressClass.replace('bg-', 'text-')} transition-all duration-1000 ease-out`} />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-gray-800">{resultado.puntaje}</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase">Puntos</span>
             </div>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-4 tracking-tight">¡Test Finalizado!</h2>
          <div className="bg-gray-50 rounded-[28px] p-6 mb-8 w-full border border-gray-100 relative">
            <span className={`absolute -top-3 left-6 px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white ${cfgTema.progressClass}`}>Sugerencia</span>
            <p className="text-sm text-gray-600 leading-relaxed text-left italic pt-2">"{resultado.sugerencia}"</p>
          </div>
          <button onClick={onClose} className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-md ${cfgTema.btnClass}`}>Regresar al Inicio</button>
        </div>
      </ModalShell>
    )
  }

  return (
    <ModalShell onClose={onClose}>
      <div className="pt-8 px-8 pb-4 bg-white">
        <div className="flex justify-between items-center mb-6">
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-lg ${cfgTema.badgeClass}`}>Pregunta {step + 1} de {total}</span>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <h2 className="text-xl font-bold text-gray-800 tracking-tight leading-tight mb-1">{cfgTema.title}</h2>
        <p className="text-[11px] text-gray-400 font-medium mb-6 uppercase tracking-wider">{cfgTema.subtitle}</p>
        <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
          <div className={`h-full transition-all duration-500 ${cfgTema.progressClass}`} style={{ width: `${progreso}%` }} />
        </div>
      </div>
      <div className="px-8 py-6 flex-1 overflow-y-auto">
        <div className="mb-8">
          {dataCfg.tipo === 'texto' && (
            <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${cfgTema.colorClass}`}>{preguntaActual?.texto}</p>
          )}
          <p className="text-base font-semibold text-gray-700 leading-snug">
            {dataCfg.tipo === 'escala' ? preguntaActual?.texto : "¿Cuál de estas opciones te describe mejor?"}
          </p>
        </div>
        <div className="space-y-3">
          {opcionesRender.map((opcion, i) => {
            const valor = dataCfg.tipo === 'texto' ? i : opcion.value
            const label = dataCfg.tipo === 'texto' ? opcion : opcion.label
            const activa = seleccionada === valor
            return (
              <button
                key={i}
                onClick={() => elegir(valor)}
                className={`w-full text-left px-5 py-4 rounded-[20px] border text-sm transition-all duration-200 ${activa ? cfgTema.selectedClass : 'border-gray-100 text-gray-500 hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${activa ? 'border-transparent' : 'border-gray-200'}`} style={activa ? {backgroundColor: cfgTema.dotActive} : {}}>
                    {activa && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className={activa ? "font-bold" : "font-medium"}>{label}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
      <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
        <button onClick={() => setStep(s => s - 1)} disabled={step === 0} className="text-[10px] font-black uppercase tracking-widest text-gray-400 disabled:opacity-0">← Anterior</button>
        {step === total - 1 ? (
          <button onClick={enviar} disabled={seleccionada === null || enviando} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${seleccionada !== null && !enviando ? cfgTema.btnClass : 'bg-gray-200 text-gray-400'}`}>
            {enviando ? 'Guardando...' : 'Finalizar Test'}
          </button>
        ) : (
          <button onClick={() => setStep(s => s + 1)} disabled={seleccionada === null} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${seleccionada !== null ? cfgTema.btnClass : 'bg-gray-200 text-gray-400'}`}>Siguiente →</button>
        )}
      </div>
    </ModalShell>
  )
}

function ModalShell({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1C2D6E]/20 backdrop-blur-md" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-in">{children}</div>
    </div>
  )
}