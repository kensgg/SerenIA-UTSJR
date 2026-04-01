import supabase from '../db/supabaseClient.js'
import bcrypt from 'bcrypt'


export const listarTutores = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('tutores')
            .select('id, nombre, correo, rol, created_at')
            .order('nombre')

        if (error) return res.status(400).json(error)
        res.json(data)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const crearTutor = async (req, res) => {
    try {
        const { nombre, correo, password } = req.body

        if (!nombre || !correo || !password)
            return res.status(400).json({ error: 'nombre, correo y password son requeridos' })

        const password_hash = await bcrypt.hash(password, 10)

        const { data, error } = await supabase
            .from('tutores')
            .insert([{ nombre, correo, password_hash, rol: 'tutor' }])
            .select('id, nombre, correo, rol, created_at')
            .single()

        if (error) return res.status(400).json(error)
        res.json(data)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const editarTutor = async (req, res) => {
    try {
        const tutor_id = req.params.id
        const { nombre, correo, password } = req.body

        const updateData = {}
        if (nombre)  updateData.nombre = nombre
        if (correo)  updateData.correo = correo
        if (password) updateData.password_hash = await bcrypt.hash(password, 10)

        if (Object.keys(updateData).length === 0)
            return res.status(400).json({ error: 'No se enviaron campos para actualizar' })

        const { data, error } = await supabase
            .from('tutores')
            .update(updateData)
            .eq('id', tutor_id)
            .select('id, nombre, correo, rol, created_at')
            .single()

        if (error) return res.status(400).json(error)
        res.json(data)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const desactivarTutor = async (req, res) => {
    try {
        const tutor_id = req.params.id

        if (tutor_id === req.user.id)
            return res.status(400).json({ error: 'No puedes desactivarte a ti mismo' })

        const { data: tutor } = await supabase
            .from('tutores')
            .select('rol')
            .eq('id', tutor_id)
            .single()

        if (tutor?.rol === 'admin')
            return res.status(400).json({ error: 'No puedes desactivar a otro admin' })

        const { data, error } = await supabase
            .from('tutores')
            .update({ rol: 'inactivo' })
            .eq('id', tutor_id)
            .select('id, nombre, correo, rol')
            .single()

        if (error) return res.status(400).json(error)
        res.json(data)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const reactivarTutor = async (req, res) => {
    try {
        const tutor_id = req.params.id

        const { data, error } = await supabase
            .from('tutores')
            .update({ rol: 'tutor' })
            .eq('id', tutor_id)
            .select('id, nombre, correo, rol')
            .single()

        if (error) return res.status(400).json(error)
        res.json(data)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

// ── Grupos ───────────────────────────────────────────

export const listarTodosGrupos = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('grupos')
            .select(`
                id,
                nombre,
                cuatrimestre,
                tutor_id,
                tutores ( id, nombre, correo ),
                carreras ( id, nombre, siglas )
            `)
            .order('nombre')

        if (error) return res.status(400).json(error)
        res.json(data)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const reasignarGrupo = async (req, res) => {
    try {
        const grupo_id = req.params.id
        const { tutor_id } = req.body

        if (!tutor_id)
            return res.status(400).json({ error: 'tutor_id es requerido' })

        const { data, error } = await supabase
            .from('grupos')
            .update({ tutor_id })
            .eq('id', grupo_id)
            .select()
            .single()

        if (error) return res.status(400).json(error)
        res.json(data)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

// ── Carreras ─────────────────────────────────────────

export const listarCarreras = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('carreras')
            .select('id, nombre, siglas, activo')
            .order('nombre')

        if (error) return res.status(400).json(error)
        res.json(data)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const crearCarrera = async (req, res) => {
    try {
        const { nombre, siglas } = req.body

        if (!nombre || !siglas)
            return res.status(400).json({ error: 'nombre y siglas son requeridos' })

        const { data, error } = await supabase
            .from('carreras')
            .insert([{ nombre, siglas, activo: true }])
            .select()
            .single()

        if (error) return res.status(400).json(error)
        res.json(data)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const editarCarrera = async (req, res) => {
    try {
        const carrera_id = req.params.id
        const { nombre, siglas } = req.body

        const updateData = {}
        if (nombre) updateData.nombre = nombre
        if (siglas) updateData.siglas = siglas

        const { data, error } = await supabase
            .from('carreras')
            .update(updateData)
            .eq('id', carrera_id)
            .select()
            .single()

        if (error) return res.status(400).json(error)
        res.json(data)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const estadisticasGenerales = async (req, res) => {
    try {
        const { data: alumnos, error: errA } = await supabase
            .from('alumnos')
            .select('id')
        if (errA) return res.status(400).json(errA)

        const { data: tutores, error: errT } = await supabase
            .from('tutores')
            .select('id')
            .eq('rol', 'tutor')
        if (errT) return res.status(400).json(errT)

        const { data: grupos, error: errG } = await supabase
            .from('grupos')
            .select('id')
        if (errG) return res.status(400).json(errG)

        const { data: respuestas, error: errR } = await supabase
            .from('respuestas')
            .select('puntaje, cuestionarios(nombre)')
        if (errR) return res.status(400).json(errR)

        let ansiedad = [], estres = [], depresion = []
        respuestas.forEach(r => {
            const nombre = r.cuestionarios?.nombre?.toLowerCase() ?? ''
            if (nombre.includes('ansiedad')) ansiedad.push(r.puntaje)
            if (nombre.includes('estres'))   estres.push(r.puntaje)
            if (nombre.includes('depresion')) depresion.push(r.puntaje)
        })

        const prom = arr => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0

        res.json({
            total_alumnos:  alumnos.length,
            total_tutores:  tutores.length,
            total_grupos:   grupos.length,
            promedio_ansiedad:  prom(ansiedad),
            promedio_estres:    prom(estres),
            promedio_depresion: prom(depresion),
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}