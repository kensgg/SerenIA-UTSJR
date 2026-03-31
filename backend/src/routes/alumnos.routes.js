import express from 'express';
import {verifyToken} from '../middleware/auth.middleware.js';
import { actualizarPerfilAlumno, obtenerMiPerfil } from '../controllers/alumnos.controller.js';

const router = express.Router();

router.put('/perfil', verifyToken, actualizarPerfilAlumno);

router.get('/perfil', verifyToken, obtenerMiPerfil);


export default router;