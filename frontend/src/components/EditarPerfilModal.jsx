import { useState, useEffect } from 'react';
import { X, Save, GraduationCap, Users, UserCircle2, Loader2, AlertCircle } from 'lucide-react';
import { getGrupos, getCarreras } from '../api/auth.api';

const GENEROS = [
  { label: 'Masculino', value: 'masculino' },
  { label: 'Femenino', value: 'femenino' },
  { label: 'Otro', value: 'otro' },
];

export default function EditarPerfilModal({ perfil, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    carrera_id: perfil?.carrera_id || '',
    grupo_id: perfil?.grupo_id || '',
    genero: perfil?.genero || ''
  });

  const [carreras, setCarreras] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [loadingGrupos, setLoadingGrupos] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    getCarreras()
      .then(({ data }) => { if (isMounted) setCarreras(Array.isArray(data) ? data : []); })
      .catch(() => setError('Error al cargar catálogo de carreras'));
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!formData.carrera_id) {
      setGrupos([]);
      return;
    }
    setLoadingGrupos(true);
    getGrupos(formData.carrera_id)
      .then(({ data }) => setGrupos(Array.isArray(data) ? data : []))
      .catch(() => setError('No se pudieron obtener los grupos'))
      .finally(() => setLoadingGrupos(false));
  }, [formData.carrera_id]);

  const hasChanges = () => {
    return (
      formData.carrera_id !== (perfil?.carrera_id || '') ||
      formData.grupo_id !== (perfil?.grupo_id || '') ||
      formData.genero !== (perfil?.genero || '')
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError('');
    
    if (name === 'carrera_id') {
      setFormData(prev => ({ ...prev, [name]: value, grupo_id: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!hasChanges()) {
      setError('No hay cambios nuevos para guardar');
      return;
    }

    if (!formData.grupo_id || !formData.genero) {
      setError('Favor de completar los campos requeridos');
      return;
    }

    setSaving(true);
    try {
      await onUpdate({
        carrera_id: Number(formData.carrera_id),
        grupo_id: formData.grupo_id,
        genero: formData.genero
      });
      onClose();
    } catch (err) {
      setError('Error al actualizar el servidor');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#1C2D6E]/20 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[45px] shadow-2xl w-full max-w-md overflow-hidden border border-white relative animate-in zoom-in-95 duration-300">
        <div className="p-10">
          
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-2xl font-black text-gray-800 tracking-tighter">Mi Perfil</h2>
              <p className="text-[12px] font-black text-[#8BA888] uppercase tracking-[0.3em] mt-1">Actualiza tu información</p>
            </div>
            <button onClick={onClose} className="p-2 text-gray-300 hover:text-rose-400 transition-colors">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[11px] font-black text-gray-300 uppercase tracking-widest ml-4">
                <UserCircle2 size={12} /> Género
              </label>
              <select 
                name="genero"
                value={formData.genero}
                onChange={handleChange}
                className={`w-full px-6 py-4 bg-[#F9F9F7] rounded-[22px] font-bold text-gray-600 outline-none border transition-all appearance-none cursor-pointer ${error && !formData.genero ? 'border-rose-300' : 'border-transparent focus:border-[#8BA888]/20'}`}
              >
                <option value="">Seleccionar Género</option>
                {GENEROS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[11px] font-black text-gray-300 uppercase tracking-widest ml-4">
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

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[11px] font-black text-gray-300 uppercase tracking-widest ml-4">
                <Users size={12} /> Grupo
              </label>
              <div className="relative">
                <select 
                  name="grupo_id"
                  value={formData.grupo_id}
                  onChange={handleChange}
                  disabled={!formData.carrera_id || loadingGrupos}
                  className={`w-full px-6 py-4 rounded-[22px] font-bold outline-none transition-all appearance-none cursor-pointer border
                    ${formData.carrera_id ? 'bg-[#E8EDDF] text-[#8BA888] border-transparent' : 'bg-gray-100 text-gray-300 cursor-not-allowed border-transparent'}
                    ${error && !formData.grupo_id && formData.carrera_id ? 'border-rose-300' : ''}`}
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

            {error && (
              <div className="bg-rose-50 text-rose-500 text-[12px] font-black uppercase p-4 rounded-[20px] text-center border border-rose-100 flex items-center justify-center gap-2 animate-in slide-in-from-top-1">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={saving || !hasChanges()}
              className="w-full py-5 bg-gray-800 hover:bg-[#8BA888] text-white rounded-[25px] font-black uppercase text-[11px] tracking-[0.2em] transition-all shadow-lg shadow-gray-100 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed mt-4"
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <><Save size={18} /> {hasChanges() ? 'Guardar Cambios' : 'Sin cambios'}</>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}