import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { guardarRespuesta, historialRespuestas } from '../controllers/respuestas.controller.js';

const router = express.Router();

router.post('/', verifyToken, guardarRespuesta);

router.get('/historial', verifyToken, historialRespuestas);

export default router;