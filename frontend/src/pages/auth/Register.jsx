import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerAlumno, getGrupos } from '../../api/auth.api';
import axiosClient from '../../api/axiosClient';
import { User, Mail, Lock, GraduationCap, Users, ArrowLeft } from 'lucide-react';

const GENEROS = [
  { label: 'Masculino', value: 'masculino' },
  { label: 'Femenino', value: 'femenino' },
  { label: 'Otro', value: 'otro' },
];

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: '', ape_p: '', ape_m: '',
    correo: '', password: '',
    genero: '', cuatrimestre: '',
    carrera_id: '', grupo_id: '',
  });

  const [carreras, setCarreras] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [loadingGrupos, setLoadingGrupos] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axiosClient.get('/publico/carreras')
      .then((res) => setCarreras(res.data))
      .catch(() => setError('Error al cargar carreras'));
  }, []);

  useEffect(() => {
    if (!form.carrera_id) { setGrupos([]); return; }
    setLoadingGrupos(true);
    getGrupos(form.carrera_id)
      .then(({ data }) => setGrupos(Array.isArray(data) ? data : []))
      .finally(() => setLoadingGrupos(false));
  }, [form.carrera_id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await registerAlumno(form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F9F9F7] flex items-center justify-center p-6 font-sans overflow-y-auto">
      
      {/* Fondo decorativo */}
      <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-[#E8EDDF] rounded-full blur-[100px] opacity-60 -z-10" />
      <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-[#8BA888]/10 rounded-full blur-[100px] opacity-60 -z-10" />

      <div className="w-full max-w-[640px] bg-white rounded-[45px] border border-gray-100 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.05)] p-10 md:p-14 relative my-10">
        
        {/* Botón Volver */}
        <Link to="/login" className="absolute top-10 left-10 text-gray-300 hover:text-[#8BA888] transition-colors">
          <ArrowLeft size={20} />
        </Link>

        <header className="text-center mb-12">
          <h1 className="text-4xl font-black tracking-tighter text-gray-800">
            Crear <span className="text-[#8BA888]">Cuenta</span>
          </h1>
          <p className="text-[10px] font-black text-[#8BA888] uppercase tracking-[0.3em] mt-3">
            Únete a la comunidad SerenIA • UTSJR
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Sección: Identidad */}
          <div className="space-y-3">
            <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-5">Información Personal</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { name: 'nombre', label: 'Nombre(s)' },
                { name: 'ape_p', label: 'Apellido P.' },
                { name: 'ape_m', label: 'Apellido M.' }
              ].map((field) => (
                <input
                  key={field.name}
                  type="text"
                  name={field.name}
                  placeholder={field.label}
                  onChange={handleChange}
                  required
                  className="w-full px-6 py-4 bg-[#F9F9F7] rounded-[22px] outline-none border border-transparent focus:border-[#8BA888]/20 focus:bg-white text-sm font-bold text-gray-600 transition-all placeholder:text-gray-300"
                />
              ))}
            </div>
          </div>

          {/* Sección: Credenciales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-5 text-center">Correo UTSJR</label>
              <input
                type="email"
                name="correo"
                placeholder="ejemplo@utsjr.edu.mx"
                onChange={handleChange}
                required
                className="w-full px-6 py-4 bg-[#F9F9F7] rounded-[22px] outline-none border border-transparent focus:border-[#8BA888]/20 focus:bg-white text-sm font-bold text-gray-600 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-5">Contraseña</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                onChange={handleChange}
                required
                className="w-full px-6 py-4 bg-[#F9F9F7] rounded-[22px] outline-none border border-transparent focus:border-[#8BA888]/20 focus:bg-white text-sm font-bold text-gray-600 transition-all"
              />
            </div>
          </div>

          {/* Sección: Datos Académicos */}
          <div className="space-y-3 pt-2">
            <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-5 text-center block">Trayectoria Académica</label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select name="genero" onChange={handleChange} required className="w-full px-6 py-4 bg-[#F9F9F7] rounded-[22px] outline-none text-sm font-bold text-gray-500 appearance-none cursor-pointer border border-transparent focus:border-[#8BA888]/20">
                <option value="">Género</option>
                {GENEROS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>

              <select name="cuatrimestre" onChange={handleChange} required className="w-full px-6 py-4 bg-[#F9F9F7] rounded-[22px] outline-none text-sm font-bold text-gray-500 appearance-none cursor-pointer border border-transparent focus:border-[#8BA888]/20">
                <option value="">Cuatrimestre</option>
                {[1,2,3,4,5,6,7,8,9,10,11].map(n => <option key={n} value={n}>{n}° Cuatrimestre</option>)}
              </select>
            </div>

            <select name="carrera_id" onChange={handleChange} required className="w-full px-6 py-4 bg-[#F9F9F7] rounded-[22px] outline-none text-sm font-bold text-gray-500 appearance-none cursor-pointer border border-transparent focus:border-[#8BA888]/20">
              <option value="">Selecciona tu Carrera</option>
              {carreras.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>

            {/* Grupo con estilo resaltado si hay carrera seleccionada */}
            {form.carrera_id && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <select 
                  name="grupo_id" 
                  onChange={handleChange} 
                  required 
                  className="w-full px-6 py-4 bg-[#E8EDDF] rounded-[22px] outline-none text-[#8BA888] font-black text-sm appearance-none cursor-pointer border border-[#8BA888]/10"
                >
                  <option value="">{loadingGrupos ? 'Buscando grupos...' : 'Selecciona tu Grupo'}</option>
                  {grupos.map(g => <option key={g.id} value={g.id} className="text-gray-700 font-bold">{g.nombre}</option>)}
                </select>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-400 text-[10px] font-black uppercase p-4 rounded-[20px] text-center tracking-widest">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-800 hover:bg-[#8BA888] text-white font-black py-5 rounded-[25px] shadow-xl shadow-gray-200 transition-all duration-300 active:scale-95 disabled:opacity-50 mt-4 uppercase tracking-[0.2em] text-[11px]"
          >
            {loading ? 'Procesando...' : 'Finalizar Registro'}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
            ¿Ya eres parte? <Link to="/login" className="text-[#8BA888] hover:underline underline-offset-4 ml-1">Inicia Sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}