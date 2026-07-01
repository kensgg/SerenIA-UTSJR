import { useEffect, useState } from 'react'
import { 
  Users, Layers, GraduationCap, BarChart3, Plus, 
  Settings2, UserX, UserCheck, Edit3, ShieldCheck, Search, X
} from 'lucide-react'
import Navbar from '../../components/Navbar'
import {
  getTutores, crearTutor, editarTutor, desactivarTutor, reactivarTutor,
  getTodosGrupos, reasignarGrupo,
  getCarrerasAdmin, crearCarrera, editarCarrera,
  getEstadisticasAdmin
} from '../../api/admin.api'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TABS = [
  { name: 'Resumen', icon: BarChart3 },
  { name: 'Tutores', icon: Users },
  { name: 'Grupos', icon: Layers },
  { name: 'Carreras', icon: GraduationCap }
]

const NIVEL = (v) => v > 40 ? 'Alto' : v > 20 ? 'Moderado' : 'Bajo'

export default function Admin() {
  const [tab, setTab] = useState('Resumen')
  const [stats, setStats] = useState(null)
  const [tutores, setTutores] = useState([])
  const [grupos, setGrupos] = useState([])
  const [carreras, setCarreras] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Filtros para Resumen
  const [filtrosResumen, setFiltrosResumen] = useState({
    carrera_id: '',
    grupo_id: '',
    fecha_inicio: '',
    fecha_fin: ''
  })

  // Estados de modales
  const [modalTutor, setModalTutor] = useState({ open: false, mode: 'crear', tutor: null })
  const [tutorForm, setTutorForm] = useState({ nombre: '', correo: '', password: '' })
  
  const [modalCarrera, setModalCarrera] = useState({ open: false, mode: 'crear', carrera: null })
  const [carreraForm, setCarreraForm] = useState({ nombre: '', siglas: '' })
  
  const [modalGrupo, setModalGrupo] = useState({ open: false, grupo: null })
  const [tutorSeleccionado, setTutorSeleccionado] = useState('')
  
  const [modalConfirm, setModalConfirm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const cargarFijos = () => {
    setLoading(true)
    Promise.all([getTutores(), getTodosGrupos(), getCarrerasAdmin()])
      .then(([t, g, c]) => {
        setTutores(t.data); setGrupos(g.data); setCarreras(c.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  const cargarTodo = () => {
    cargarFijos()
  }

  useEffect(() => { cargarFijos() }, [])

  useEffect(() => {
    getEstadisticasAdmin(filtrosResumen).then(res => setStats(res.data)).catch(console.error);
  }, [filtrosResumen])

  // --- Handlers Tutores ---
  const abrirCrearTutor = () => { 
    setTutorForm({ nombre: '', correo: '', password: '' }); 
    setError(''); 
    setModalTutor({ open: true, mode: 'crear', tutor: null }) 
  }
  
  const abrirEditarTutor = (t) => { 
    setTutorForm({ nombre: t.nombre, correo: t.correo, password: '' }); 
    setError(''); 
    setModalTutor({ open: true, mode: 'editar', tutor: t }) 
  }
  
  const guardarTutor = async () => {
    if (!tutorForm.nombre || !tutorForm.correo) return setError('Campos obligatorios faltantes')
    setSaving(true)
    try {
      if (modalTutor.mode === 'crear') await crearTutor(tutorForm)
      else await editarTutor(modalTutor.tutor.id, tutorForm)
      setModalTutor({ open: false }); cargarTodo()
    } catch (err) { setError(err.response?.data?.error || 'Error al guardar') } 
    finally { setSaving(false) }
  }

  const toggleTutor = async (t) => {
    try {
      t.rol === 'inactivo' ? await reactivarTutor(t.id) : await desactivarTutor(t.id)
      setModalConfirm(null); cargarTodo()
    } catch { setModalConfirm(null) }
  }

  // --- Handlers Carreras ---
  const abrirEditarCarrera = (c) => {
    setCarreraForm({ nombre: c.nombre, siglas: c.siglas });
    setError('');
    setModalCarrera({ open: true, mode: 'editar', carrera: c });
  }

  const guardarCarrera = async () => {
    if (!carreraForm.nombre || !carreraForm.siglas) return setError('Datos incompletos')
    setSaving(true)
    try {
      modalCarrera.mode === 'crear' ? await crearCarrera(carreraForm) : await editarCarrera(modalCarrera.carrera.id, carreraForm)
      setModalCarrera({ open: false }); cargarTodo()
    } catch { setError('Error en el servidor') } 
    finally { setSaving(false) }
  }

  // --- Handlers Grupos ---
  const abrirReasignar = (g) => {
    setTutorSeleccionado(g.tutor_id || '');
    setError('');
    setModalGrupo({ open: true, grupo: g });
  }

  const guardarReasignacion = async () => {
    if (!tutorSeleccionado) return setError('Selecciona un tutor válido')
    setSaving(true)
    try {
      await reasignarGrupo(modalGrupo.grupo.id, { tutor_id: tutorSeleccionado })
      setModalGrupo({ open: false }); cargarTodo()
    } catch { setError('Error al reasignar') } 
    finally { setSaving(false) }
  }

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-[#F9F9F7] text-[#8BA888] font-black text-[12px] tracking-[0.3em] animate-pulse">CARGANDO SISTEMA...</div>

  const filteredTutores = tutores.filter(t => t.nombre.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="min-h-screen bg-[#F9F9F7] font-sans antialiased pb-20">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 pt-10">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-[12px] font-black text-[#8BA888] uppercase tracking-[0.2em] mb-2 text-center md:text-left">Gestión de Plataforma</p>
            <h1 className="text-4xl font-black text-gray-800 tracking-tighter text-center md:text-left">Administración</h1>
          </div>
          <nav className="flex gap-1 bg-white/60 p-1.5 rounded-[24px] border border-gray-100 shadow-sm self-center">
            {TABS.map(t => (
              <button
                key={t.name}
                onClick={() => setTab(t.name)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-[20px] text-[12px] font-black uppercase tracking-wider transition-all ${
                  tab === t.name ? 'bg-white text-gray-800 shadow-md shadow-gray-200/40' : 'text-gray-600 hover:text-gray-600'
                }`}
              >
                <t.icon size={14} /> {t.name}
              </button>
            ))}
          </nav>
        </header>

        {/* CONTENIDO: RESUMEN */}
        {tab === 'Resumen' && stats && (
          <div className="space-y-8 animate-in fade-in duration-700">
            {/* Filtros */}
            <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-4 w-full md:w-auto overflow-x-auto">
                <select 
                  value={filtrosResumen.carrera_id}
                  onChange={(e) => setFiltrosResumen(prev => ({...prev, carrera_id: e.target.value, grupo_id: ''}))}
                  className="bg-[#F9F9F7] border border-gray-200 rounded-[16px] px-4 py-2.5 text-xs font-bold text-gray-600 outline-none focus:ring-2 focus:ring-[#8BA888]/20"
                >
                  <option value="">Todas las Carreras</option>
                  {carreras.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
                <select 
                  value={filtrosResumen.grupo_id}
                  onChange={(e) => setFiltrosResumen(prev => ({...prev, grupo_id: e.target.value}))}
                  className="bg-[#F9F9F7] border border-gray-200 rounded-[16px] px-4 py-2.5 text-xs font-bold text-gray-600 outline-none focus:ring-2 focus:ring-[#8BA888]/20"
                >
                  <option value="">Todos los Grupos</option>
                  {grupos.filter(g => !filtrosResumen.carrera_id || g.carreras?.id == filtrosResumen.carrera_id).map(g => (
                    <option key={g.id} value={g.id}>{g.nombre}</option>
                  ))}
                </select>
                <input 
                  type="date"
                  value={filtrosResumen.fecha_inicio}
                  onChange={(e) => setFiltrosResumen(prev => ({...prev, fecha_inicio: e.target.value}))}
                  className="bg-[#F9F9F7] border border-gray-200 rounded-[16px] px-4 py-2.5 text-xs font-bold text-gray-600 outline-none focus:ring-2 focus:ring-[#8BA888]/20"
                  title="Fecha Inicio"
                />
                <input 
                  type="date"
                  value={filtrosResumen.fecha_fin}
                  onChange={(e) => setFiltrosResumen(prev => ({...prev, fecha_fin: e.target.value}))}
                  className="bg-[#F9F9F7] border border-gray-200 rounded-[16px] px-4 py-2.5 text-xs font-bold text-gray-600 outline-none focus:ring-2 focus:ring-[#8BA888]/20"
                  title="Fecha Fin"
                />
              </div>
              {Object.values(filtrosResumen).some(v => v !== '') && (
                <button 
                  onClick={() => setFiltrosResumen({carrera_id: '', grupo_id: '', fecha_inicio: '', fecha_fin: ''})}
                  className="text-[10px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-600 flex items-center gap-1 bg-rose-50 px-3 py-1.5 rounded-full"
                >
                  <X size={12}/> Limpiar
                </button>
              )}
            </div>

            {/* Tarjetas Principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Alumnos Filtrados', value: stats.total_alumnos, sub: 'Total en la selección', color: 'bg-indigo-50 text-indigo-400' },
                { label: 'Grupos Involucrados', value: stats.total_grupos, sub: 'Grupos activos', color: 'bg-[#FEF3C7] text-amber-500' },
                { label: 'Total de Evaluaciones', value: stats.total_respuestas || 0, sub: 'Cuestionarios completados', color: 'bg-[#E8EDDF] text-[#8BA888]' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-[38px] p-8 border border-gray-50 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">{s.label}</p>
                  <div>
                    <p className="text-5xl font-black text-gray-800 tracking-tighter">{s.value}</p>
                    <span className={`inline-block mt-4 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest ${s.color}`}>
                      {s.sub}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Gráficos Principales Simplificados */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Timeline */}
              <section className="bg-white rounded-[38px] p-8 border border-gray-100 shadow-sm flex flex-col">
                <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center justify-between">
                  Evolución de Evaluaciones
                  <span className="text-[10px] font-bold text-gray-300">En el tiempo</span>
                </h3>
                <div className="flex-grow w-full h-[300px]">
                  <Line 
                    data={{
                      labels: stats.timeline?.labels || [],
                      datasets: [{
                        label: 'Evaluaciones',
                        data: stats.timeline?.data || [],
                        borderColor: '#8BA888',
                        backgroundColor: 'rgba(139, 168, 136, 0.2)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 3,
                        pointBackgroundColor: '#fff',
                        pointBorderColor: '#8BA888',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                      }]
                    }} 
                    options={{
                      responsive: true, maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        y: { beginAtZero: true, grid: { display: true, color: '#f3f4f6' }, border: { display: false }, ticks: { stepSize: 1, color: '#9ca3af', font: { size: 10, weight: 'bold' } } },
                        x: { grid: { display: false }, border: { display: false }, ticks: { color: '#9ca3af', font: { size: 10, weight: 'bold' } } }
                      }
                    }} 
                  />
                </div>
              </section>

              {/* Emociones (Niveles Altos/Críticos) */}
              <section className="bg-white rounded-[38px] p-8 border border-gray-100 shadow-sm flex flex-col">
                <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-rose-400"/> Alertas Altas/Críticas</span>
                  <span className="text-[10px] font-bold text-rose-300 bg-rose-50 px-2 py-1 rounded-full">Atención Prioritaria</span>
                </h3>
                <p className="text-xs text-gray-400 mb-8 font-medium">Alumnos con niveles significativos en la selección actual</p>
                <div className="flex-grow w-full h-[300px]">
                  <Bar 
                    data={{
                      labels: ['Ansiedad', 'Estrés', 'Depresión'],
                      datasets: [{
                        label: 'Casos Críticos/Altos',
                        data: [
                          stats.emociones?.ansiedad?.alto || 0,
                          stats.emociones?.estres?.alto || 0,
                          stats.emociones?.depresion?.alto || 0
                        ],
                        backgroundColor: ['#fcd34d', '#fda4af', '#a5b4fc'],
                        borderRadius: 8,
                        barPercentage: 0.5
                      }]
                    }}
                    options={{
                      responsive: true, maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        y: { beginAtZero: true, grid: { color: '#f3f4f6' }, border: { display: false }, ticks: { stepSize: 1, color: '#9ca3af', font: { size: 10, weight: 'bold' } } },
                        x: { grid: { display: false }, border: { display: false }, ticks: { color: '#6b7280', font: { size: 11, weight: 'bold' } } }
                      }
                    }}
                  />
                </div>
              </section>
            </div>
          </div>
        )}

        {/* CONTENIDO: TUTORES */}
        {tab === 'Tutores' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 px-2">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={16}/>
                <input 
                  type="text" 
                  placeholder="BUSCAR TUTOR POR NOMBRE..."
                  className="w-full bg-white border border-gray-100 rounded-[22px] pl-12 pr-6 py-3.5 text-[12px] font-black uppercase tracking-widest text-gray-500 focus:ring-2 focus:ring-[#8BA888]/10 outline-none transition-all shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button onClick={abrirCrearTutor} className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#8BA888] hover:bg-[#7a9677] text-white px-8 py-4 rounded-[22px] text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-[#8BA888]/20">
                <Plus size={16}/> Registrar Tutor
              </button>
            </div>

            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-left">
                  <thead className="bg-[#F9F9F7]/50 border-b border-gray-50">
                    <tr>
                      {['Perfil de Usuario', 'Estatus', 'Carga Grupal', ''].map(h => (
                        <th key={h} className="px-10 py-6 text-[11px] font-black text-gray-600 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredTutores.map(t => {
                      const inactivo = t.rol === 'inactivo';
                      return (
                        <tr key={t.id} className={`hover:bg-[#F9F9F7]/40 transition-colors ${inactivo ? 'opacity-40' : ''}`}>
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-[15px] bg-[#F9F9F7] flex items-center justify-center text-xs font-black text-[#8BA888] border border-gray-50">
                                {t.nombre[0]}
                              </div>
                              <div>
                                <p className="text-sm font-black text-gray-700 leading-none mb-1">{t.nombre}</p>
                                <p className="text-[12px] font-bold text-gray-600 lowercase">{t.correo}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-6">
                            <span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                              t.rol === 'admin' ? 'bg-indigo-50 text-indigo-400' : inactivo ? 'bg-gray-100 text-gray-600' : 'bg-[#E8EDDF] text-[#8BA888]'
                            }`}>
                              {t.rol}
                            </span>
                          </td>
                          <td className="px-10 py-6">
                            <p className="text-xs font-black text-gray-500 tracking-tighter">
                              {grupos.filter(g => g.tutor_id === t.id).length} Grupos
                            </p>
                          </td>
                          <td className="px-10 py-6 text-right">
                            {t.rol !== 'admin' && (
                              <div className="flex gap-2 justify-end">
                                <button onClick={() => abrirEditarTutor(t)} className="p-3 text-gray-300 hover:text-indigo-400 transition-colors hover:bg-indigo-50 rounded-xl"><Edit3 size={16}/></button>
                                <button onClick={() => setModalConfirm(t)} className={`p-3 transition-colors rounded-xl ${inactivo ? 'text-emerald-400 hover:bg-emerald-50' : 'text-rose-300 hover:bg-rose-50'}`}>
                                  {inactivo ? <UserCheck size={18}/> : <UserX size={18}/>}
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CONTENIDO: GRUPOS */}
        {tab === 'Grupos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
            {grupos.map(g => (
              <div key={g.id} className="bg-white rounded-[38px] p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/20 transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[11px] font-black bg-[#F9F9F7] text-gray-600 px-4 py-1.5 rounded-full uppercase tracking-widest border border-gray-50">
                    {g.carreras?.siglas || 'S/C'}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-[12px] font-black text-indigo-300">
                    {g.cuatrimestre}°
                  </div>
                </div>
                <h4 className="text-xl font-black text-gray-700 mb-8 tracking-tighter leading-tight group-hover:text-[#8BA888] transition-colors">{g.nombre}</h4>
                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#F9F9F7] flex items-center justify-center text-[12px] font-black text-gray-600">
                      {g.tutores?.nombre?.[0] || '?'}
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Tutor</p>
                      <p className="text-[12px] font-bold text-gray-500 uppercase tracking-tighter truncate max-w-[100px]">
                        {g.tutores?.nombre || 'Sin asignar'}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => abrirReasignar(g)} className="bg-gray-50 text-[11px] font-black text-gray-600 uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-[#8BA888] hover:text-white transition-all">
                    Reasignar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CONTENIDO: CARRERAS */}
        {tab === 'Carreras' && (
          <div className="space-y-8 animate-in fade-in">
            <div className="flex justify-end px-2">
              <button onClick={() => { setCarreraForm({nombre:'', siglas:''}); setModalCarrera({open: true, mode: 'crear'})}} className="flex items-center gap-2 bg-[#8BA888] text-white px-8 py-4 rounded-[22px] text-[11px] font-black uppercase tracking-widest shadow-lg shadow-[#8BA888]/20 transition-transform hover:scale-105">
                <Plus size={16}/> Nueva Carrera
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {carreras.map(c => (
                <div key={c.id} className="bg-white rounded-[38px] p-8 border border-gray-100 flex items-center justify-between shadow-sm hover:border-[#8BA888]/30 transition-all group">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[24px] bg-[#F9F9F7] flex items-center justify-center text-lg font-black text-[#8BA888] shadow-inner group-hover:bg-[#E8EDDF] transition-colors">
                      {c.siglas}
                    </div>
                    <div>
                      <h4 className="text-base font-black text-gray-700 uppercase tracking-tight leading-tight">{c.nombre}</h4>
                      <p className="text-[12px] font-bold text-gray-300 uppercase tracking-widest mt-1">
                        {grupos.filter(g => g.carreras?.id === c.id).length} Grupos registrados
                      </p>
                    </div>
                  </div>
                  <button onClick={() => abrirEditarCarrera(c)} className="p-4 bg-gray-50 rounded-[20px] text-gray-300 hover:bg-[#8BA888] hover:text-white transition-all">
                    <Settings2 size={20}/>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* --- MODAL TUTOR --- */}
      {modalTutor.open && (
        <div className="fixed inset-0 bg-gray-900/10 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[45px] p-12 w-full max-w-md shadow-2xl animate-in zoom-in-95">
            <header className="mb-10 text-center">
              <h2 className="text-3xl font-black text-gray-800 tracking-tighter mb-2">
                {modalTutor.mode === 'crear' ? 'Nuevo Tutor' : 'Editar Perfil'}
              </h2>
              <p className="text-[12px] font-black text-[#8BA888] uppercase tracking-[0.2em]">Credenciales de acceso</p>
            </header>
            
            <div className="space-y-5 mb-10">
              {[
                { key: 'nombre', label: 'Nombre Completo', type: 'text', icon: Users },
                { key: 'correo', label: 'Correo Institucional', type: 'email', icon: BarChart3 },
                { key: 'password', label: modalTutor.mode === 'editar' ? 'Actualizar Contraseña (Opcional)' : 'Contraseña de Acceso', type: 'password', icon: ShieldCheck },
              ].map(f => (
                <div key={f.key} className="relative">
                  <label className="block text-[11px] font-black text-gray-600 uppercase tracking-widest ml-5 mb-2">{f.label}</label>
                  <input
                    type={f.type}
                    value={tutorForm[f.key]}
                    onChange={e => setTutorForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full bg-[#F9F9F7] border-none rounded-[22px] px-8 py-4 text-sm font-bold text-gray-600 focus:ring-2 focus:ring-[#8BA888]/20 outline-none"
                    placeholder="..."
                  />
                </div>
              ))}
            </div>

            {error && <div className="bg-rose-50 text-rose-400 text-[12px] font-black uppercase p-4 rounded-2xl mb-6 text-center tracking-widest">{error}</div>}

            <div className="flex gap-4">
              <button onClick={() => setModalTutor({open: false})} className="flex-1 py-4 text-[11px] font-black uppercase text-gray-300 hover:text-gray-500 transition-colors">Cancelar</button>
              <button onClick={guardarTutor} disabled={saving} className="flex-[2] bg-[#8BA888] text-white px-8 py-5 rounded-[25px] text-[11px] font-black uppercase tracking-widest shadow-xl shadow-[#8BA888]/20 hover:scale-[1.02] transition-all disabled:opacity-50">
                {saving ? 'Guardando...' : 'Confirmar Registro'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL CARRERA --- */}
      {modalCarrera.open && (
        <div className="fixed inset-0 bg-gray-900/10 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[45px] p-12 w-full max-w-md shadow-2xl animate-in zoom-in-95">
            <h2 className="text-3xl font-black text-gray-800 tracking-tighter mb-10 text-center">
              {modalCarrera.mode === 'crear' ? 'Nueva Carrera' : 'Editar Carrera'}
            </h2>
            <div className="space-y-6 mb-10">
              <div>
                <label className="block text-[11px] font-black text-gray-600 uppercase tracking-widest ml-5 mb-2">Nombre Académico</label>
                <input
                  type="text"
                  value={carreraForm.nombre}
                  onChange={e => setCarreraForm(f => ({ ...f, nombre: e.target.value }))}
                  className="w-full bg-[#F9F9F7] border-none rounded-[22px] px-8 py-4 text-sm font-bold text-gray-600"
                  placeholder="Ingeniería en..."
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-gray-600 uppercase tracking-widest ml-5 mb-2">Siglas (Ej: DS, AF, ME)</label>
                <input
                  type="text"
                  value={carreraForm.siglas}
                  maxLength={5}
                  onChange={e => setCarreraForm(f => ({ ...f, siglas: e.target.value.toUpperCase() }))}
                  className="w-full bg-[#F9F9F7] border-none rounded-[22px] px-8 py-4 text-sm font-bold text-gray-600 tracking-[0.3em]"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setModalCarrera({open: false})} className="flex-1 py-4 text-[11px] font-black uppercase text-gray-300">Cerrar</button>
              <button onClick={guardarCarrera} disabled={saving} className="flex-[2] bg-[#8BA888] text-white py-5 rounded-[25px] text-[11px] font-black uppercase tracking-widest shadow-xl shadow-[#8BA888]/20">
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL REASIGNAR GRUPO --- */}
      {modalGrupo.open && (
        <div className="fixed inset-0 bg-gray-900/10 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-sm shadow-2xl animate-in slide-in-from-top-10">
            <header className="mb-8 text-center">
              <div className="w-14 h-14 bg-[#E8EDDF] text-[#8BA888] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Layers size={24}/>
              </div>
              <h2 className="text-xl font-black text-gray-800 tracking-tighter">Reasignar Grupo</h2>
              <p className="text-[12px] font-bold text-gray-300 uppercase mt-1 tracking-widest">{modalGrupo.grupo?.nombre}</p>
            </header>
            
            <div className="mb-10">
              <label className="block text-[11px] font-black text-gray-600 uppercase tracking-widest ml-4 mb-2">Seleccionar Nuevo Tutor</label>
              <select
                value={tutorSeleccionado}
                onChange={e => setTutorSeleccionado(e.target.value)}
                className="w-full bg-[#F9F9F7] border-none rounded-[20px] px-6 py-4 text-xs font-bold text-gray-600 outline-none focus:ring-2 focus:ring-[#8BA888]/20"
              >
                <option value="">— Sin Tutor Asignado —</option>
                {tutores.filter(t => t.rol === 'tutor').map(t => (
                  <option key={t.id} value={t.id}>{t.nombre.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <button onClick={guardarReasignacion} disabled={saving} className="w-full bg-[#8BA888] text-white py-5 rounded-[22px] text-[11px] font-black uppercase tracking-widest shadow-lg shadow-[#8BA888]/20">
                Confirmar Cambio
              </button>
              <button onClick={() => setModalGrupo({open: false})} className="w-full py-4 text-[11px] font-black uppercase text-gray-300">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL CONFIRMAR ACCESO (ESTADO) --- */}
      {modalConfirm && (
        <div className="fixed inset-0 bg-gray-900/10 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-xs shadow-2xl text-center animate-in zoom-in-95">
            <div className={`w-20 h-20 rounded-[28px] mx-auto mb-8 flex items-center justify-center shadow-inner ${modalConfirm.rol === 'inactivo' ? 'bg-emerald-50 text-emerald-400' : 'bg-rose-50 text-rose-400'}`}>
              {modalConfirm.rol === 'inactivo' ? <UserCheck size={36}/> : <UserX size={36}/>}
            </div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tighter mb-3">
              {modalConfirm.rol === 'inactivo' ? '¿Reactivar?' : '¿Suspender?'}
            </h2>
            <p className="text-[11px] font-medium text-gray-600 leading-relaxed mb-10 px-2">
              El tutor <span className="font-black text-gray-600">{modalConfirm.nombre}</span> {modalConfirm.rol === 'inactivo' ? 'recuperará' : 'perderá'} el acceso al sistema de forma inmediata.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={() => toggleTutor(modalConfirm)} className={`w-full py-5 rounded-[24px] text-[11px] font-black uppercase tracking-widest text-white shadow-xl ${modalConfirm.rol === 'inactivo' ? 'bg-emerald-400 shadow-emerald-200/50' : 'bg-rose-400 shadow-rose-200/50'}`}>
                {modalConfirm.rol === 'inactivo' ? 'Autorizar Acceso' : 'Suspender Acceso'}
              </button>
              <button onClick={() => setModalConfirm(null)} className="w-full py-4 text-[11px] font-black uppercase text-gray-300 hover:text-gray-500">Volver</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}