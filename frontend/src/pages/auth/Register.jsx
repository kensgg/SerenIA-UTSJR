import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerAlumno, getGrupos } from '../../api/auth.api';
import axiosClient from '../../api/axiosClient';
import { ArrowLeft, AlertCircle } from 'lucide-react';

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

  const [errors, setErrors] = useState({});
  const [carreras, setCarreras] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [loadingGrupos, setLoadingGrupos] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    axiosClient.get('/publico/carreras')
      .then((res) => { if (isMounted) setCarreras(res.data); })
      .catch(() => setErrors({ general: 'Servicio no disponible' }));
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!form.carrera_id) { setGrupos([]); return; }
    setLoadingGrupos(true);
    getGrupos(form.carrera_id)
      .then(({ data }) => setGrupos(Array.isArray(data) ? data : []))
      .finally(() => setLoadingGrupos(false));
  }, [form.carrera_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;

    if (['nombre', 'ape_p', 'ape_m'].includes(name)) {
      val = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, '');
    }

    setForm(prev => ({ 
      ...prev, 
      [name]: name === 'correo' ? val.trim().toLowerCase() : val 
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]{3,}(?:\s[a-zA-ZáéíóúÁÉÍÓÚñÑ]{2,})*$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@utsjr\.edu\.mx$/;
    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!nameRegex.test(form.nombre.trim())) newErrors.nombre = 'Mínimo 3 letras';
    if (!nameRegex.test(form.ape_p.trim())) newErrors.ape_p = 'Apellido requerido';
    if (!nameRegex.test(form.ape_m.trim())) newErrors.ape_m = 'Apellido requerido';
    
    if (!emailRegex.test(form.correo)) newErrors.correo = 'Use @utsjr.edu.mx';
    
    if (form.password.length < 8) {
      newErrors.password = 'Mínimo 8 caracteres';
    } else if (!passRegex.test(form.password)) {
      newErrors.password = 'Falta Mayús., Minús. o Número';
    }

    if (!form.genero) newErrors.genero = 'Requerido';
    if (!form.cuatrimestre) newErrors.cuatrimestre = 'Requerido';
    if (!form.carrera_id) newErrors.carrera_id = 'Requerido';
    if (!form.grupo_id) newErrors.grupo_id = 'Requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!validateForm()) return;

    setLoading(true);
    try {
      await registerAlumno({
        ...form,
        nombre: form.nombre.trim(),
        ape_p: form.ape_p.trim(),
        ape_m: form.ape_m.trim()
      });
      navigate('/login');
    } catch (err) {
      setErrors({ general: err.response?.data?.error || 'Error al registrar' });
    } finally {
      setLoading(false);
    }
  };

  const InputError = ({ message }) => message ? (
    <span className="text-[10px] text-rose-500 font-bold ml-4 mt-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
      <AlertCircle size={10} /> {message}
    </span>
  ) : null;

  const inputClass = (fieldName) => `
    w-full px-6 py-4 bg-[#F9F9F7] rounded-[22px] outline-none border transition-all text-sm font-bold
    ${errors[fieldName] ? 'border-rose-400 bg-rose-50/30 text-rose-900 placeholder:text-rose-300' : 'border-transparent focus:border-[#8BA888]/20 focus:bg-white text-gray-600 placeholder:text-gray-300'}
  `;

  return (
    <div className="min-h-screen w-full bg-[#F9F9F7] flex items-center justify-center p-6 font-sans overflow-y-auto">
      <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-[#E8EDDF] rounded-full blur-[100px] opacity-60 -z-10" />
      <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-[#8BA888]/10 rounded-full blur-[100px] opacity-60 -z-10" />

      <div className="w-full max-w-[640px] bg-white rounded-[45px] border border-gray-100 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.05)] p-10 md:p-14 relative my-10">
        
        <Link to="/login" className="absolute top-10 left-10 text-gray-300 hover:text-[#8BA888] transition-colors">
          <ArrowLeft size={20} />
        </Link>

        <header className="text-center mb-12">
          <h1 className="text-4xl font-black tracking-tighter text-gray-800">
            Crear <span className="text-[#8BA888]">Cuenta</span>
          </h1>
          <p className="text-[10px] font-black text-[#8BA888] uppercase tracking-[0.3em] mt-3">
            Comunidad SerenIA • UTSJR
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="space-y-3">
            <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-5">Información Personal</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <input type="text" name="nombre" placeholder="Nombre(s)" value={form.nombre} onChange={handleChange} className={inputClass('nombre')} />
                <InputError message={errors.nombre} />
              </div>
              <div>
                <input type="text" name="ape_p" placeholder="Apellido P." value={form.ape_p} onChange={handleChange} className={inputClass('ape_p')} />
                <InputError message={errors.ape_p} />
              </div>
              <div>
                <input type="text" name="ape_m" placeholder="Apellido M." value={form.ape_m} onChange={handleChange} className={inputClass('ape_m')} />
                <InputError message={errors.ape_m} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-5">Correo UTSJR</label>
              <input type="email" name="correo" value={form.correo} placeholder="ejemplo@utsjr.edu.mx" onChange={handleChange} className={inputClass('correo')} />
              <InputError message={errors.correo} />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-5">Contraseña</label>
              <input type="password" name="password" value={form.password} placeholder="••••••••" onChange={handleChange} className={inputClass('password')} />
              <InputError message={errors.password} />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-5 text-center block">Datos Académicos</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <select name="genero" value={form.genero} onChange={handleChange} className={inputClass('genero')}>
                  <option value="">Género</option>
                  {GENEROS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
                <InputError message={errors.genero} />
              </div>
              <div>
                <select name="cuatrimestre" value={form.cuatrimestre} onChange={handleChange} className={inputClass('cuatrimestre')}>
                  <option value="">Cuatrimestre</option>
                  {[1,2,3,4,5,6,7,8,9,10,11].map(n => <option key={n} value={n}>{n}° Cuatrimestre</option>)}
                </select>
                <InputError message={errors.cuatrimestre} />
              </div>
            </div>
            <div>
              <select name="carrera_id" value={form.carrera_id} onChange={handleChange} className={inputClass('carrera_id')}>
                <option value="">Selecciona tu Carrera</option>
                {carreras.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
              <InputError message={errors.carrera_id} />
            </div>
            {form.carrera_id && (
              <div>
                <select name="grupo_id" value={form.grupo_id} onChange={handleChange} className="w-full px-6 py-4 bg-[#E8EDDF] rounded-[22px] outline-none text-[#8BA888] font-black text-sm border border-[#8BA888]/10 cursor-pointer">
                  <option value="">{loadingGrupos ? 'Buscando grupos...' : 'Selecciona tu Grupo'}</option>
                  {grupos.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                </select>
                <InputError message={errors.grupo_id} />
              </div>
            )}
          </div>

          {errors.general && (
            <div className="bg-rose-50 text-rose-500 text-[10px] font-black uppercase p-4 rounded-[20px] text-center border border-rose-100">
              {errors.general}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-800 hover:bg-[#8BA888] text-white font-black py-5 rounded-[25px] shadow-xl transition-all duration-300 active:scale-95 disabled:opacity-50 mt-4 uppercase tracking-[0.2em] text-[11px]"
          >
            {loading ? 'Creando cuenta...' : 'Finalizar Registro'}
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