import express from 'express';
import {verifyToken, isTutor} from '../middleware/auth.middleware.js';
import {registerTutor, loginTutor, obtenerAlumnosTutor, detalleAlumno, historialAlumno, obtenerGruposTutor, alumnosPorGrupo} from '../controllers/tutores.controller.js'

const router = express.Router();

router.post('/register', registerTutor);
router.post('/login', loginTutor);
router.get('/alumnos',verifyToken, isTutor, obtenerAlumnosTutor);
router.get('/alumnos/:id', verifyToken, isTutor, detalleAlumno);
router.get('/alumnos/:id/historial', verifyToken, isTutor, historialAlumno);
router.get('/grupos', verifyToken, isTutor, obtenerGruposTutor);
router.get('/grupos/:id/alumnos', verifyToken, isTutor, alumnosPorGrupo);

export default router;