import { useEffect, useState, useMemo, lazy, Suspense } from 'react'
import Navbar from '../../components/Navbar'
import {
  Users, Plus, Search,
  ChevronRight, Edit3, X, Trash2, Pause, Play
} from 'lucide-react'
import { 
  getMisGrupos, 
  getMisAlumnos, 
  crearGrupo, 
  editarGrupo, 
  eliminarGrupo,
  cambiarEstadoGrupo
} from '../../api/tutores.api'
import { getCarreras } from '../../api/auth.api'
import PerfilModal from '../../components/PerfilModal'

const GraficaBarras = lazy(() => import('../../components/GraficaBarras'))

const getNivel = (v) => {
  if (v > 60) return 'Crítico'
  if (v > 40) return 'Alto'
  if (v > 20) return 'Moderado'
  return 'Bajo'
}

const NIVEL_STYLES = {
  Crítico: { bg: 'bg-red-100',    text: 'text-red-600',    dot: 'bg-red-500' },
  Alto:    { bg: 'bg-orange-100', text: 'text-orange-600', dot: 'bg-orange-400' },
  Moderado:{ bg: 'bg-amber-100',  text: 'text-amber-600',  dot: 'bg-amber-400' },
  Bajo:    { bg: 'bg-[#E8EDDF]',  text: 'text-[#5a7a57]',  dot: 'bg-[#8BA888]' },
}

const TIPO_COLORS = {
  ansiedad: { bar: '#FFD18A', light: '#FFF8ED', text: 'text-amber-600', label: 'Ansiedad' },
  estres:   { bar: '#FFADAD', light: '#FFF1F1', text: 'text-red-500',   label: 'Estrés' },
  depresion:{ bar: '#A0A4FF', light: '#F5F6FF', text: 'text-indigo-500', label: 'Depresión' },
}

