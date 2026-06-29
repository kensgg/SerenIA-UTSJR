import express from 'express';
import {verifyToken, isTutor} from '../middleware/auth.middleware.js';

import {
    crearGrupo,
    obtenerGrupos,
    obtenerMisGrupos,
    editarGrupo,
    eliminarGrupo,
    cambiarEstadoGrupo
} from '../controllers/grupos.controller.js';

const router = express.Router();

router.get('/', verifyToken, obtenerGrupos);
router.get('/mis-grupos', verifyToken, isTutor, obtenerMisGrupos);

router.post('/', verifyToken, isTutor, crearGrupo);
router.put('/:id', verifyToken, isTutor, editarGrupo);
router.patch('/:id/estado', verifyToken, isTutor, cambiarEstadoGrupo);
router.delete('/:id', verifyToken, isTutor, eliminarGrupo);

export default router;