import supabase from '../db/supabaseClient.js';

export const ultimasSugerencias = async (req, res) => {
    try {
        const alumno_id = req.user.id;

        const { data, error } = await supabase
            .from('sugerencias')
            .select(`
                sugerencia,
                fecha,
                cuestionarios (
                    nombre
                )
            `)
            .eq('alumno_id', alumno_id)
            .order('fecha', { ascending: false });

        if (error) {
            return res.status(400).json(error);
        }

        const ultimas = {};
        data.forEach(item => {
            const nombre = item.cuestionarios.nombre;
            if (!ultimas[nombre]) {
                ultimas[nombre] = item;
            }
        });

        res.json(Object.values(ultimas));

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};