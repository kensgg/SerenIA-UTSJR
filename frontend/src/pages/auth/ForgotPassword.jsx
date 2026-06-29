import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { forgotPassword } from '../../api/auth.api';

export default function ForgotPassword() {
  const [correo, setCorreo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const emailRegex = /^[a-zA-Z0-9._%+-]+@utsjr\.edu\.mx$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!correo.trim()) {
      setError('El correo es obligatorio');
      return;
    }
    if (!emailRegex.test(correo.trim())) {
      setError('Usa tu correo institucional @utsjr.edu.mx');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(correo.trim().toLowerCase());
      setSent(true);
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

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
          <p className="text-[11px] font-black text-gray-500 tracking-[.3em] uppercase mt-3 italic">
            Universidad Tecnológica de San Juan del Río
          </p>
        </header>

        {!sent ? (
          <>
            {/* Icon + Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-[#8BA888]/10 rounded-2xl mb-4">
                <Mail size={24} className="text-[#8BA888]" />
              </div>
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">
                ¿Olvidaste tu contraseña?
              </h2>
              <p className="text-[11px] text-gray-600 font-semibold mt-2 leading-relaxed">
                Escribe tu correo institucional y te enviaremos<br />un enlace para restablecerla.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-1">
                <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] ml-5">
                  Correo Institucional
                </label>
                <input
                  type="email"
                  id="correo-forgot"
                  value={correo}
                  onChange={(e) => {
                    setCorreo(e.target.value);
                    setError('');
                  }}
                  disabled={loading}
                  placeholder="usuario@utsjr.edu.mx"
                  className={`w-full px-7 py-4 bg-[#F9F9F7] rounded-[22px] outline-none border transition-all text-sm font-bold
                    ${error
                      ? 'border-rose-400 bg-rose-50/50 text-rose-900 placeholder:text-rose-300'
                      : 'border-transparent focus:border-[#8BA888]/40 focus:bg-white text-gray-700 placeholder:text-gray-600'}
                    disabled:opacity-50`}
                />
                {error && (
                  <span className="text-[12px] text-rose-500 font-bold ml-5 mt-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                    <AlertCircle size={10} /> {error}
                  </span>
                )}
              </div>

              <button
                type="submit"
                id="btn-send-reset"
                disabled={loading}
                className="w-full bg-[#8BA888] hover:bg-gray-800 text-white font-black py-5 rounded-[22px] shadow-lg shadow-[#8BA888]/20 transition-all duration-300 active:scale-95 disabled:opacity-50 mt-4 uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-2"
              >
                {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
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
              ¡Correo enviado!
            </h2>
            <p className="text-[12px] text-gray-500 font-semibold leading-relaxed mb-2">
              Si ese correo está registrado, recibirás un enlace de recuperación en los próximos minutos.
            </p>
            <p className="text-[11px] text-gray-600 font-semibold leading-relaxed">
              Recuerda revisar tu bandeja de spam.<br />El enlace expira en <strong className="text-gray-600">15 minutos</strong>.
            </p>

            <div className="mt-8 p-4 bg-[#F9F9F7] rounded-[20px] border border-gray-100">
              <p className="text-[12px] font-black text-gray-600 uppercase tracking-widest">
                ¿No recibiste nada?
              </p>
              <button
                onClick={() => { setSent(false); setCorreo(''); }}
                className="text-[11px] font-black text-[#8BA888] hover:text-gray-800 transition-colors mt-1 underline underline-offset-4"
              >
                Volver a intentarlo
              </button>
            </div>
          </div>
        )}

        {/* Footer link */}
        <footer className="mt-8 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-[12px] font-black text-gray-600 hover:text-[#8BA888] transition-colors uppercase tracking-widest"
          >
            <ArrowLeft size={12} /> Volver al inicio de sesión
          </Link>
        </footer>
      </div>
    </div>
  );
}
