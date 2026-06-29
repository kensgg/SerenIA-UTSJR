import { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Filler, Legend
} from 'chart.js'
import { Activity, Sparkles, ArrowUpRight, User } from 'lucide-react'
import Navbar from '../../components/Navbar.jsx'
import CuestionarioModal from '../../components/CuestionarioModal.jsx'
import EditarPerfilModal from '../../components/EditarPerfilModal.jsx'
import { 
  getMiPerfil, 
  getEstadisticas, 
  getUltimasSugerencias, 
  getHistorial, 
  submitCuestionario, 
  updateMiPerfil 
} from '../../api/alumnos.api'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler, Legend)

const CONFIG_TEMAS = {
  ansiedad: { label: 'Ansiedad', color: 'text-[#D97706]', bg: 'bg-[#FEF3C7]', dot: '#F59E0B', max: 63 },
  estres: { label: 'Estrés', color: 'text-[#DC2626]', bg: 'bg-[#FEE2E2]', dot: '#EF4444', max: 42 },
  depresion: { label: 'Depresión', color: 'text-[#4F46E5]', bg: 'bg-[#E0E7FF]', dot: '#6366F1', max: 63 }
}

export default function Dashboard() {
  const [perfil, setPerfil] = useState(null)
  const [estadisticas, setEstadisticas] = useState(null)
  const [sugerencias, setSugerencias] = useState([])
  const [historial, setHistorial] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalTipo, setModalTipo] = useState(null)
  const [modalPerfilOpen, setModalPerfilOpen] = useState(false)

  const cargarDatosIniciales = () => {
    setLoading(true)
    Promise.all([getMiPerfil(), getEstadisticas(), getUltimasSugerencias(), getHistorial()])
      .then(([p, e, s, h]) => {
        setPerfil(p.data); 
        setEstadisticas(e.data); 
        setSugerencias(s.data); 
        setHistorial(h.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  const refrescarDatosSilenciosamente = () => {
    Promise.all([getMiPerfil(), getEstadisticas(), getUltimasSugerencias(), getHistorial()])
      .then(([p, e, s, h]) => {
        setPerfil(p.data); 
        setEstadisticas(e.data); 
        setSugerencias(s.data); 
        setHistorial(h.data);
      })
      .catch(console.error);
  }

  useEffect(() => { cargarDatosIniciales() }, [])

  const handleSubmit = async (id_db, puntaje, detalle) => {
    try {
      const response = await submitCuestionario(id_db, puntaje, detalle);
      refrescarDatosSilenciosamente(); 
      return response; 
    } catch (error) {
      console.error("Error en submit:", error);
      throw error;
    }
  }

  const handleUpdatePerfil = async (datosNuevos) => {
    try {
      await updateMiPerfil(datosNuevos);
      refrescarDatosSilenciosamente();
      setModalPerfilOpen(false);
    } catch (error) {
      console.error("Error actualizando perfil:", error);
    }
  }

    const obtenerUltimoPuntaje = (idCuestionario) => {
      const mapa = { estres: 'estr', ansiedad: 'ansiedad', depresion: 'depresi' };
      const termino = mapa[idCuestionario];

      const registro = [...historial]
        .sort((a, b) => new Date(b.fecha_respuesta) - new Date(a.fecha_respuesta))
        .find(r => (r.cuestionarios?.nombre?.toLowerCase() || '').includes(termino));

      return registro ? registro.puntaje : 0;
    };

  const buildDataset = (keyword) => {
    return historial
      .filter(r => (r.cuestionarios?.nombre?.toLowerCase() || '').includes(keyword.toLowerCase()))
      .slice(0, 8).reverse().map(r => r.puntaje);
  }

  const allLabels = [...new Set(historial.map(r => 
    new Date(r.fecha_respuesta).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
  ))].reverse();

  const chartData = {
    labels: allLabels.length > 0 ? allLabels : ['Sin datos'],
    datasets: [
      { label: 'Estrés', data: buildDataset('estr'), borderColor: CONFIG_TEMAS.estres.dot, backgroundColor: 'transparent', tension: 0.4, borderWidth: 3, pointRadius: 5, pointBackgroundColor: '#fff' },
      { label: 'Ansiedad', data: buildDataset('ansiedad'), borderColor: CONFIG_TEMAS.ansiedad.dot, backgroundColor: 'transparent', tension: 0.4, borderWidth: 3, pointRadius: 5, pointBackgroundColor: '#fff' },
      { label: 'Depresión', data: buildDataset('depresi'), borderColor: CONFIG_TEMAS.depresion.dot, backgroundColor: 'transparent', tension: 0.4, borderWidth: 3, pointRadius: 5, pointBackgroundColor: '#fff' },
    ]
  }

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-[#F9F9F7] text-gray-400 font-black text-[10px] tracking-[0.3em]">CARGANDO SERENIA...</div>

  return (
    <div className="min-h-screen w-full bg-[#F9F9F7] flex flex-col font-sans antialiased">
      <Navbar />
      
      <div className="flex-1 w-full max-w-[1650px] mx-auto p-3 md:p-6">
        <div className="w-full bg-[#FAFBFF] rounded-[45px] shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-white/80 p-6 md:p-10 overflow-hidden">
          
          <section className="mb-10 bg-white/60 p-8 rounded-[35px] border border-white/40 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 rounded-full bg-[#A3B899] animate-pulse"></div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Panel de Control</p>
              </div>
              <div className="flex flex-col md:flex-row md:items-baseline gap-2">
                <h1 className="text-3xl font-black text-gray-800 tracking-tighter">Hola,</h1>
                <span className="text-4xl font-black text-[#8BA888] tracking-tighter drop-shadow-sm">
                  {perfil?.nombre}.
                </span>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  Grupo: <span className="text-gray-600">{perfil?.grupos?.nombre || 'Pendiente'}</span>
                </p>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  Carrera: <span className="text-gray-600">{perfil?.carreras?.nombre || 'No asignada'}</span>
                </p>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  Cuatrimestre: <span className="text-gray-600">{perfil?.cuatrimestre ? `${perfil.cuatrimestre}°` : 'S/N'}</span>
                </p>
              </div>
            </div>

            <button 
              onClick={() => setModalPerfilOpen(true)}
              className="flex items-center gap-2 bg-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all border border-gray-100 active:scale-95"
            >
              <User size={14} className="text-[#8BA888]" /> Editar Perfil
            </button>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { id: 'estres', label: 'Estrés', theme: CONFIG_TEMAS.estres },
              { id: 'ansiedad', label: 'Ansiedad', theme: CONFIG_TEMAS.ansiedad },
              { id: 'depresion', label: 'Depresión', theme: CONFIG_TEMAS.depresion }
            ].map((s) => {
              const valorActual = obtenerUltimoPuntaje(s.id);
              return (
                <div key={s.id} className={`${s.theme.bg} rounded-[35px] p-8 shadow-sm transition-all hover:translate-y-[-4px] border border-white/40`}>
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <p className="text-[10px] font-bold text-gray-600/40 uppercase tracking-widest mb-1">{s.label}</p>
                      <div className="bg-white/50 backdrop-blur-sm px-3 py-0.5 rounded-full text-[8px] font-black uppercase text-gray-700">Resultado Reciente</div>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-white/50 flex items-center justify-center text-gray-600"><Activity size={18} /></div>
                  </div>
                  
                  <div className="flex items-end justify-between">
                    <p className="text-5xl font-black text-gray-800 tracking-tighter">
                      {Math.round(valorActual)}
                      <span className="text-xl font-bold text-gray-400/40 ml-1">/{s.theme.max}</span>
                    </p>
                    <button onClick={() => setModalTipo(s.id)} className="bg-white/70 hover:bg-white p-3 rounded-2xl shadow-sm transition-all group">
                      <ArrowUpRight size={18} className="text-gray-700 group-hover:rotate-45 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-white border border-gray-50 rounded-[35px] p-8 shadow-sm">
              <h3 className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-8">Evolución Emocional (Últimos Test)</h3>
              <div className="h-[320px]">
                <Line data={chartData} options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { grid: { color: '#F8FAFC' }, ticks: { font: { size: 9, weight: '600' }, color: '#CBD5E1' }, border: { display: false }, max: 65 },
                    x: { grid: { display: false }, ticks: { font: { size: 9, weight: '600' }, color: '#CBD5E1' } }
                  }
                }} />
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-1 ml-2">
                <p className="p-1 bg-amber-100 rounded-md"><Sparkles size={12} className="text-[#D97706]" /></p>
                <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Sugerencias SerenIA</h3>
              </div>
              
              <div className="overflow-y-auto max-h-[400px] pr-2 space-y-4 scrollbar-hide">
                {sugerencias.length > 0 ? sugerencias.map((s, i) => {
                  const nombreC = s.cuestionarios?.nombre?.toLowerCase() || '';
                  let config = nombreC.includes('ansiedad') ? CONFIG_TEMAS.ansiedad : nombreC.includes('estr') ? CONFIG_TEMAS.estres : CONFIG_TEMAS.depresion;

                  return (
                    <div key={i} className={`${config.bg} p-6 rounded-[30px] shadow-sm border border-white/50 animate-in fade-in slide-in-from-right-4 duration-500`}>
                      <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${config.color} block mb-1.5`}>
                        • {config.label}
                      </span>
                      <p className="text-[12px] text-gray-700 leading-snug font-medium italic">
                        "{s.sugerencia}"
                      </p>
                    </div>
                  );
                }) : (
                  <div className="p-8 border-2 border-dashed border-gray-100 rounded-[35px] text-center">
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Realiza un test para recibir sugerencias.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {modalTipo && (
        <CuestionarioModal 
          tipo={modalTipo} 
          onClose={() => setModalTipo(null)} 
          onSubmit={handleSubmit} 
        />
      )}

      {modalPerfilOpen && (
        <EditarPerfilModal 
          perfil={perfil} 
          onClose={() => setModalPerfilOpen(false)} 
          onUpdate={handleUpdatePerfil} 
        />
      )}
    </div>
  )
}