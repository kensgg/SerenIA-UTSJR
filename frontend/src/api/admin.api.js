import axiosClient from './axiosClient'

// Tutores
export const getTutores        = ()          => axiosClient.get('/admin/tutores')
export const crearTutor        = (data)      => axiosClient.post('/admin/tutores', data)
export const editarTutor       = (id, data)  => axiosClient.put(`/admin/tutores/${id}`, data)
export const desactivarTutor   = (id)        => axiosClient.patch(`/admin/tutores/${id}/desactivar`)
export const reactivarTutor    = (id)        => axiosClient.patch(`/admin/tutores/${id}/reactivar`)

// Grupos
export const getTodosGrupos    = ()          => axiosClient.get('/admin/grupos')
export const reasignarGrupo    = (id, data)  => axiosClient.put(`/admin/grupos/${id}/reasignar`, data)

// Carreras
export const getCarrerasAdmin  = ()          => axiosClient.get('/admin/carreras')
export const crearCarrera      = (data)      => axiosClient.post('/admin/carreras', data)
export const editarCarrera     = (id, data)  => axiosClient.put(`/admin/carreras/${id}`, data)

// Estadísticas
export const getEstadisticasAdmin = (filters = {}) => axiosClient.get('/admin/estadisticas', { params: filters })