import { X, User, Mail, GraduationCap, Activity, Sparkles } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

// Diccionario de estilos basado estrictamente en la emoción
const ESTILOS_PSICO = {
  'Ansiedad': { border: 'border-amber-200', bg: 'bg-amber-50', text: 'text-amber-700' },
  'Estrés': { border: 'border-rose-200', bg: 'bg-rose-50', text: 'text-rose-700' },
  'Depresión': { border: 'border-indigo-200', bg: 'bg-indigo-50', text: 'text-indigo-700' },
  'General': { border: 'border-gray-200', bg: 'bg-gray-50', text: 'text-gray-700' }
};

export default function AlumnoDetalleModal({ alumno, onClose }) {
  if (!alumno) return null;

  // 1. Procesar Historial para la Gráfica
  const historial = alumno.historial_respuestas || [];
  const fechas = [...new Set(historial.map(r => new Date(r.fecha_respuesta).toLocaleDateString()))].sort((a, b) => new Date(a) - new Date(b));

  const obtenerPuntos = (busqueda) => {
    return fechas.map(fecha => {
      const registro = historial.find(r => 
        new Date(r.fecha_respuesta).toLocaleDateString() === fecha && 
        r.cuestionarios?.nombre.toLowerCase().includes(busqueda)
      );
      return registro ? registro.puntaje : null;
    });
  };

  const data = {
    labels: fechas,
    datasets: [
      {
        label: 'Ansiedad',
        data: obtenerPuntos('ansiedad'),
        borderColor: '#D97706',
        backgroundColor: 'rgba(217, 119, 6, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
      },
      {
        label: 'Estrés',
        data: obtenerPuntos('estr'),
        borderColor: '#DC2626',
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
      },
      {
        label: 'Depresión',
        data: obtenerPuntos('depres'),
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: { font: { size: 10, weight: '700' }, usePointStyle: true }
      },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      y: { beginAtZero: true, max: 65, grid: { color: '#F1F5F9' }, ticks: { font: { size: 10 } } },
      x: { grid: { display: false }, ticks: { font: { size: 10 } } }
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#1C2D6E]/30 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[45px] shadow-2xl w-full max-w-5xl overflow-hidden border border-white flex flex-col md:flex-row h-[90vh]">
        
        {/* Sidebar: Perfil */}
        <div className="w-full md:w-80 bg-[#F9F9F7] p-8 flex flex-col border-r border-gray-100 shrink-0">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 bg-white rounded-[30px] shadow-sm flex items-center justify-center text-[#8BA888] mb-4 border border-gray-100">
              <User size={40} />
            </div>
            <h2 className="text-xl font-black text-gray-800 leading-tight">
              {alumno.nombre} <br/> {alumno.ape_p} {alumno.ape_m}
            </h2>
          </div>

          <div className="space-y-4">
            <InfoItem icon={<Mail size={14}/>} label="Correo" value={alumno.correo} />
            <InfoItem icon={<GraduationCap size={14}/>} label="Carrera" value={alumno.carrera_nombre} />
            <InfoItem icon={<Activity size={14}/>} label="Género" value={alumno.genero} />
          </div>
        </div>

        {/* Dashboard de Contenido */}
        <div className="flex-1 p-8 md:p-12 relative overflow-y-auto bg-white">
          <button onClick={onClose} className="absolute top-6 right-6 text-gray-300 hover:text-rose-500 transition-colors z-10">
            <X size={24} />
          </button>

          {/* Gráfica de Evolución */}
          <div className="mb-12">
            <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
              <Activity size={14} /> Historial de Evaluación
            </h3>
            <div className="h-[280px] w-full">
              <Line data={data} options={options} />
            </div>
          </div>

          {/* Sección de Sugerencias con Colores Dinámicos */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 ml-1">
              <Sparkles size={14} className="text-[#8BA888]" />
              <h3 className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Recomendaciones SerenIA</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alumno.sugerencias_detalle && alumno.sugerencias_detalle.length > 0 ? (
                alumno.sugerencias_detalle.map((s, i) => {
                  // Lógica para detectar qué estilo aplicar según el tipo
                  const tipoLower = s.tipo.toLowerCase();
                  let estiloKey = 'General';
                  if (tipoLower.includes('ansiedad')) estiloKey = 'Ansiedad';
                  else if (tipoLower.includes('estr')) estiloKey = 'Estrés';
                  else if (tipoLower.includes('depres')) estiloKey = 'Depresión';
                  
                  const estilo = ESTILOS_PSICO[estiloKey];

                  return (
                    <div key={i} className={`${estilo.bg} ${estilo.border} border p-6 rounded-[30px] transition-all hover:shadow-md`}>
                      <div className="flex justify-between items-center mb-3">
                        <p className={`text-[9px] font-black uppercase tracking-widest ${estilo.text}`}>
                          {s.tipo}
                        </p>
                        <Sparkles size={12} className={estilo.text} />
                      </div>
                      <p className="text-xs font-bold text-gray-700 leading-relaxed italic">
                        "{s.texto}"
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full p-10 text-center border-2 border-dashed border-gray-100 rounded-[40px]">
                  <p className="text-sm italic text-gray-400">No hay sugerencias procesadas para este estudiante.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 text-[#8BA888] opacity-40">{icon}</div>
      <div className="min-w-0">
        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-xs font-bold text-gray-600 truncate">{value || '---'}</p>
      </div>
    </div>
  );
}