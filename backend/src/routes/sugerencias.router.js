import express from 'express';
import {verifyToken} from '../middleware/auth.middleware.js';
import {ultimasSugerencias} from '../controllers/sugerencias.controller.js'

const router = express.Router();

router.get('/ultimas', verifyToken, ultimasSugerencias);

export default router;