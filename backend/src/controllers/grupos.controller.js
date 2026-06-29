import supabase from '../db/supabaseClient.js';

// Crear grupo
export const crearGrupo = async (req, res) => {
    try {
        const tutor_id = req.user.id;
        const { nombre, carrera_id, cuatrimestre } = req.body;

        // Validación estricta
        if (!nombre || !carrera_id || !cuatrimestre) {
            return res.status(400).json({
                error: 'Nombre, carrera_id y cuatrimestre son obligatorios'
            });
        }

        const { data, error } = await supabase
            .from('grupos')
            .insert([{ 
                nombre, 
                carrera_id: parseInt(carrera_id), 
                tutor_id, 
                cuatrimestre: parseInt(cuatrimestre) 
            }])
            .select();

        if (error) return res.status(400).json(error);

        res.json({
            message: 'Grupo creado exitosamente',
            grupo: data[0]
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Editar grupo
export const editarGrupo = async (req, res) => {
    try {
        const grupo_id = req.params.id;
        const tutor_id = req.user.id;
        const { nombre, carrera_id, cuatrimestre } = req.body;

        const updateData = {};
        if (nombre) updateData.nombre = nombre;
        if (carrera_id) updateData.carrera_id = parseInt(carrera_id);
        if (cuatrimestre) updateData.cuatrimestre = parseInt(cuatrimestre);

        const { data, error } = await supabase
            .from('grupos')
            .update(updateData)
            .eq('id', grupo_id)
            .eq('tutor_id', tutor_id) 
            .select();

        if (error) return res.status(400).json(error);

        res.json({
            message: 'Grupo actualizado',
            grupo: data[0]
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// Obtener todos los grupos
export const obtenerGrupos = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('grupos')
            .select(`
                id,
                nombre,
                carreras (
                    id,
                    nombre
                ),
                tutores (
                    id,
                    nombre
                )
            `);

        if (error) return res.status(400).json(error);

        res.json(data);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// Obtener grupos del tutor
export const obtenerMisGrupos = async (req, res) => {
    try {
        const tutor_id = req.user.id;

        const { data, error } = await supabase
            .from('grupos')
            .select(`
                id,
                nombre,
                estado,
                carreras (
                    nombre
                )
            `)
            .eq('tutor_id', tutor_id);

        if (error) return res.status(400).json(error);

        res.json(data);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



export const eliminarGrupo = async (req, res) => {
    try {
        const grupo_id = req.params.id;
        const tutor_id = req.user.id;

        const { error } = await supabase
            .from('grupos')
            .delete()
            .eq('id', grupo_id)
            .eq('tutor_id', tutor_id); 

        if (error) return res.status(400).json(error);

        res.json({
            message: 'Grupo eliminado'
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const cambiarEstadoGrupo = async (req, res) => {
    try {
        const grupo_id = req.params.id;
        const tutor_id = req.user.id;
        const { estado } = req.body;

        if (estado !== 'activo' && estado !== 'inactivo') {
            return res.status(400).json({ error: 'Estado inválido' });
        }

        const { data, error } = await supabase
            .from('grupos')
            .update({ estado })
            .eq('id', grupo_id)
            .eq('tutor_id', tutor_id)
            .select();

        if (error) return res.status(400).json(error);

        res.json({
            message: 'Estado del grupo actualizado',
            grupo: data[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};