import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginAlumno, loginTutor } from '../../api/auth.api';
import { jwtDecode } from 'jwt-decode';
import { Eye, EyeOff, User, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [isTutorMode, setIsTutorMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ correo: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (attempts >= 5) {
      setIsLocked(true);
      setErrors({ general: 'Demasiados intentos. Espere 30 segundos.' });
      const timer = setTimeout(() => {
        setAttempts(0);
        setIsLocked(false);
        setErrors({});
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [attempts]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'correo' ? value.trim() : value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null, general: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[a-zA-Z0-9._%+-]+@utsjr\.edu\.mx$/;

    if (!form.correo) {
      newErrors.correo = 'El correo es obligatorio';
    } else if (!emailRegex.test(form.correo)) {
      newErrors.correo = 'Use @utsjr.edu.mx';
    }

    if (!form.password) {
      newErrors.password = 'Ingrese su contraseña';
    } else if (form.password.length < 8) {
      newErrors.password = 'Mínimo 8 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || isLocked) return;

    if (!validateForm()) return;

    setLoading(true);
    try {
      const authFn = isTutorMode ? loginTutor : loginAlumno;
      const { data } = await authFn({
        correo: form.correo.toLowerCase(),
        password: form.password
      });
      
      const decoded = jwtDecode(data.token);
      login(data.token, { id: decoded.id, rol: decoded.rol, correo: decoded.correo });

      const routes = { admin: '/admin', tutor: '/tutor/dashboard', alumno: '/dashboard' };
      navigate(routes[decoded.rol] || '/dashboard');
    } catch (err) {
      setAttempts(prev => prev + 1);
      const status = err.response?.status;
      setErrors({ 
        general: status === 401 || status === 404 
          ? 'Correo o contraseña incorrectos' 
          : 'Error de conexión con el servidor' 
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (fieldName) => `
    w-full px-7 py-4 bg-[#F9F9F7] rounded-[22px] outline-none border transition-all text-sm font-bold
    ${errors[fieldName] 
      ? 'border-rose-400 bg-rose-50/30 text-rose-900 placeholder:text-rose-300' 
      : 'border-transparent focus:border-[#8BA888]/40 focus:bg-white text-gray-700 placeholder:text-gray-400'}
  `;

  const InputError = ({ message }) => message ? (
    <span className="text-[10px] text-rose-500 font-bold ml-5 mt-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
      <AlertCircle size={10} /> {message}
    </span>
  ) : null;

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#F9F9F7] flex items-center justify-center overflow-hidden font-sans p-6">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#E8EDDF] rounded-full blur-[120px] opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#8BA888]/10 rounded-full blur-[120px] opacity-50" />

      <div className="relative z-10 w-full max-w-[480px] bg-white rounded-[45px] border border-gray-100 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.05)] p-10 md:p-14">
        <header className="text-center mb-10">
          <h1 className="text-5xl font-black tracking-tighter text-gray-800">
            Seren<span className="text-[#8BA888]">IA</span>
          </h1>
          <p className="text-[9px] font-black text-gray-500 tracking-[.3em] uppercase mt-3 italic">
            Universidad Tecnológica de San Juan del Río
          </p>
        </header>

        <div className="mb-8 text-center">
          <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full border-2 mb-4 transition-colors duration-300 ${
            isTutorMode ? 'bg-gray-800 border-gray-800 text-white' : 'bg-[#8BA888]/10 border-[#8BA888] text-[#8BA888]'
          }`}>
             {isTutorMode ? <ShieldCheck size={14}/> : <User size={14}/>}
             <span className="text-[11px] font-black uppercase tracking-[.15em]">
               {isTutorMode ? 'Portal de Gestión' : 'Acceso Estudiantil'}
             </span>
          </div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">
            {isTutorMode ? 'Personal Administrativo' : 'Bienvenido de nuevo'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1">
            <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] ml-5">Correo Institucional</label>
            <input
              type="email"
              name="correo"
              value={form.correo}
              onChange={handleChange}
              disabled={isLocked}
              required
              placeholder="usuario@utsjr.edu.mx"
              className={inputClass('correo')}
            />
            <InputError message={errors.correo} />
          </div>

          <div className="space-y-1 relative">
            <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] ml-5">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                disabled={isLocked}
                required
                placeholder="••••••••"
                className={inputClass('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-6 top-1/2 -translate-y-1/2 transition-colors ${errors.password ? 'text-rose-400' : 'text-gray-400 hover:text-[#8BA888]'}`}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <InputError message={errors.password} />
          </div>

          {errors.general && (
            <div className="flex items-center justify-center gap-2 bg-rose-50 text-rose-600 text-[10px] font-black uppercase p-4 rounded-[20px] text-center tracking-widest border border-rose-100 animate-in fade-in zoom-in-95 duration-300">
              <AlertCircle size={14} />
              {errors.general}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || isLocked}
            className="w-full bg-[#8BA888] hover:bg-gray-800 text-white font-black py-5 rounded-[22px] shadow-lg shadow-[#8BA888]/20 transition-all duration-300 active:scale-95 disabled:opacity-50 mt-4 uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-2"
          >
            {loading ? 'Verificando...' : isLocked ? 'Bloqueado' : 'Entrar al Sistema'}
            {!loading && !isLocked && <ArrowRight size={14} />}
          </button>
        </form>

        <footer className="mt-8 text-center min-h-[20px]">
          {!isTutorMode ? (
            <Link to="/register" className="text-[10px] font-black text-gray-500 hover:text-[#8BA888] transition-colors uppercase tracking-widest">
              ¿No tienes cuenta? <span className="underline underline-offset-4 text-gray-700 hover:text-[#8BA888]">Regístrate</span>
            </Link>
          ) : (
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Acceso restringido
            </p>
          )}
        </footer>
      </div>

      <button
        onClick={() => { 
          setIsTutorMode(!isTutorMode); 
          setErrors({}); 
          setForm({ correo: '', password: '' }); 
        }}
        className={`fixed bottom-6 right-6 md:bottom-10 md:right-10 flex items-center justify-center gap-3 p-4 md:px-6 md:py-4 rounded-full md:rounded-[24px] shadow-2xl transition-all duration-500 active:scale-90 z-[100] border border-white/50 backdrop-blur-sm ${
          isTutorMode ? 'bg-[#8BA888] text-white' : 'bg-white text-gray-800'
        }`}
      >
        <div className={`p-2 rounded-xl ${isTutorMode ? 'bg-white/20' : 'bg-[#F9F9F7]'}`}>
          {isTutorMode ? <User size={20} /> : <ShieldCheck size={20} />}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-[11px] font-black uppercase tracking-tighter">
            {isTutorMode ? 'Cambiar a Alumnos' : 'Acceso Tutores'}
          </p>
        </div>
      </button>
    </div>
  );
}