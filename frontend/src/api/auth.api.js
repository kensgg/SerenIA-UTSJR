import axiosClient from './axiosClient'

export const loginAlumno = (data) => axiosClient.post('/auth/login', data)
export const registerAlumno = (data) => axiosClient.post('/auth/register', data)
export const loginTutor = (data) => axiosClient.post('/tutores/login', data)
export const getCarreras = () => axiosClient.get('/publico/carreras')
export const getGrupos = (carrera_id) => axiosClient.get(`/publico/grupos?carrera_id=${carrera_id}`)
