import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import { 
  Activity, Users, AlertCircle, Plus, Search, 
  ChevronRight, Edit3, Trash2, X, Mail, GraduationCap, User 
} from 'lucide-react'
import { getMisGrupos, getMisAlumnos, crearGrupo, editarGrupo, eliminarGrupo } from '../../api/tutores.api'
import { getCarreras } from '../../api/auth.api'
import PerfilModal from '../../components/PerfilModal'

const NIVEL = (v) => v > 40 ? 'Alto' : v > 20 ? 'Moderado' : 'Bajo'
const NIVEL_COLORS = { 
  Alto: { bg: 'bg-[#FEE2E2]', text: 'text-rose-400', dot: 'bg-rose-400' },
  Moderado: { bg: 'bg-[#FEF3C7]', text: 'text-amber-400', dot: 'bg-amber-400' },
  Bajo: { bg: 'bg-[#E8EDDF]', text: 'text-[#8BA888]', dot: 'bg-[#8BA888]' }
}

export default function TutorDashboard() {
  const [grupos, setGrupos] = useState([])
  const [alumnos, setAlumnos] = useState([])
  const [carreras, setCarreras] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [grupoFiltro, setGrupoFiltro] = useState('todos')
  const [riesgoFiltro, setRiesgoFiltro] = useState('todos')
  
  const [modal, setModal] = useState({ open: false, mode: 'crear', grupo: null })
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null)
  const [formGrupo, setFormGrupo] = useState({ nombre: '', carrera_id: '', cuatrimestre: '' })
  const [saving, setSaving] = useState(false)

  const cargarDatos = () => {
    setLoading(true)
    Promise.all([getMisGrupos(), getMisAlumnos()])
      .then(([g, a]) => { 
        setGrupos(g.data?.data || g.data || []); 
        setAlumnos(a.data?.data || a.data || []); 
      })
      .catch(err => {
        console.error("Error al cargar datos:", err);
        setAlumnos([]); setGrupos([]);
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    cargarDatos()
    getCarreras().then(({ data }) => setCarreras(Array.isArray(data) ? data : [])).catch(console.error)
  }, [])

  const alumnosProcesados = Array.isArray(alumnos) ? alumnos.map(a => {
    const stats = a.estadisticas || {};
    const ans = Number(stats.ansiedad) || 0;
    const est = Number(stats.estres) || 0;
    const dep = Number(stats.depresion) || 0;
    const promedio = (ans + est + dep) / 3;
    return { ...a, ans, est, dep, riesgo: NIVEL(promedio) };
  }) : [];

  const totalAlumnos = alumnosProcesados.length;
  const promAns = totalAlumnos ? Math.round(alumnosProcesados.reduce((s, a) => s + a.ans, 0) / totalAlumnos) : 0;
  const promEst = totalAlumnos ? Math.round(alumnosProcesados.reduce((s, a) => s + a.est, 0) / totalAlumnos) : 0;
  const promDep = totalAlumnos ? Math.round(alumnosProcesados.reduce((s, a) => s + a.dep, 0) / totalAlumnos) : 0;
  const enRiesgoAlto = alumnosProcesados.filter(a => a.riesgo === 'Alto');

  const alumnosFiltrados = alumnosProcesados.filter(a => {
    const nombreCompleto = `${a.nombre} ${a.ape_p} ${a.ape_m}`.toLowerCase();
    const coincideBusqueda = nombreCompleto.includes(busqueda.toLowerCase());
    return coincideBusqueda && 
           (grupoFiltro === 'todos' || a.grupo_id === Number(grupoFiltro)) && 
           (riesgoFiltro === 'todos' || a.riesgo === riesgoFiltro);
  });

  const abrirCrear = () => { 
    setFormGrupo({ nombre: '', carrera_id: '', cuatrimestre: '' }); 
    setModal({ open: true, mode: 'crear', grupo: null }); 
  }
  
  const abrirEditar = (g) => { 
    setFormGrupo({ nombre: g.nombre, carrera_id: g.carrera_id, cuatrimestre: g.cuatrimestre }); 
    setModal({ open: true, mode: 'editar', grupo: g }); 
  }

  const guardarGrupo = async () => {
    if (!formGrupo.nombre || !formGrupo.carrera_id || !formGrupo.cuatrimestre) return;
    setSaving(true);
    try {
      const payload = {
        ...formGrupo,
        carrera_id: Number(formGrupo.carrera_id),
        cuatrimestre: Number(formGrupo.cuatrimestre)
      };

      if (modal.mode === 'crear') await crearGrupo(payload);
      else await editarGrupo(modal.grupo.id, payload);
      
      setModal({ open: false }); 
      cargarDatos();
    } catch { 
      console.error("Error al guardar"); 
    } finally { 
      setSaving(false); 
    }
  }

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-[#F9F9F7] text-gray-400 font-black text-[10px] tracking-[0.3em]">CARGANDO SERENIA...</div>

  return (
    <div className="min-h-screen w-full bg-[#F9F9F7] flex flex-col font-sans antialiased">
      <Navbar />
      <div className="flex-1 w-full max-w-[1650px] mx-auto p-3 md:p-6">
        <div className="w-full bg-[#FAFBFF] rounded-[45px] shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-white/80 p-6 md:p-10">
          
          <section className="mb-10 bg-white/60 p-8 rounded-[35px] border border-white/40 shadow-sm flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-2">Panel SerenIA</p>
              <h1 className="text-3xl font-black text-gray-800 tracking-tighter">Bienvenido, <span className="text-[#8BA888]">Tutor.</span></h1>
            </div>
            <div className="w-12 h-12 bg-[#E8EDDF] rounded-2xl flex items-center justify-center text-[#8BA888]"><Activity size={20}/></div>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
             <StatCard label="Alumnos Totales" value={totalAlumnos} sub={`${grupos.length} grupos activos`} color="bg-white" />
             <StatCard label="Avg. Ansiedad" value={promAns} sub="Puntos promedio" color="bg-[#FEF3C7]/50" />
             <StatCard label="Avg. Estrés" value={promEst} sub="Puntos promedio" color="bg-[#FEE2E2]/50" />
             <StatCard label="Avg. Depresión" value={promDep} sub="Puntos promedio" color="bg-[#E0E7FF]/50" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white/60 rounded-[35px] p-8 border border-white/40">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mis Grupos</h3>
                  <button onClick={abrirCrear} className="p-2 bg-[#8BA888] text-white rounded-xl shadow-md hover:bg-gray-800 transition-colors"><Plus size={18}/></button>
                </div>
                <div className="space-y-3">
                  {grupos.map(g => (
                    <div key={g.id} className="bg-white p-4 rounded-2xl border border-gray-50 flex justify-between items-center hover:shadow-sm transition-all">
                      <div><p className="font-black text-gray-800">{g.nombre}</p><p className="text-[9px] font-bold text-gray-400 uppercase">{g.cuatrimestre}° Cuatrimestre</p></div>
                      <div className="flex gap-1">
                        <button onClick={() => abrirEditar(g)} className="p-2 text-gray-300 hover:text-[#8BA888] transition-colors"><Edit3 size={14}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 bg-white rounded-[40px] p-8 border border-gray-50 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16}/>
                  <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar alumno..." className="w-full pl-12 pr-4 py-4 bg-[#F9F9F7] rounded-2xl text-sm font-bold outline-none border border-transparent focus:border-[#8BA888]/20 transition-all"/>
                </div>
                <select value={riesgoFiltro} onChange={e => setRiesgoFiltro(e.target.value)} className="px-6 py-4 bg-[#F9F9F7] rounded-2xl text-[10px] font-black uppercase outline-none border-none cursor-pointer">
                  <option value="todos">Todos los Riesgos</option>
                  <option value="Alto">Riesgo Alto</option>
                  <option value="Moderado">Moderado</option>
                  <option value="Bajo">Bajo</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="pb-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">Estudiante</th>
                      <th className="pb-4 text-[10px] font-black text-gray-300 uppercase tracking-widest text-center">Riesgo</th>
                      <th className="pb-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {alumnosFiltrados.map(a => (
                        <tr key={a.id} className="group hover:bg-[#F9F9F7]/50 transition-colors">
                          <td className="py-5">
                            <p className="text-sm font-black text-gray-800 tracking-tight">{a.ape_p} {a.nombre}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{a.correo}</p>
                          </td>
                          <td className="py-5 text-center">
                            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${NIVEL_COLORS[a.riesgo].bg} ${NIVEL_COLORS[a.riesgo].text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${NIVEL_COLORS[a.riesgo].dot}`}></span>{a.riesgo}
                            </span>
                          </td>
                          <td className="py-5 text-right">
                            <button onClick={() => setAlumnoSeleccionado(a)} className="p-3 hover:bg-white rounded-2xl shadow-sm opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2 ml-auto">
                              <span className="text-[9px] font-black uppercase text-gray-400">Ver Perfil</span>
                              <ChevronRight size={16} className="text-gray-300"/>
                            </button>
                          </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {alumnoSeleccionado && (
        <PerfilModal 
          alumno={alumnoSeleccionado} 
          onClose={() => setAlumnoSeleccionado(null)} 
        />
      )}

      {/* MODAL CRUD GRUPO - CORREGIDO CON CUATRIMESTRE */}
      {modal.open && (
         <div className="fixed inset-0 bg-[#1C2D6E]/20 backdrop-blur-md flex items-center justify-center z-[200] p-4">
            <div className="bg-white rounded-[45px] p-10 w-full max-w-md shadow-2xl border border-white">
               <h2 className="text-2xl font-black text-gray-800 mb-8 tracking-tighter">{modal.mode === 'crear' ? 'Nuevo Grupo' : 'Editar Grupo'}</h2>
               <div className="space-y-6 mb-8">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Nombre del Grupo</label>
                    <input value={formGrupo.nombre} onChange={e => setFormGrupo({...formGrupo, nombre: e.target.value})} placeholder="Ej. 10°A" className="w-full px-6 py-4 bg-[#F9F9F7] rounded-3xl font-bold outline-none focus:ring-2 focus:ring-[#E8EDDF] transition-all"/>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Carrera</label>
                      <select value={formGrupo.carrera_id} onChange={e => setFormGrupo({...formGrupo, carrera_id: e.target.value})} className="w-full px-6 py-4 bg-[#F9F9F7] rounded-3xl font-bold outline-none appearance-none cursor-pointer">
                         <option value="">Seleccionar...</option>
                         {carreras.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Cuatrimestre</label>
                      <input type="number" min="1" max="11" value={formGrupo.cuatrimestre} onChange={e => setFormGrupo({...formGrupo, cuatrimestre: e.target.value})} placeholder="1-11" className="w-full px-6 py-4 bg-[#F9F9F7] rounded-3xl font-bold outline-none focus:ring-2 focus:ring-[#E8EDDF] transition-all"/>
                    </div>
                  </div>
               </div>
               <div className="flex gap-4">
                  <button onClick={() => setModal({open: false})} className="flex-1 text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-gray-600">Cancelar</button>
                  <button onClick={guardarGrupo} disabled={saving} className="flex-1 py-4 bg-gray-800 hover:bg-[#8BA888] text-white rounded-[25px] font-black uppercase text-[10px] tracking-widest transition-all shadow-lg active:scale-95">
                    {saving ? 'Procesando...' : 'Guardar Grupo'}
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  )
}

function StatCard({ label, value, sub, color }) {
  return (
    <div className={`${color} rounded-[35px] p-8 border border-white shadow-sm transition-all hover:translate-y-[-4px]`}>
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-5">{label}</p>
      <p className="text-4xl font-black text-gray-800 tracking-tighter">{value}</p>
      <p className="text-[10px] font-bold text-gray-400 mt-2">{sub}</p>
    </div>
  )
}