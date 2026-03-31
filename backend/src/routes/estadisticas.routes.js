import express from 'express';
import {verifyToken} from '../middleware/auth.middleware.js';
import {obtenerEstadisticas} from '../controllers/estadisticas.controller.js';

const router = express.Router();

router.get('/',verifyToken,obtenerEstadisticas);

export default router;