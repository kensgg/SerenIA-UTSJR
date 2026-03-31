import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js'
import { ChevronLeft, Mail, GraduationCap, AlertCircle, Sparkles, Activity } from 'lucide-react'
import Navbar from '../../components/Navbar'
import { getDetalleAlumno, getHistorialAlumno } from '../../api/tutores.api'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

const NIVEL = (v) => v > 40 ? 'Alto' : v > 20 ? 'Moderado' : 'Bajo'
const NIVEL_COLORS = { 
  Alto: { bg: 'bg-[#FEE2E2]', text: 'text-rose-400', dot: 'bg-rose-400' },
  Moderado: { bg: 'bg-[#FEF3C7]', text: 'text-amber-400', dot: 'bg-amber-400' },
  Bajo: { bg: 'bg-[#E8EDDF]', text: 'text-[#8BA888]', dot: 'bg-[#8BA888]' }
}

export default function DetalleAlumno() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [detalle, setDetalle] = useState(null)
  const [historial, setHistorial] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getDetalleAlumno(id), getHistorialAlumno(id)])
      .then(([d, h]) => { setDetalle(d.data); setHistorial(h.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-[#F9F9F7] text-gray-400 font-black text-[10px] tracking-[0.3em]">CARGANDO PERFIL...</div>

  if (!detalle) return <div className="h-screen w-full flex items-center justify-center bg-[#F9F9F7] text-gray-400 font-black text-[10px] tracking-[0.3em]">ALUMNO NO ENCONTRADO</div>

  const { alumno, estadisticas, riesgo } = detalle
  const initials = `${alumno.nombre?.[0] ?? ''}${alumno.ape_p?.[0] ?? ''}`.toUpperCase()

  // Configuración de Gráfica
  const buildLine = (arr = [], color) => ({
    data: arr.map(r => r.puntaje),
    labels: arr.map(r => new Date(r.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })),
    borderColor: color,
    backgroundColor: 'transparent',
    tension: 0.4, pointRadius: 5, pointBackgroundColor: '#fff', borderWidth: 3
  })

  const ans = buildLine(historial?.ansiedad, '#F59E0B') // Ámbar
  const est = buildLine(historial?.estres, '#EF4444')   // Rojo
  const dep = buildLine(historial?.depresion, '#6366F1') // Indigo
  const allLabels = [...new Set([...ans.labels, ...est.labels, ...dep.labels])]

  const chartData = {
    labels: allLabels.length ? allLabels : ['Sin datos'],
    datasets: [
      { label: 'Ansiedad', data: ans.data, ...ans },
      { label: 'Estrés', data: est.data, ...est },
      { label: 'Depresión', data: dep.data, ...dep },
    ],
  }

  return (
    <div className="min-h-screen w-full bg-[#F9F9F7] flex flex-col font-sans antialiased">
      <Navbar />
      
      <main className="flex-1 w-full max-w-[1400px] mx-auto p-3 md:p-6">
        
        {/* Botón Volver Suave */}
        <button 
          onClick={() => navigate('/tutor/dashboard')}
          className="group flex items-center gap-2 mb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
        >
          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform"/> 
          Volver al Panel
        </button>

        <div className="w-full bg-[#FAFBFF] rounded-[45px] shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-white/80 p-6 md:p-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Columna Izquierda: Perfil Card */}
            <div className="lg:col-span-4 space-y-6">
              <section className="bg-white rounded-[35px] p-8 border border-gray-50 shadow-sm">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-[25px] bg-[#E8EDDF] flex items-center justify-center text-2xl font-black text-[#8BA888] mb-4 shadow-inner">
                    {initials}
                  </div>
                  <h1 className="text-2xl font-black text-gray-800 tracking-tighter leading-tight">
                    {alumno.nombre} <br/> {alumno.ape_p} {alumno.ape_m}
                  </h1>
                  <span className="mt-2 px-4 py-1 bg-[#F9F9F7] rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {alumno.grupos?.nombre || 'Sin Grupo'}
                  </span>
                </div>

                <div className="mt-10 space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-[#F9F9F7]/50 rounded-2xl border border-white">
                    <Mail size={16} className="text-[#8BA888]"/>
                    <div className="min-w-0">
                      <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Correo Electrónico</p>
                      <p className="text-xs font-bold text-gray-600 truncate">{alumno.correo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-[#F9F9F7]/50 rounded-2xl border border-white">
                    <GraduationCap size={16} className="text-[#8BA888]"/>
                    <div>
                      <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Académico</p>
                      <p className="text-xs font-bold text-gray-600">{alumno.cuatrimestre}° Cuatrimestre</p>
                    </div>
                  </div>
                </div>

                {riesgo === 'Alto' && (
                  <div className="mt-8 bg-rose-50 rounded-[25px] p-5 border border-rose-100 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-rose-400 shadow-sm shrink-0">
                      <AlertCircle size={20}/>
                    </div>
                    <div>
                      <p className="text-xs font-black text-rose-400 uppercase tracking-tighter">Atención Prioritaria</p>
                      <p className="text-[11px] font-medium text-rose-300 leading-tight">Este alumno presenta niveles de riesgo elevados en su evaluación reciente.</p>
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* Columna Derecha: Estadísticas y Gráfica */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Cards de Puntajes Actuales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Ansiedad', value: estadisticas?.ansiedad, theme: 'bg-[#FEF3C7]' },
                  { label: 'Estrés', value: estadisticas?.estres, theme: 'bg-[#FEE2E2]' },
                  { label: 'Depresión', value: estadisticas?.depresion, theme: 'bg-[#E0E7FF]' }
                ].map((s, i) => {
                  const nivel = NIVEL(s.value || 0)
                  const color = NIVEL_COLORS[nivel]
                  return (
                    <div key={i} className={`${s.theme} rounded-[30px] p-6 border border-white shadow-sm`}>
                      <p className="text-[9px] font-black text-gray-500/50 uppercase tracking-widest mb-1">{s.label}</p>
                      <p className="text-3xl font-black text-gray-800 tracking-tighter">
                        {Math.round(s.value || 0)}
                        <span className="text-sm font-bold text-gray-400/50 ml-1">/100</span>
                      </p>
                      <span className={`inline-block mt-3 px-3 py-0.5 rounded-full text-[8px] font-black uppercase ${color.bg} ${color.text}`}>
                        {nivel}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Gráfica de Evolución */}
              <section className="bg-white rounded-[35px] p-8 border border-gray-50 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-2">
                    <Activity size={14}/> Evolución Histórica
                  </h3>
                  <div className="flex gap-4">
                    {[['Ansiedad', '#F59E0B'], ['Estrés', '#EF4444'], ['Depresión', '#6366F1']].map(([l, c]) => (
                      <div key={l} className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c }}></div>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="h-[280px]">
                  <Line data={chartData} options={{
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: { grid: { color: '#F8FAFC' }, ticks: { font: { size: 9, weight: '700' }, color: '#CBD5E1' }, border: { display: false }, max: 100 },
                      x: { grid: { display: false }, ticks: { font: { size: 9, weight: '700' }, color: '#CBD5E1' } }
                    }
                  }} />
                </div>
              </section>

              {/* Recomendaciones IA */}
              <section className="bg-white rounded-[35px] p-8 border border-gray-50 shadow-sm">
                <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-2 mb-6">
                  <Sparkles size={14} className="text-[#D97706]"/> Sugerencias del Sistema
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {!detalle.sugerencias?.length ? (
                    <p className="text-xs font-bold text-gray-300 italic uppercase tracking-widest py-4">No hay datos suficientes para generar sugerencias.</p>
                  ) : (
                    detalle.sugerencias.map((s, i) => {
                      const nombre = s.cuestionarios?.nombre?.toLowerCase() || '';
                      const config = nombre.includes('ansiedad') ? { bg: 'bg-[#FEF3C7]', text: 'text-[#D97706]' } 
                                   : nombre.includes('estr') ? { bg: 'bg-[#FEE2E2]', text: 'text-rose-400' } 
                                   : { bg: 'bg-[#E0E7FF]', text: 'text-indigo-400' };
                      return (
                        <div key={i} className={`${config.bg}/40 p-5 rounded-[25px] border border-white/50 shadow-sm`}>
                          <span className={`text-[8px] font-black uppercase tracking-widest ${config.text} block mb-2`}>• Evaluación Reciente</span>
                          <p className="text-[11px] text-gray-700 leading-snug font-medium italic">"{s.sugerencia}"</p>
                        </div>
                      )
                    })
                  )}
                </div>
              </section>

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}