export default function TutorDashboard() {
  const [grupos, setGrupos] = useState([])
  const [alumnos, setAlumnos] = useState([])
  const [carreras, setCarreras] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [riesgoFiltro, setRiesgoFiltro] = useState('todos')
  const [grupoFiltro, setGrupoFiltro] = useState('')
  const [modal, setModal] = useState({ open: false, mode: 'crear', grupo: null })
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null)
  const [formGrupo, setFormGrupo] = useState({ nombre: '', carrera_id: '', cuatrimestre: '' })
  const [saving, setSaving] = useState(false)
  const [popupGrafica, setPopupGrafica] = useState(null)

  const cargarDatos = () => {
    setLoading(true)
    Promise.all([
      getMisGrupos(), 
      getMisAlumnos(grupoFiltro ? { grupo_id: grupoFiltro } : {})
    ])
      .then(([g, a]) => {
        setGrupos(g.data?.data || g.data || [])
        setAlumnos(a.data?.data || a.data || [])
      })
      .catch(() => { setAlumnos([]); setGrupos([]) })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    cargarDatos()
    getCarreras().then(({ data }) => setCarreras(Array.isArray(data) ? data : []))
  }, [grupoFiltro])

  const alumnosProcesados = useMemo(() => {
    if (!Array.isArray(alumnos)) return []
    return alumnos
      .filter(a => a.grupos?.estado !== 'inactivo')
      .map(a => {
        const ans = Number(a.ans) || Number(a.estadisticas?.ansiedad) || 0
        const est = Number(a.est) || Number(a.estadisticas?.estres)   || 0
        const dep = Number(a.dep) || Number(a.estadisticas?.depresion)|| 0
      const maxVal = Math.max(ans, est, dep)
      return {
        ...a, ans, est, dep, maxVal,
        nivelAns: getNivel(ans),
        nivelEst: getNivel(est),
        nivelDep: getNivel(dep),
        nivelGeneral: getNivel(maxVal),
      }
    }).sort((a, b) => {
      const order = { Crítico: 0, Alto: 1, Moderado: 2, Bajo: 3 }
      return (order[a.nivelGeneral] - order[b.nivelGeneral]) || (b.maxVal - a.maxVal)
    })
  }, [alumnos])

  const dataGrafica = useMemo(() => {
    const NIVELES = ['Bajo', 'Moderado', 'Alto', 'Crítico']
    return NIVELES.map(nivel => ({
      nivel,
      ansiedad:  alumnosProcesados.filter(a => a.nivelAns === nivel).length,
      estres:    alumnosProcesados.filter(a => a.nivelEst === nivel).length,
      depresion: alumnosProcesados.filter(a => a.nivelDep === nivel).length,
    }))
  }, [alumnosProcesados])

  // Lógica para filtrar alumnos del popup
  const alumnosEnPopup = useMemo(() => {
    if (!popupGrafica) return []
    const key = { ansiedad: 'nivelAns', estres: 'nivelEst', depresion: 'nivelDep' }[popupGrafica.tipo]
    return alumnosProcesados.filter(a => a[key] === popupGrafica.nivel)
  }, [popupGrafica, alumnosProcesados])

  const alumnosFiltrados = alumnosProcesados.filter(a => {
    const full = `${a.nombre} ${a.ape_p} ${a.ape_m}`.toLowerCase()
    return full.includes(busqueda.toLowerCase()) && (riesgoFiltro === 'todos' || a.nivelGeneral === riesgoFiltro)
  })

  const guardarGrupo = async () => {
    if (!formGrupo.nombre || !formGrupo.carrera_id || !formGrupo.cuatrimestre) return
    setSaving(true)
    try {
      const payload = { ...formGrupo, carrera_id: Number(formGrupo.carrera_id), cuatrimestre: Number(formGrupo.cuatrimestre) }
      modal.mode === 'crear' ? await crearGrupo(payload) : await editarGrupo(modal.grupo.id, payload)
      setModal({ open: false }); cargarDatos();
    } catch { alert("Error al guardar"); } finally { setSaving(false); }
  }

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#F9F9F7] text-gray-600 font-black text-[12px] tracking-[0.3em]">
      CARGANDO SERENIA...
    </div>
  )

  return (
    <div className="min-h-screen w-full bg-[#F9F9F7] flex flex-col font-sans antialiased">
      <Navbar />
      <div className="flex-1 w-full max-w-[1650px] mx-auto p-3 md:p-6">
        <div className="w-full bg-[#FAFBFF] rounded-[45px] shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-white/80 p-6 md:p-10">
          
          <section className="mb-10 bg-white/60 p-8 rounded-[35px] border border-white/40 shadow-sm flex justify-between items-center">
            <div>
              <p className="text-[12px] font-black text-gray-600 uppercase tracking-[0.4em] mb-2">Panel SerenIA</p>
              <h1 className="text-3xl font-black text-gray-800 tracking-tighter">Bienvenido, <span className="text-[#8BA888]">Tutor.</span></h1>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="w-12 h-12 bg-[#E8EDDF] rounded-2xl flex items-center justify-center text-[#8BA888]"><Users size={20} /></div>
              <p className="text-[11px] font-black text-gray-600 uppercase tracking-widest">{alumnosProcesados.length} Alumnos</p>
            </div>
          </section>

          <div className="flex flex-col xl:grid xl:grid-cols-12 gap-8">
            <div className="lg:col-span-3 bg-white/60 rounded-[35px] p-8 border border-white/40">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[12px] font-black text-gray-500 uppercase tracking-widest">Mis Grupos</h3>
                <button onClick={() => { setFormGrupo({ nombre: '', carrera_id: '', cuatrimestre: '' }); setModal({ open: true, mode: 'crear' }); }} className="p-2 bg-[#8BA888] text-white rounded-xl shadow-md"><Plus size={18} /></button>
              </div>
              <div className="space-y-3">
                {grupos.filter(g => g.estado !== 'inactivo').map(g => (
                  <div key={g.id} className="bg-white p-4 rounded-2xl border border-gray-50 flex justify-between items-center group">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-black text-gray-800 text-sm">{g.nombre}</p>
                      </div>
                      <p className="text-[11px] font-bold text-gray-600 uppercase">{g.cuatrimestre}° Cuatrimestre</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={async () => {
                        await cambiarEstadoGrupo(g.id, 'inactivo');
                        cargarDatos();
                      }} className="p-2 text-gray-300 hover:text-orange-400" title="Pausar Grupo">
                        <Pause size={14} />
                      </button>
                      <button onClick={() => { setFormGrupo(g); setModal({ open: true, mode: 'editar', grupo: g }); }} className="p-2 text-gray-300 hover:text-[#8BA888]"><Edit3 size={14} /></button>
                      <button onClick={async () => { if(window.confirm("¿Eliminar?")) { await eliminarGrupo(g.id); cargarDatos(); }}} className="p-2 text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}

                {/* Grupos Inactivos */}
                {grupos.filter(g => g.estado === 'inactivo').length > 0 && (
                  <div className="pt-4 mt-4 border-t border-gray-100">
                    <h4 className="text-[11px] font-black text-gray-600 uppercase tracking-widest mb-3">Grupos Pausados</h4>
                    {grupos.filter(g => g.estado === 'inactivo').map(g => (
                      <div key={g.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 opacity-70 flex justify-between items-center group mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-black text-gray-500 text-sm line-through">{g.nombre}</p>
                          </div>
                          <p className="text-[11px] font-bold text-gray-600 uppercase">{g.cuatrimestre}° Cuatrimestre</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={async () => {
                            await cambiarEstadoGrupo(g.id, 'activo');
                            cargarDatos();
                          }} className="p-2 text-gray-600 hover:text-[#8BA888]" title="Reactivar Grupo">
                            <Play size={14} />
                          </button>
                          <button onClick={async () => { if(window.confirm("¿Eliminar?")) { await eliminarGrupo(g.id); cargarDatos(); }}} className="p-2 text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* SECCIÓN GRÁFICA CON POPUP RESTAURADO */}
            <div className="lg:col-span-9 bg-white rounded-[35px] p-8 border border-gray-50 shadow-sm relative">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[12px] font-black text-gray-500 uppercase tracking-widest">Salud General</h3>
                <div className="flex gap-4">
                  {Object.entries(TIPO_COLORS).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: v.bar }} /><span className="text-[12px] font-bold text-gray-500">{v.label}</span></div>
                  ))}
                </div>
              </div>
              <div className="h-[280px]">
                <Suspense fallback={<div className="h-full flex items-center justify-center text-[12px] text-gray-600 font-black">CARGANDO...</div>}>
                  <GraficaBarras data={dataGrafica} onBarClick={setPopupGrafica} />
                </Suspense>
              </div>

              {/* POPUP DE LISTADO DE ALUMNOS (RESTAURADO) */}
              {popupGrafica && (
                <div className="absolute top-6 right-6 w-80 bg-white/95 backdrop-blur-xl rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-50 border border-white overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-5 pb-4 flex justify-between items-start border-b border-gray-50" style={{ background: `${TIPO_COLORS[popupGrafica.tipo]?.bar}10` }}>
                    <div>
                      <p className="text-[12px] font-black uppercase tracking-widest mb-1" style={{ color: TIPO_COLORS[popupGrafica.tipo]?.text }}>
                        {TIPO_COLORS[popupGrafica.tipo]?.label} · {popupGrafica.nivel}
                      </p>
                      <p className="text-2xl font-black text-gray-800 tracking-tighter">
                        {alumnosEnPopup.length} <span className="text-[12px] text-gray-600 font-bold uppercase tracking-normal">Alumnos</span>
                      </p>
                    </div>
                    <button onClick={() => setPopupGrafica(null)} className="p-1.5 bg-white rounded-full shadow-sm text-gray-600 hover:text-gray-600 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="p-3 max-h-60 overflow-y-auto space-y-1">
                    {alumnosEnPopup.map(a => (
                      <div 
                        key={a.id} 
                        onClick={() => { setAlumnoSeleccionado(a); setPopupGrafica(null); }} 
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-black" style={{ background: `${TIPO_COLORS[popupGrafica.tipo]?.bar}20`, color: TIPO_COLORS[popupGrafica.tipo]?.text }}>
                            {a.nombre?.[0]}
                          </div>
                          <div>
                            <p className="text-xs font-black text-gray-800 group-hover:text-[#8BA888]">{a.ape_p} {a.nombre}</p>
                            <p className="text-[11px] text-gray-600 font-bold">{a.correo}</p>
                          </div>
                        </div>
                        <ChevronRight size={12} className="text-gray-200 group-hover:text-[#8BA888]" />
                      </div>
                    ))}
                    {alumnosEnPopup.length === 0 && (
                      <p className="text-center py-4 text-[12px] font-bold text-gray-600 uppercase tracking-widest">Sin alumnos</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-12 bg-white rounded-[40px] p-8 border border-gray-50 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
                <div><h3 className="text-lg font-black text-gray-800 tracking-tighter">Estudiantes</h3><p className="text-[12px] text-gray-600">Selecciona para ver detalle</p></div>
                <div className="flex gap-3 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
                    <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar..." className="pl-11 pr-5 py-3 bg-[#F9F9F7] rounded-2xl text-sm font-bold outline-none w-48" />
                  </div>
                  <select value={grupoFiltro} onChange={e => setGrupoFiltro(e.target.value)} className="px-5 py-3 bg-[#F9F9F7] rounded-2xl text-[12px] font-black uppercase outline-none text-gray-600">
                    <option value="">Todos los Grupos</option>
                    {grupos.map(g => <option key={g.id} value={g.id}>{g.nombre} {g.estado === 'inactivo' ? '(Pausado)' : ''}</option>)}
                  </select>
                  <select value={riesgoFiltro} onChange={e => setRiesgoFiltro(e.target.value)} className="px-5 py-3 bg-[#F9F9F7] rounded-2xl text-[12px] font-black uppercase outline-none text-gray-600">
                    <option value="todos">Todos los Riesgos</option><option value="Crítico">Crítico</option><option value="Alto">Alto</option><option value="Moderado">Moderado</option><option value="Bajo">Bajo</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-left border-separate border-spacing-y-2">
                  <thead><tr className="text-[11px] font-black text-gray-600 uppercase pl-4"><th>Estudiante</th><th className="text-center">Riesgo</th><th className="text-center">Ansiedad</th><th className="text-center">Estrés</th><th className="text-center">Depresión</th></tr></thead>
                  <tbody>
                    {alumnosFiltrados.map(a => {
                      const s = NIVEL_STYLES[a.nivelGeneral]
                      return (
                        <tr key={a.id} onClick={() => setAlumnoSeleccionado(a)} className={`cursor-pointer transition-all hover:scale-[1.01] ${a.nivelGeneral === 'Crítico' ? 'bg-red-50/40' : 'hover:bg-gray-50/80'}`}>
                          <td className="py-4 pl-4 rounded-l-[20px]"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${s.bg} ${s.text}`}>{a.nombre?.[0]}</div><div><p className="text-sm font-black text-gray-800">{a.ape_p} {a.nombre}</p><p className="text-[11px] font-bold text-gray-600">{a.correo}</p></div></div></td>
                          <td className="text-center"><span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase ${s.bg} ${s.text}`}><span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{a.nivelGeneral}</span></td>
                          <td className="text-center"><MiniNivel nivel={a.nivelAns} color="#FFD18A" /></td>
                          <td className="text-center"><MiniNivel nivel={a.nivelEst} color="#FFADAD" /></td>
                          <td className="text-center rounded-r-[20px]"><MiniNivel nivel={a.nivelDep} color="#A0A4FF" /></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      {alumnoSeleccionado && <PerfilModal alumno={alumnoSeleccionado} onClose={() => setAlumnoSeleccionado(null)} />}
      {modal.open && (
        <div className="fixed inset-0 bg-[#1C2D6E]/20 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-black text-gray-800 mb-8 tracking-tighter">{modal.mode === 'crear' ? 'Nuevo Grupo' : 'Editar Grupo'}</h2>
            <div className="space-y-6 mb-8">
              <input value={formGrupo.nombre} onChange={e => setFormGrupo({ ...formGrupo, nombre: e.target.value })} placeholder="Nombre Grupo" className="w-full px-6 py-4 bg-[#F9F9F7] rounded-3xl font-bold outline-none" />
              <select value={formGrupo.carrera_id} onChange={e => setFormGrupo({ ...formGrupo, carrera_id: e.target.value })} className="w-full px-6 py-4 bg-[#F9F9F7] rounded-3xl font-bold outline-none"><option value="">Carrera...</option>{carreras.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select>
              <input type="number" value={formGrupo.cuatrimestre} onChange={e => setFormGrupo({ ...formGrupo, cuatrimestre: e.target.value })} placeholder="Cuatri" className="w-full px-6 py-4 bg-[#F9F9F7] rounded-3xl font-bold outline-none" />
            </div>
            <div className="flex gap-4">
              <button onClick={() => setModal({ open: false })} className="flex-1 text-gray-600 font-black uppercase text-[12px]">Cancelar</button>
              <button onClick={guardarGrupo} disabled={saving} className="flex-1 py-4 bg-gray-800 text-white rounded-[25px] font-black uppercase text-[12px] tracking-widest">{saving ? '...' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MiniNivel({ nivel, color }) {
  const opacity = { Crítico: '1', Alto: '0.85', Moderado: '0.6', Bajo: '0.35' }[nivel] || '0.35'
  return <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-black uppercase text-white" style={{ background: color, opacity }}>{nivel}</span>
}