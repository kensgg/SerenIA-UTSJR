import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut, User, Fingerprint } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const initials = user?.nombre
    ? user.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-[#F9F9F7]/60 backdrop-blur-xl px-6 md:px-10 h-24 flex items-center justify-between sticky top-0 z-50">
      
      {/* Logo con el nuevo Verde Pastel */}
      <div 
        className="flex items-center gap-3 cursor-pointer group" 
        onClick={() => navigate('/dashboard')}
      >
        <div className="w-11 h-11 bg-[#E8EDDF] rounded-[18px] flex items-center justify-center border border-white shadow-sm transition-transform group-hover:scale-105">
          <div className="w-2.5 h-2.5 bg-[#8BA888] rounded-full" />
        </div>
        <div className="flex flex-col -space-y-1">
          <span className="text-xl font-black text-gray-800 tracking-tighter">
            Seren<span className="text-[#8BA888]">IA</span>
          </span>
          <span className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-600">
            Wellness
          </span>
        </div>
      </div>

      {/* Lado Derecho: Minimalismo y Suavidad */}
      <div className="flex items-center gap-8">
        
        {/* Perfil Mini - Estilo Pill */}
        <div className="flex items-center gap-4 py-2 px-2 pr-6 bg-white/50 rounded-full border border-white shadow-sm">
          {/* Avatar con iniciales */}
          <div className="w-10 h-10 rounded-full bg-[#8BA888] flex items-center justify-center text-[11px] font-black text-white shadow-inner">
            {initials}
          </div>
          
          <div className="text-left hidden sm:block">
            <p className="text-[11px] font-black text-[#8BA888] uppercase tracking-[0.2em] leading-none mb-1">
              {user?.rol || 'Estudiante'}
            </p>
            <p className="text-sm font-black text-gray-800 tracking-tight leading-none">
              {user?.nombre}
            </p>
          </div>
        </div>

        {/* Botón Salir - Más sutil */}
        <button
          onClick={handleLogout}
          className="p-3 rounded-2xl bg-white/40 border border-white/60 text-gray-600 hover:text-rose-500 hover:bg-rose-50 transition-all shadow-sm group"
          title="Cerrar Sesión"
        >
          <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </nav>
  )
}