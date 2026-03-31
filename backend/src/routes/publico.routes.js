import { Router } from 'express'
import { obtenerCarreras, obtenerGruposPublico } from '../controllers/publico_controller.js'

const router = Router()

router.get('/carreras', obtenerCarreras)
router.get('/grupos', obtenerGruposPublico)

export default router