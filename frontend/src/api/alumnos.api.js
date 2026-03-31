import axiosClient from './axiosClient'

// Obtener datos del perfil del alumno logueado
export const getMiPerfil = () => axiosClient.get('/alumnos/perfil')

// Obtener los promedios/últimos puntajes para las cards
export const getEstadisticas = () => axiosClient.get('/estadisticas')

// Obtener las 3 sugerencias únicas (una por cada test)
export const getUltimasSugerencias = () => axiosClient.get('/sugerencias/ultimas')

// Obtener la lista de todos los tests realizados (para la gráfica)
export const getHistorial = () => axiosClient.get('/respuestas/historial')

/**
 * Guarda el resultado de un cuestionario
 * @param {number} cuestionario_id - El ID (1=Estres, 2=Ansiedad, 3=Depresion)
 * @param {number} puntaje - El puntaje total calculado en el Modal
 */
export const submitCuestionario = (cuestionario_id, puntaje) =>
  axiosClient.post('/respuestas', { cuestionario_id, puntaje }) 

export const updateMiPerfil = (datos) => axiosClient.put('/alumnos/perfil', datos);