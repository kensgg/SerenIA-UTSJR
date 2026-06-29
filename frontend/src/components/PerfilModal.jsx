import { X, User, Mail, GraduationCap, Activity, Sparkles } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

// ─── Constantes ───────────────────────────────────────────────
const MAXIMOS = { ansiedad: 63, depresion: 63, estres: 42 }

// Convierte puntaje bruto → nivel 0-3
const puntajeANivel = (puntaje, tipo) => {
  const max = MAXIMOS[tipo] || 63
  const ratio = puntaje / max  // 0 a 1
  if (ratio >= 0.75) return 3  // Crítico
  if (ratio >= 0.50) return 2  // Alto
  if (ratio >= 0.25) return 1  // Moderado
  return 0                      // Bajo
}

const NIVEL_LABEL = { 0: 'Bajo', 1: 'Moderado', 2: 'Alto', 3: 'Crítico' }

const NIVEL_STYLES = {
  3: { bg: 'bg-red-50',     text: 'text-red-600',    border: 'border-red-200'    },
  2: { bg: 'bg-orange-50',  text: 'text-orange-600', border: 'border-orange-200' },
  1: { bg: 'bg-amber-50',   text: 'text-amber-600',  border: 'border-amber-200'  },
  0: { bg: 'bg-[#E8EDDF]',  text: 'text-[#5a7a57]',  border: 'border-[#c8d8c5]'  },
}

const ESTILOS_PSICO = {
  'Ansiedad':  { border: 'border-amber-200', bg: 'bg-amber-50',  text: 'text-amber-700'  },
  'Estrés':    { border: 'border-rose-200',  bg: 'bg-rose-50',   text: 'text-rose-700'   },
  'Depresión': { border: 'border-indigo-200',bg: 'bg-indigo-50', text: 'text-indigo-700' },
  'General':   { border: 'border-gray-200',  bg: 'bg-gray-50',   text: 'text-gray-700'   }
}

const CUESTIONARIOS = [
  { key: 'ansiedad',  label: 'Ansiedad',  color: '#D97706', colorBg: 'rgba(217,119,6,0.1)',   busqueda: 'ansiedad' },
  { key: 'estres',    label: 'Estrés',    color: '#DC2626', colorBg: 'rgba(220,38,38,0.1)',   busqueda: 'estr'     },
  { key: 'depresion', label: 'Depresión', color: '#4F46E5', colorBg: 'rgba(79,70,229,0.1)',   busqueda: 'depres'   },
]

