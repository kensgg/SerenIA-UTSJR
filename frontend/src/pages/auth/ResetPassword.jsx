import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Lock, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { resetPassword } from '../../api/auth.api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Si no hay token en la URL, redirigir
  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  // Countdown al éxito para redirigir al login
  useEffect(() => {
    if (!success) return;
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate('/login', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [success, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name] || errors.general) {
      setErrors(prev => ({ ...prev, [name]: null, general: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.password) {
      newErrors.password = 'Ingresa tu nueva contraseña';
    } else if (form.password.length < 8) {
      newErrors.password = 'Mínimo 8 caracteres';
    }
    if (!form.confirm) {
      newErrors.confirm = 'Confirma tu contraseña';
    } else if (form.password !== form.confirm) {
      newErrors.confirm = 'Las contraseñas no coinciden';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await resetPassword(token, form.password);
      setSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al restablecer la contraseña';
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (fieldName) => `
    w-full px-7 py-4 bg-[#F9F9F7] rounded-[22px] outline-none border transition-all text-sm font-bold
    ${errors[fieldName]
      ? 'border-rose-400 bg-rose-50/50 text-rose-900 placeholder:text-rose-300'
      : 'border-transparent focus:border-[#8BA888]/40 focus:bg-white text-gray-700 placeholder:text-gray-400'}
    disabled:opacity-50
  `;

  const InputError = ({ message }) => message ? (
    <span className="text-[10px] text-rose-500 font-bold ml-5 mt-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
      <AlertCircle size={10} /> {message}
    </span>
  ) : null;

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#F9F9F7] flex items-center justify-center overflow-hidden font-sans p-6">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#E8EDDF] rounded-full blur-[120px] opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#8BA888]/10 rounded-full blur-[120px] opacity-50" />

      <div className="relative z-10 w-full max-w-[480px] bg-white rounded-[45px] border border-gray-100 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.05)] p-10 md:p-14">

        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-5xl font-black tracking-tighter text-gray-800">
            Seren<span className="text-[#8BA888]">IA</span>
          </h1>
          <p className="text-[9px] font-black text-gray-500 tracking-[.3em] uppercase mt-3 italic">
            Universidad Tecnológica de San Juan del Río
          </p>
        </header>

        {!success ? (
          <>
            {/* Icon + Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-[#8BA888]/10 rounded-2xl mb-4">
                <Lock size={24} className="text-[#8BA888]" />
              </div>
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">
                Nueva Contraseña
              </h2>
              <p className="text-[11px] text-gray-400 font-semibold mt-2 leading-relaxed">
                Elige una contraseña segura de al menos 8 caracteres.
              </p>
            </div>

            {/* Error general (token inválido/expirado) */}
            {errors.general && (
              <div className="flex items-center justify-center gap-2 bg-rose-50 text-rose-600 text-[10px] font-black uppercase p-4 rounded-[20px] text-center tracking-widest border border-rose-100 mb-4 animate-in fade-in zoom-in-95 duration-300">
                <XCircle size={14} />
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Nueva contraseña */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] ml-5">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    id="new-password"
                    value={form.password}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Mínimo 8 caracteres"
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

              {/* Confirmar contraseña */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] ml-5">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    name="confirm"
                    id="confirm-password"
                    value={form.confirm}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Repite tu contraseña"
                    className={inputClass('confirm')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className={`absolute right-6 top-1/2 -translate-y-1/2 transition-colors ${errors.confirm ? 'text-rose-400' : 'text-gray-400 hover:text-[#8BA888]'}`}
                    tabIndex="-1"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <InputError message={errors.confirm} />
              </div>

              {/* Indicador de fortaleza */}
              {form.password.length > 0 && (
                <div className="ml-5 space-y-1">
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map(i => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          form.password.length >= i * 4
                            ? i === 1 ? 'bg-rose-400'
                            : i === 2 ? 'bg-amber-400'
                            : 'bg-[#8BA888]'
                            : 'bg-gray-100'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[9px] font-bold text-gray-400">
                    {form.password.length < 4 ? 'Muy débil'
                      : form.password.length < 8 ? 'Débil'
                      : form.password.length < 12 ? 'Aceptable'
                      : 'Fuerte'}
                  </p>
                </div>
              )}

              <button
                type="submit"
                id="btn-reset-submit"
                disabled={loading}
                className="w-full bg-[#8BA888] hover:bg-gray-800 text-white font-black py-5 rounded-[22px] shadow-lg shadow-[#8BA888]/20 transition-all duration-300 active:scale-95 disabled:opacity-50 mt-4 uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-2"
              >
                {loading ? 'Actualizando...' : 'Restablecer Contraseña'}
              </button>
            </form>
          </>
        ) : (
          /* Success State */
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#8BA888]/10 rounded-full mb-6">
              <CheckCircle2 size={32} className="text-[#8BA888]" />
            </div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight mb-3">
              ¡Contraseña actualizada!
            </h2>
            <p className="text-[12px] text-gray-500 font-semibold leading-relaxed mb-6">
              Tu contraseña ha sido restablecida correctamente.<br />
              Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
            <div className="bg-[#F9F9F7] rounded-[20px] border border-gray-100 p-4 mb-6">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Redirigiendo al inicio de sesión en
              </p>
              <p className="text-4xl font-black text-[#8BA888] mt-1">{countdown}</p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-[11px] font-black text-[#8BA888] hover:text-gray-800 transition-colors uppercase tracking-widest underline underline-offset-4"
            >
              <ArrowLeft size={12} /> Ir ahora al inicio de sesión
            </Link>
          </div>
        )}

        {!success && (
          <footer className="mt-8 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-[#8BA888] transition-colors uppercase tracking-widest"
            >
              <ArrowLeft size={12} /> Volver al inicio de sesión
            </Link>
          </footer>
        )}
      </div>
    </div>
  );
}
