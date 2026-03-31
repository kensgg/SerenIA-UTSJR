import { Router } from 'express'
import { verifyToken } from '../middleware/auth.middleware.js'
import { isAdmin } from '../middleware/isAdmin.js'
import {
    listarTutores, crearTutor, editarTutor, desactivarTutor, reactivarTutor,
    listarTodosGrupos, reasignarGrupo,
    listarCarreras, crearCarrera, editarCarrera,
    estadisticasGenerales
} from '../controllers/admin_controller.js'

const router = Router()

router.use(verifyToken, isAdmin)

// Tutores
router.get('/tutores',              listarTutores)
router.post('/tutores',             crearTutor)
router.put('/tutores/:id',          editarTutor)
router.patch('/tutores/:id/desactivar', desactivarTutor)
router.patch('/tutores/:id/reactivar',  reactivarTutor)

// Grupos
router.get('/grupos',               listarTodosGrupos)
router.put('/grupos/:id/reasignar', reasignarGrupo)

// Carreras
router.get('/carreras',             listarCarreras)
router.post('/carreras',            crearCarrera)
router.put('/carreras/:id',         editarCarrera)

// Estadísticas
router.get('/estadisticas',         estadisticasGenerales)

export default router