// ─── Componente principal ─────────────────────────────────────
export default function AlumnoDetalleModal({ alumno, onClose }) {
  if (!alumno) return null

  const historial = alumno.historial_respuestas || []

  // Último puntaje por cuestionario
  const ultimoPuntaje = (busqueda) => {
    const registros = historial
      .filter(r => r.cuestionarios?.nombre.toLowerCase().includes(busqueda))
      .sort((a, b) => new Date(b.fecha_respuesta) - new Date(a.fecha_respuesta))
    return registros[0]?.puntaje ?? null
  }

  const nivelesActuales = CUESTIONARIOS.map(c => {
    const puntaje = ultimoPuntaje(c.busqueda)
    const nivel = puntaje !== null ? puntajeANivel(puntaje, c.key) : null
    return { ...c, puntaje, nivel }
  })

  // ─── Datos para la gráfica (escala 0-3) ───────────────────
  const fechas = [...new Set(
    historial.map(r => new Date(r.fecha_respuesta).toLocaleDateString())
  )].sort((a, b) => new Date(a) - new Date(b))

  const obtenerPuntosNivel = (busqueda, tipoKey) => {
    return fechas.map(fecha => {
      const registro = historial.find(r =>
        new Date(r.fecha_respuesta).toLocaleDateString() === fecha &&
        r.cuestionarios?.nombre.toLowerCase().includes(busqueda)
      )
      return registro != null ? puntajeANivel(registro.puntaje, tipoKey) : null
    })
  }

  const data = {
    labels: fechas,
    datasets: CUESTIONARIOS.map(c => ({
      label: c.label,
      data: obtenerPuntosNivel(c.busqueda, c.key),
      borderColor: c.color,
      backgroundColor: c.colorBg,
      tension: 0.4,
      fill: true,
      pointRadius: 5,
      pointHoverRadius: 7,
    }))
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { size: 10, weight: '700' }, usePointStyle: true }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          // Muestra "Alto (2)" en el tooltip
          label: ctx => ` ${ctx.dataset.label}: ${NIVEL_LABEL[ctx.parsed.y] ?? ctx.parsed.y} (${ctx.parsed.y})`
        }
      }
    },
    scales: {
      y: {
        min: 0,
        max: 3,
        ticks: {
          stepSize: 1,
          font: { size: 10, weight: '700' },
          // Reemplaza 0,1,2,3 con las etiquetas de nivel
          callback: val => NIVEL_LABEL[val] ?? val,
        },
        grid: { color: '#F1F5F9' }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 } }
      }
    }
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#1C2D6E]/30 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[45px] shadow-2xl w-full max-w-5xl overflow-hidden border border-white flex flex-col md:flex-row h-[90vh]">

        {/* ── Sidebar ── */}
        <div className="w-full md:w-80 bg-[#F9F9F7] p-8 flex flex-col border-r border-gray-100 shrink-0">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 bg-white rounded-[30px] shadow-sm flex items-center justify-center text-[#8BA888] mb-4 border border-gray-100">
              <User size={40} />
            </div>
            <h2 className="text-xl font-black text-gray-800 leading-tight">
              {alumno.nombre} <br /> {alumno.ape_p} {alumno.ape_m}
            </h2>
          </div>

          <div className="space-y-4 mb-8">
            <InfoItem icon={<Mail size={14} />}         label="Correo"  value={alumno.correo}        />
            <InfoItem icon={<GraduationCap size={14} />} label="Carrera" value={alumno.carrera_nombre} />
            <InfoItem icon={<Activity size={14} />}      label="Género"  value={alumno.genero}         />
          </div>

          {/* ── Cards de nivel actual ── */}
          <div className="mt-auto">
            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-3">
              Nivel Actual
            </p>
            <div className="space-y-2">
              {nivelesActuales.map(c => {
                const s = c.nivel !== null ? NIVEL_STYLES[c.nivel] : NIVEL_STYLES[0]
                const labelNivel = c.nivel !== null ? NIVEL_LABEL[c.nivel] : 'Sin datos'
                return (
                  <div
                    key={c.key}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl border ${s.bg} ${s.border}`}
                  >
                    <span className="text-[12px] font-black text-gray-600 uppercase tracking-wide">
                      {c.label}
                    </span>
                    <span className={`text-[12px] font-black uppercase tracking-wide ${s.text}`}>
                      {labelNivel}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Contenido principal ── */}
        <div className="flex-1 p-8 md:p-12 relative overflow-y-auto bg-white">
          <button onClick={onClose} className="absolute top-6 right-6 text-gray-300 hover:text-rose-500 transition-colors z-10">
            <X size={24} />
          </button>

          {/* Gráfica */}
          <div className="mb-12">
            <h3 className="text-[12px] font-black text-gray-300 uppercase tracking-[0.3em] mb-1 flex items-center gap-2">
              <Activity size={14} /> Historial de Evaluación
            </h3>
            <p className="text-[11px] text-gray-600 mb-6 ml-0.5">
              Escala 0–3 · Bajo / Moderado / Alto / Crítico
            </p>
            <div className="h-[260px] w-full">
              <Line data={data} options={options} />
            </div>
          </div>

          {/* Sugerencias */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 ml-1">
              <Sparkles size={14} className="text-[#8BA888]" />
              <h3 className="text-[11px] font-black text-gray-300 uppercase tracking-widest">
                Recomendaciones SerenIA
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alumno.sugerencias_detalle?.length > 0 ? (
                alumno.sugerencias_detalle.map((s, i) => {
                  const tipoLower = s.tipo.toLowerCase()
                  let estiloKey = 'General'
                  if (tipoLower.includes('ansiedad')) estiloKey = 'Ansiedad'
                  else if (tipoLower.includes('estr'))  estiloKey = 'Estrés'
                  else if (tipoLower.includes('depres')) estiloKey = 'Depresión'
                  const estilo = ESTILOS_PSICO[estiloKey]
                  return (
                    <div key={i} className={`${estilo.bg} ${estilo.border} border p-6 rounded-[30px] hover:shadow-md transition-all`}>
                      <div className="flex justify-between items-center mb-3">
                        <p className={`text-[11px] font-black uppercase tracking-widest ${estilo.text}`}>
                          {s.tipo}
                        </p>
                        <Sparkles size={12} className={estilo.text} />
                      </div>
                      <p className="text-xs font-bold text-gray-700 leading-relaxed italic">
                        "{s.texto}"
                      </p>
                    </div>
                  )
                })
              ) : (
                <div className="col-span-full p-10 text-center border-2 border-dashed border-gray-100 rounded-[40px]">
                  <p className="text-sm italic text-gray-600">
                    No hay sugerencias procesadas para este estudiante.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 text-[#8BA888] opacity-40">{icon}</div>
      <div className="min-w-0">
        <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{label}</p>
        <p className="text-xs font-bold text-gray-600 truncate">{value || '---'}</p>
      </div>
    </div>
  )
}