import { useEffect, useState, useMemo, lazy, Suspense } from 'react'
import Navbar from '../../components/Navbar'
import {
  Activity, Users, Plus, Search,
  ChevronRight, Edit3, X, User
} from 'lucide-react'
import { getMisGrupos, getMisAlumnos, crearGrupo, editarGrupo } from '../../api/tutores.api'
import { getCarreras } from '../../api/auth.api'
import PerfilModal from '../../components/PerfilModal'

const GraficaBarras = lazy(() => import('../../components/GraficaBarras'))

// ─── Helpers ────────────────────────────────────────────────
const getNivel = (v) => {
  if (v > 60) return 'Crítico'
  if (v > 40) return 'Alto'
  if (v > 20) return 'Moderado'
  return 'Bajo'
}

const NIVEL_STYLES = {
  Crítico: { bg: 'bg-red-100',    text: 'text-red-600',    dot: 'bg-red-500',    badge: 'bg-red-500'    },
  Alto:    { bg: 'bg-orange-100', text: 'text-orange-600', dot: 'bg-orange-400', badge: 'bg-orange-400' },
  Moderado:{ bg: 'bg-amber-100',  text: 'text-amber-600',  dot: 'bg-amber-400',  badge: 'bg-amber-400'  },
  Bajo:    { bg: 'bg-[#E8EDDF]',  text: 'text-[#5a7a57]',  dot: 'bg-[#8BA888]',  badge: 'bg-[#8BA888]'  },
}

const TIPO_COLORS = {
  ansiedad: { bar: '#F59E0B', light: '#FEF3C7', text: 'text-amber-700',  label: 'Ansiedad'  },
  estres:   { bar: '#F87171', light: '#FEE2E2', text: 'text-red-600',    label: 'Estrés'    },
  depresion:{ bar: '#818CF8', light: '#E0E7FF', text: 'text-indigo-600', label: 'Depresión' },
}

const NIVELES_ORDER = ['Crítico', 'Alto', 'Moderado', 'Bajo']

