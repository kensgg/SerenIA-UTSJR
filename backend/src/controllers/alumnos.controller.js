import supabase from '../db/supabaseClient.js';

export const actualizarPerfilAlumno = async (req, res) => {
    try {
        const alumno_id = req.user.id;
        const { grupo_id, genero, carrera_id } = req.body; // Cambiado carrera por carrera_id

        const updateData = {};

        if (grupo_id) updateData.grupo_id = grupo_id;
        if (genero) updateData.genero = genero;
        if (carrera_id) updateData.carrera_id = parseInt(carrera_id); // Usamos carrera_id

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'No hay datos para actualizar' });
        }

        const { data, error } = await supabase
            .from('alumnos')
            .update(updateData)
            .eq('id', alumno_id)
            .select(`
                id,
                nombre,
                genero,
                carrera_id,
                grupos ( id, nombre )
            `)
            .single();

        if (error) return res.status(400).json(error);

        res.json({ message: 'Perfil actualizado', alumno: data });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



export const obtenerMiPerfil = async (req, res) => {
    try {
        const alumno_id = req.user.id;

        const { data, error } = await supabase
            .from('alumnos')
            .select(`
                id,
                nombre,
                ape_p,
                ape_m,
                correo,
                genero,
                cuatrimestre,
                grupos (
                    id,
                    nombre
                ),
                carreras (
                    id,
                    nombre
                )
            `)
            .eq('id', alumno_id)
            .single();

        if (error) return res.status(400).json(error);

        res.json(data);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};