import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginAlumno, loginTutor } from '../../api/auth.api';
import { jwtDecode } from 'jwt-decode';
import { Eye, EyeOff, User, ShieldCheck } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [isTutorMode, setIsTutorMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ correo: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Admin y Tutor comparten el mismo endpoint en el backend
      const fn = isTutorMode ? loginTutor : loginAlumno;
      const { data } = await fn(form);
      
      const decoded = jwtDecode(data.token);
      login(data.token, { id: decoded.id, rol: decoded.rol, correo: decoded.correo });

      // Lógica de redirección corregida
      if (decoded.rol === 'admin') {
        navigate('/admin');
      } else if (decoded.rol === 'tutor') {
        navigate('/tutor/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#F9F9F7] flex items-center justify-center overflow-hidden font-sans p-6">
      
      {/* Elemento decorativo orgánico de fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#E8EDDF] rounded-full blur-[120px] opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#8BA888]/10 rounded-full blur-[120px] opacity-50" />

      <div className="relative z-10 w-full max-w-[480px] bg-white rounded-[45px] border border-gray-100 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.05)] p-10 md:p-14">
        
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black tracking-tighter text-gray-800">
            Seren<span className="text-[#8BA888]">IA</span>
          </h1>
          <p className="text-[9px] font-black text-[#8BA888] tracking-[.3em] uppercase mt-3">
            Universidad Tecnológica de San Juan del Río
          </p>
        </div>

        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F9F9F7] border border-gray-50 mb-4">
             {isTutorMode ? <ShieldCheck size={12} className="text-[#8BA888]"/> : <User size={12} className="text-[#8BA888]"/>}
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
               {isTutorMode ? 'Acceso Staff / Admin' : 'Acceso Estudiantil'}
             </span>
          </div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">
            {isTutorMode ? 'Portal de Gestión' : 'Hola de nuevo'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] ml-5">Correo Institucional</label>
            <input
              type="email"
              name="correo"
              value={form.correo}
              onChange={handleChange}
              required
              placeholder="usuario@utsjr.edu.mx"
              className="w-full px-7 py-4 bg-[#F9F9F7] rounded-[22px] outline-none border border-transparent focus:border-[#8BA888]/20 focus:bg-white text-sm font-bold text-gray-600 transition-all placeholder:text-gray-300"
            />
          </div>

          <div className="space-y-1 relative">
            <label className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] ml-5">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full px-7 py-4 bg-[#F9F9F7] rounded-[22px] outline-none border border-transparent focus:border-[#8BA888]/20 focus:bg-white text-sm font-bold text-gray-600 transition-all placeholder:text-gray-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#8BA888] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-400 text-[10px] font-black uppercase p-4 rounded-[20px] text-center tracking-widest animate-shake">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8BA888] hover:bg-gray-800 text-white font-black py-5 rounded-[22px] shadow-lg shadow-[#8BA888]/20 transition-all duration-300 active:scale-95 disabled:opacity-50 mt-4 uppercase tracking-[0.2em] text-[11px]"
          >
            {loading ? 'Verificando...' : 'Entrar al Sistema'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/register" className="text-[10px] font-black text-gray-300 hover:text-[#8BA888] transition-colors uppercase tracking-widest">
            ¿No tienes cuenta? <span className="underline underline-offset-4">Regístrate</span>
          </Link>
        </div>
      </div>

      {/* Switch Flotante: Cambio de Modo */}
      <button
        onClick={() => { setIsTutorMode(!isTutorMode); setError(''); }}
        className={`fixed bottom-10 right-10 flex items-center gap-3 px-6 py-4 rounded-[24px] shadow-2xl transition-all duration-500 active:scale-90 group z-[100] border border-white ${
          isTutorMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
        }`}
      >
        <div className={`p-2 rounded-xl ${isTutorMode ? 'bg-[#8BA888]' : 'bg-[#F9F9F7]'}`}>
          {isTutorMode ? <User size={18} /> : <ShieldCheck size={18} />}
        </div>
        <div className="text-left">
          <p className="text-[8px] font-black uppercase tracking-widest opacity-50 leading-none">Cambiar a</p>
          <p className="text-[10px] font-black uppercase tracking-tighter">
            {isTutorMode ? 'Modo Alumno' : 'Modo Staff / Admin'}
          </p>
        </div>
      </button>

    </div>
  );
}