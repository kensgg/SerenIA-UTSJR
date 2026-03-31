import { useState, useEffect } from 'react';
import { X, Save, GraduationCap, Users, UserCircle2, Loader2 } from 'lucide-react';
import { getGrupos, getCarreras } from '../api/auth.api'; // Reutilizamos tus funciones de auth.api

const GENEROS = [
  { label: 'Masculino', value: 'masculino' },
  { label: 'Femenino', value: 'femenino' },
  { label: 'Otro', value: 'otro' },
];

export default function EditarPerfilModal({ perfil, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    carrera: perfil?.carrera || '', // Nombre de la carrera si lo necesitas
    carrera_id: perfil?.carrera_id || '', // ID para filtrar grupos
    grupo_id: perfil?.grupo_id || '',
    genero: perfil?.genero || ''
  });

  const [carreras, setCarreras] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [loadingGrupos, setLoadingGrupos] = useState(false);
  const [saving, setSaving] = useState(false);

  // 1. Cargar Carreras al montar el modal
  useEffect(() => {
    getCarreras()
      .then(({ data }) => setCarreras(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  // 2. Cargar Grupos cuando cambie la carrera_id
  useEffect(() => {
    if (!formData.carrera_id) {
      setGrupos([]);
      return;
    }
    setLoadingGrupos(true);
    getGrupos(formData.carrera_id)
      .then(({ data }) => {
        setGrupos(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoadingGrupos(false));
  }, [formData.carrera_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Si cambia la carrera, reseteamos el grupo seleccionado
    if (name === 'carrera_id') {
      setFormData(prev => ({ ...prev, [name]: value, grupo_id: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Enviamos solo los campos que existen físicamente en la tabla de Supabase
      await onUpdate({
        carrera_id: Number(formData.carrera_id), // Enviamos el ID numérico
        grupo_id: formData.grupo_id,             // UUID del grupo
        genero: formData.genero
      });
      onClose();
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#1C2D6E]/20 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[45px] shadow-2xl w-full max-w-md overflow-hidden border border-white relative">
        <div className="p-10">
          
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-2xl font-black text-gray-800 tracking-tighter">Mi Perfil</h2>
              <p className="text-[10px] font-black text-[#8BA888] uppercase tracking-[0.3em] mt-1">Actualiza tu información</p>
            </div>
            <button onClick={onClose} className="p-2 text-gray-300 hover:text-rose-400 transition-colors">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Género */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[9px] font-black text-gray-300 uppercase tracking-widest ml-4">
                <UserCircle2 size={12} /> Género
              </label>
              <select 
                name="genero"
                value={formData.genero}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-[#F9F9F7] rounded-[22px] font-bold text-gray-600 outline-none border border-transparent focus:border-[#8BA888]/20 transition-all appearance-none cursor-pointer"
              >
                <option value="">Seleccionar Género</option>
                {GENEROS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>

            {/* Carrera */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[9px] font-black text-gray-300 uppercase tracking-widest ml-4">
                <GraduationCap size={12} /> Carrera
              </label>
              <select 
                name="carrera_id"
                value={formData.carrera_id}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-[#F9F9F7] rounded-[22px] font-bold text-gray-600 outline-none border border-transparent focus:border-[#8BA888]/20 transition-all appearance-none cursor-pointer"
              >
                <option value="">Selecciona tu Carrera</option>
                {carreras.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>

            {/* Grupo (Dinámico) */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[9px] font-black text-gray-300 uppercase tracking-widest ml-4">
                <Users size={12} /> Grupo
              </label>
              <div className="relative">
                <select 
                  name="grupo_id"
                  value={formData.grupo_id}
                  onChange={handleChange}
                  disabled={!formData.carrera_id || loadingGrupos}
                  className={`w-full px-6 py-4 rounded-[22px] font-bold outline-none transition-all appearance-none cursor-pointer border border-transparent
                    ${formData.carrera_id ? 'bg-[#E8EDDF] text-[#8BA888]' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
                >
                  <option value="">
                    {loadingGrupos ? 'Cargando grupos...' : !formData.carrera_id ? 'Primero elige carrera' : 'Selecciona tu Grupo'}
                  </option>
                  {grupos.map(g => <option key={g.id} value={g.id} className="text-gray-700 font-bold">{g.nombre}</option>)}
                </select>
                {loadingGrupos && (
                  <Loader2 size={16} className="absolute right-6 top-1/2 -translate-y-1/2 animate-spin text-[#8BA888]" />
                )}
              </div>
            </div>

            {/* Botón Guardar */}
            <button 
              type="submit"
              disabled={saving || !formData.grupo_id}
              className="w-full py-5 bg-gray-800 hover:bg-[#8BA888] text-white rounded-[25px] font-black uppercase text-[11px] tracking-[0.2em] transition-all shadow-lg shadow-gray-100 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed mt-4"
            >
              {saving ? 'Guardando cambios...' : <><Save size={18} /> Guardar Perfil</>}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}