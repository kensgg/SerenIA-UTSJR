import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Importación de Clientes y Configuraciones
import './db/supabaseClient.js'; 

// Importación de Rutas
import authRoutes from './routes/auth.routes.js';
import testRoutes from './routes/test.routes.js';
import respuestasRoutes from './routes/respuestas.routes.js';
import sugerenciasRouter from './routes/sugerencias.router.js';
import estadisticasRoutes from './routes/estadisticas.routes.js';
import tutoresRoutes from './routes/tutores.routes.js';
import gruposRoutes from './routes/grupos.routers.js';
import alumnosRoutes from './routes/alumnos.routes.js';
import publicoRoutes from './routes/publico.routes.js';
import adminRoutes from './routes/admin.routes.js';

// Cargar variables de entorno
dotenv.config();

const app = express();

// --- CONFIGURACIÓN DE CORS ---
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL ? process.env.FRONTEND_URL.trim().replace(/\/$/, '') : null
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Permitir si no hay origin (postman, etc) o si el origin coincide exactamente (ignorando slash final)
    if (!origin) return callback(null, true);
    
    const cleanOrigin = origin.trim().replace(/\/$/, '');
    if (allowedOrigins.includes(cleanOrigin)) {
      callback(null, true);
    } else {
      console.error(`Bloqueado por CORS: origin recibido -> ${origin}, permitidos ->`, allowedOrigins);
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    message: 'API SerenIA funcionando correctamente',
    version: '1.0.0'
  });
});

app.use('/auth', authRoutes);
app.use('/test', testRoutes);
app.use('/respuestas', respuestasRoutes);
app.use('/sugerencias', sugerenciasRouter);
app.use('/estadisticas', estadisticasRoutes);
app.use('/tutores', tutoresRoutes);
app.use('/grupos', gruposRoutes);
app.use('/alumnos', alumnosRoutes);
app.use('/publico', publicoRoutes);
app.use('/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor SerenIA activo en puerto ${PORT}`);
});