// ─── Componente principal ────────────────────────────────────
export default function TutorDashboard() {
  const [grupos, setGrupos]   = useState([])
  const [alumnos, setAlumnos] = useState([])
  const [carreras, setCarreras] = useState([])
  const [loading, setLoading]   = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [riesgoFiltro, setRiesgoFiltro] = useState('todos')

  const [modal, setModal]         = useState({ open: false, mode: 'crear', grupo: null })
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null)
  const [formGrupo, setFormGrupo] = useState({ nombre: '', carrera_id: '', cuatrimestre: '' })
  const [saving, setSaving]       = useState(false)

  // Estado del popup de la gráfica
  const [popupGrafica, setPopupGrafica] = useState(null) // { nivel, tipo }

  const cargarDatos = () => {
    setLoading(true)
    Promise.all([getMisGrupos(), getMisAlumnos()])
      .then(([g, a]) => {
        setGrupos(g.data?.data || g.data || [])
        setAlumnos(a.data?.data || a.data || [])
      })
      .catch(err => { console.error(err); setAlumnos([]); setGrupos([]) })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    cargarDatos()
    getCarreras()
      .then(({ data }) => setCarreras(Array.isArray(data) ? data : []))
      .catch(console.error)
  }, [])

  // ─── Procesamiento de alumnos ───────────────────────────
      const alumnosProcesados = useMemo(() => {
      if (!Array.isArray(alumnos)) return []
      return alumnos.map(a => {
        // Los valores ya vienen en a.ans, a.est, a.dep desde el backend
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

      // En Dashboard.jsx, justo después de alumnosProcesados
    console.log('=== DEBUG ===')
    console.log('Primer alumno raw:', alumnos[0])
    console.log('Primer alumno procesado:', alumnosProcesados[0])

  // ─── Datos para la gráfica agrupada ────────────────────
    const dataGrafica = useMemo(() => {
      // IMPORTANTE: el orden debe ser Bajo→Moderado→Alto→Crítico
      // para que coincida con el índice que devuelve Chart.js al hacer click
      const NIVELES_GRAFICA = ['Bajo', 'Moderado', 'Alto', 'Crítico']
      return NIVELES_GRAFICA.map(nivel => ({
        nivel,
        ansiedad:  alumnosProcesados.filter(a => a.nivelAns === nivel).length,
        estres:    alumnosProcesados.filter(a => a.nivelEst === nivel).length,
        depresion: alumnosProcesados.filter(a => a.nivelDep === nivel).length,
      }))
    }, [alumnosProcesados])

  // ─── Alumnos para el popup de gráfica ──────────────────
  const alumnosEnPopup = useMemo(() => {
    if (!popupGrafica) return []
    const { nivel, tipo } = popupGrafica
    const nivelKey = { ansiedad: 'nivelAns', estres: 'nivelEst', depresion: 'nivelDep' }[tipo]
    return alumnosProcesados.filter(a => a[nivelKey] === nivel)
  }, [popupGrafica, alumnosProcesados])

  // ─── Tabla filtrada ─────────────────────────────────────
  const alumnosFiltrados = alumnosProcesados.filter(a => {
    const nombre = `${a.nombre} ${a.ape_p} ${a.ape_m}`.toLowerCase()
    return (
      nombre.includes(busqueda.toLowerCase()) &&
      (riesgoFiltro === 'todos' || a.nivelGeneral === riesgoFiltro)
    )
  })

  // ─── Stats ──────────────────────────────────────────────
  const totalAlumnos   = alumnosProcesados.length
  const totalCriticos  = alumnosProcesados.filter(a => a.nivelGeneral === 'Crítico').length

  // ─── CRUD grupos ────────────────────────────────────────
  const abrirCrear  = () => { setFormGrupo({ nombre: '', carrera_id: '', cuatrimestre: '' }); setModal({ open: true, mode: 'crear', grupo: null }) }
  const abrirEditar = (g) => { setFormGrupo({ nombre: g.nombre, carrera_id: g.carrera_id, cuatrimestre: g.cuatrimestre }); setModal({ open: true, mode: 'editar', grupo: g }) }

  const guardarGrupo = async () => {
    if (!formGrupo.nombre || !formGrupo.carrera_id || !formGrupo.cuatrimestre) return
    setSaving(true)
    try {
      const payload = { ...formGrupo, carrera_id: Number(formGrupo.carrera_id), cuatrimestre: Number(formGrupo.cuatrimestre) }
      if (modal.mode === 'crear') await crearGrupo(payload)
      else await editarGrupo(modal.grupo.id, payload)
      setModal({ open: false }); cargarDatos()
    } catch { console.error('Error al guardar') } finally { setSaving(false) }
  }

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#F9F9F7] text-gray-400 font-black text-[10px] tracking-[0.3em]">
      CARGANDO SERENIA...
    </div>
  )

  return (
    <div className="min-h-screen w-full bg-[#F9F9F7] flex flex-col font-sans antialiased">
      <Navbar />
      <div className="flex-1 w-full max-w-[1650px] mx-auto p-3 md:p-6">
        <div className="w-full bg-[#FAFBFF] rounded-[45px] shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-white/80 p-6 md:p-10">

          {/* ── Header ── */}
          <section className="mb-10 bg-white/60 p-8 rounded-[35px] border border-white/40 shadow-sm flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-2">Panel SerenIA</p>
              <h1 className="text-3xl font-black text-gray-800 tracking-tighter">
                Bienvenido, <span className="text-[#8BA888]">Tutor.</span>
              </h1>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="w-12 h-12 bg-[#E8EDDF] rounded-2xl flex items-center justify-center text-[#8BA888]">
                <Users size={20} />
              </div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{totalAlumnos} Alumnos</p>
              {totalCriticos > 0 && (
                <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">{totalCriticos} Críticos</p>
              )}
            </div>
          </section>

          {/* ── Layout principal ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* ── Grupos ── */}
            <div className="lg:col-span-3 bg-white/60 rounded-[35px] p-8 border border-white/40">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Mis Grupos</h3>
                <button onClick={abrirCrear} className="p-2 bg-[#8BA888] text-white rounded-xl shadow-md hover:bg-gray-800 transition-colors">
                  <Plus size={18} />
                </button>
              </div>
              <div className="space-y-3">
                {grupos.map(g => (
                  <div key={g.id} className="bg-white p-4 rounded-2xl border border-gray-50 flex justify-between items-center hover:shadow-sm transition-all">
                    <div>
                      <p className="font-black text-gray-800 text-sm">{g.nombre}</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">{g.cuatrimestre}° Cuatrimestre</p>
                    </div>
                    <button onClick={() => abrirEditar(g)} className="p-2 text-gray-300 hover:text-[#8BA888] transition-colors">
                      <Edit3 size={14} />
                    </button>
                  </div>
                ))}
                {grupos.length === 0 && (
                  <p className="text-[10px] text-gray-400 text-center py-4">Sin grupos aún</p>
                )}
              </div>
            </div>

            {/* ── Gráfica agrupada ── */}
            <div className="lg:col-span-9 bg-white rounded-[35px] p-8 border border-gray-50 shadow-sm relative">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Salud General del Grupo</h3>
                  <p className="text-[10px] text-gray-400">Haz clic en cualquier barra para ver los alumnos en ese nivel</p>
                </div>
                {/* Leyenda */}
                <div className="flex items-center gap-4">
                  {Object.entries(TIPO_COLORS).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full" style={{ background: val.bar }} />
                      <span className="text-[10px] font-bold text-gray-500">{val.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-[280px]">
                <Suspense fallback={
                  <div className="h-full flex items-center justify-center text-[10px] text-gray-400 tracking-widest font-black">
                    CARGANDO GRÁFICA...
                  </div>
                }>
                  <GraficaBarras data={dataGrafica} onBarClick={setPopupGrafica} />
                </Suspense>
              </div>

              {/* ── Popup al hacer clic en barra ── */}
              {popupGrafica && (
                <div className="absolute top-6 right-6 w-72 bg-gray-900 text-white rounded-[28px] shadow-2xl z-50 border border-white/10 overflow-hidden">
                  {/* Header del popup */}
                  <div
                    className="p-5 pb-4 flex justify-between items-start"
                    style={{ background: TIPO_COLORS[popupGrafica.tipo]?.bar + '22' }}
                  >
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest mb-1"
                        style={{ color: TIPO_COLORS[popupGrafica.tipo]?.bar }}>
                        {TIPO_COLORS[popupGrafica.tipo]?.label} · Nivel {popupGrafica.nivel}
                      </p>
                      <p className="text-2xl font-black">{alumnosEnPopup.length}
                        <span className="text-sm font-bold text-gray-400 ml-1">alumnos</span>
                      </p>
                    </div>
                    <button onClick={() => setPopupGrafica(null)} className="text-gray-500 hover:text-white mt-1 transition-colors">
                      <X size={14} />
                    </button>
                  </div>

                  {/* Lista de alumnos */}
                  <div className="p-4 max-h-56 overflow-y-auto space-y-2 scrollbar-thin">
                    {alumnosEnPopup.length === 0 ? (
                      <p className="text-[10px] text-gray-500 text-center py-4">Sin alumnos en este nivel</p>
                    ) : alumnosEnPopup.map(a => (
                      <div key={a.id} className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black"
                            style={{ background: TIPO_COLORS[popupGrafica.tipo]?.bar + '33', color: TIPO_COLORS[popupGrafica.tipo]?.bar }}>
                            {a.nombre?.[0]}
                          </div>
                          <div>
                            <p className="text-[11px] font-black leading-tight">{a.ape_p} {a.nombre}</p>
                            <p className="text-[9px] text-gray-500">{a.correo}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => { setAlumnoSeleccionado(a); setPopupGrafica(null) }}
                          className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                        >
                          <ChevronRight size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Tabla de alumnos ── */}
            <div className="lg:col-span-12 bg-white rounded-[40px] p-8 border border-gray-50 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4 mb-8 items-start md:items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-gray-800 tracking-tighter">Estudiantes</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Ordenados por nivel de riesgo · Críticos primero</p>
                </div>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
                    <input
                      value={busqueda}
                      onChange={e => setBusqueda(e.target.value)}
                      placeholder="Buscar alumno..."
                      className="pl-11 pr-5 py-3 bg-[#F9F9F7] rounded-2xl text-sm font-bold outline-none border border-transparent focus:border-[#8BA888]/30 transition-all w-56"
                    />
                  </div>
                  <select
                    value={riesgoFiltro}
                    onChange={e => setRiesgoFiltro(e.target.value)}
                    className="px-5 py-3 bg-[#F9F9F7] rounded-2xl text-[10px] font-black uppercase outline-none border-none cursor-pointer text-gray-600"
                  >
                    <option value="todos">Todos</option>
                    <option value="Crítico">Crítico</option>
                    <option value="Alto">Alto</option>
                    <option value="Moderado">Moderado</option>
                    <option value="Bajo">Bajo</option>
                  </select>
                </div>
              </div>

              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="pb-4 text-[9px] font-black text-gray-400 uppercase tracking-widest pl-2">Estudiante</th>
                    <th className="pb-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Riesgo</th>
                    <th className="pb-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Ansiedad</th>
                    <th className="pb-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Estrés</th>
                    <th className="pb-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Depresión</th>
                    <th className="pb-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {alumnosFiltrados.map(a => {
                    const s = NIVEL_STYLES[a.nivelGeneral]
                    const esCritico = a.nivelGeneral === 'Crítico'
                    return (
                      <tr key={a.id} className={`group transition-colors ${esCritico ? 'bg-red-50/40' : 'hover:bg-[#F9F9F7]/60'}`}>
                        <td className="py-4 pl-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${s.bg} ${s.text}`}>
                              {a.nombre?.[0]}
                            </div>
                            <div>
                              <p className="text-sm font-black text-gray-800 tracking-tight">{a.ape_p} {a.nombre}</p>
                              <p className="text-[9px] font-bold text-gray-400">{a.correo}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase ${s.bg} ${s.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                            {a.nivelGeneral}
                          </span>
                        </td>
                        {/* Mini badge por cuestionario */}
                        <td className="py-4 text-center">
                          <MiniNivel nivel={a.nivelAns} color="#F59E0B" />
                        </td>
                        <td className="py-4 text-center">
                          <MiniNivel nivel={a.nivelEst} color="#F87171" />
                        </td>
                        <td className="py-4 text-center">
                          <MiniNivel nivel={a.nivelDep} color="#818CF8" />
                        </td>
                        <td className="py-4 text-right pr-2">
                          <button
                            onClick={() => setAlumnoSeleccionado(a)}
                            className="p-2.5 hover:bg-white rounded-2xl border border-transparent hover:border-gray-100 hover:shadow-sm opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1.5 ml-auto"
                          >
                            <span className="text-[9px] font-black uppercase text-gray-400">Ver</span>
                            <ChevronRight size={14} className="text-gray-300" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                  {alumnosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[10px] text-gray-400 font-bold tracking-widest uppercase">
                        Sin alumnos encontrados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal Perfil ── */}
      {alumnoSeleccionado && (
        <PerfilModal alumno={alumnoSeleccionado} onClose={() => setAlumnoSeleccionado(null)} />
      )}

      {/* ── Modal CRUD Grupo ── */}
      {modal.open && (
        <div className="fixed inset-0 bg-[#1C2D6E]/20 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-[45px] p-10 w-full max-w-md shadow-2xl border border-white">
            <h2 className="text-2xl font-black text-gray-800 mb-8 tracking-tighter">
              {modal.mode === 'crear' ? 'Nuevo Grupo' : 'Editar Grupo'}
            </h2>
            <div className="space-y-6 mb-8">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Nombre del Grupo</label>
                <input
                  value={formGrupo.nombre}
                  onChange={e => setFormGrupo({ ...formGrupo, nombre: e.target.value })}
                  placeholder="Ej. 10°A"
                  className="w-full px-6 py-4 bg-[#F9F9F7] rounded-3xl font-bold outline-none focus:ring-2 focus:ring-[#E8EDDF] transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Carrera</label>
                  <select
                    value={formGrupo.carrera_id}
                    onChange={e => setFormGrupo({ ...formGrupo, carrera_id: e.target.value })}
                    className="w-full px-6 py-4 bg-[#F9F9F7] rounded-3xl font-bold outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Seleccionar...</option>
                    {carreras.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Cuatrimestre</label>
                  <input
                    type="number" min="1" max="11"
                    value={formGrupo.cuatrimestre}
                    onChange={e => setFormGrupo({ ...formGrupo, cuatrimestre: e.target.value })}
                    placeholder="1-11"
                    className="w-full px-6 py-4 bg-[#F9F9F7] rounded-3xl font-bold outline-none focus:ring-2 focus:ring-[#E8EDDF] transition-all"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setModal({ open: false })}
                className="flex-1 text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={guardarGrupo}
                disabled={saving}
                className="flex-1 py-4 bg-gray-800 hover:bg-[#8BA888] text-white rounded-[25px] font-black uppercase text-[10px] tracking-widest transition-all shadow-lg active:scale-95"
              >
                {saving ? 'Procesando...' : 'Guardar Grupo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sub-componente: badge pequeño por cuestionario ──────────
function MiniNivel({ nivel, color }) {
  const opacity = { Crítico: '1', Alto: '0.85', Moderado: '0.6', Bajo: '0.35' }[nivel] || '0.35'
  return (
    <span
      className="inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase text-white"
      style={{ background: color, opacity }}
    >
      {nivel}
    </span>
  )
}