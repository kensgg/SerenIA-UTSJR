import supabase from '../db/supabaseClient.js';

export const obtenerEstadisticas = async (req,res) =>{
    try {
        const alumno_id = req.user.id;

        const {data, error} = await supabase
            .from('respuestas')
            .select(`
                puntaje,
                cuestionarios(
                    nombre
                )`)
            .eq('alumno_id', alumno_id);

        if (error){
            return res.status(400).json(error);
        }

        let ansiedad = [];
        let depresion = [];
        let estres = [];

        data.forEach(r => {
            const nombre = r.cuestionarios.nombre.toLowerCase();

            if(nombre.includes('ansiedad')) ansiedad.push(r.puntaje);
            if(nombre.includes('depresi'))  depresion.push(r.puntaje);
            if(nombre.includes('estr'))     estres.push(r.puntaje);
        });

        const promedio = arr =>
            arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

        const ansiedad_prom = promedio(ansiedad);
        const depresion_prom = promedio(depresion);
        const estres_prom = promedio(estres);

        const general = (ansiedad_prom + depresion_prom + estres_prom) / 3;

        let nivel = 'Bajo';
        if (general > 70) nivel = 'Alto';
        else if (general > 40) nivel = 'Moderado';

        res.json({
            ansiedad_promedio: ansiedad_prom,
            depresion_promedio: depresion_prom,
            estres_promedio: estres_prom,
            nivel_general: nivel
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}