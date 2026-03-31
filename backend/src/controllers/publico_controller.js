import supabase from '../db/supabaseClient.js'

export const obtenerCarreras = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('carreras')
            .select('id, nombre, siglas')
            .order('nombre')

        if (error) return res.status(400).json(error)
        res.json(data)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export const obtenerGruposPublico = async (req, res) => {
    try {
        const { carrera_id } = req.query  // filtrar por carrera seleccionada

        let query = supabase
            .from('grupos')
            .select('id, nombre, carrera_id')
            .order('nombre')

        if (carrera_id) query = query.eq('carrera_id', carrera_id)

        const { data, error } = await query
        if (error) return res.status(400).json(error)
        res.json(data)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}