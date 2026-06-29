import axiosClient from './axiosClient'

export const getMisGrupos       = ()     => axiosClient.get('/tutores/grupos')
export const getMisAlumnos      = (params) => axiosClient.get('/tutores/alumnos', { params })
export const getDetalleAlumno   = (id)   => axiosClient.get(`/tutores/alumnos/${id}`)
export const getHistorialAlumno = (id)   => axiosClient.get(`/tutores/alumnos/${id}/historial`)
export const crearGrupo         = (data) => axiosClient.post('/grupos', data)
export const editarGrupo        = (id, data) => axiosClient.put(`/grupos/${id}`, data)
export const cambiarEstadoGrupo = (id, estado) => axiosClient.patch(`/grupos/${id}/estado`, { estado })
export const eliminarGrupo      = (id)   => axiosClient.delete(`/grupos/${id}`)