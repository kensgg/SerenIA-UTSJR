import supabase from '../db/supabaseClient.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const registerTutor = async(req,res) =>{
    try{
        const {nombre, correo, password} = req.body;
        const password_hash = await bcrypt.hash(password,10);

        const {data, error} = await supabase
            .from('tutores')
            .insert([{nombre, correo, password_hash}])
            .select()
            .single();

        if (error) return res.status(400).json(error);
        res.json(data);
    } catch (err){
        res.status(500).json({ error : err.message});
    }
};

export const loginTutor = async (req,res) =>{
    try{
        const {correo, password} = req.body;

        const {data, error} = await supabase
            .from('tutores')
            .select('*')
            .eq('correo', correo)
            .single();

        if (error) return res.status(400).json({ error : 'Tutor no encontrado'});

        const valid = await bcrypt.compare(password, data.password_hash);
        if(!valid) return res.status(400).json({ error : 'Password incorrecto'});
        
        const token = jwt.sign(
            { id: data.id, rol: data.rol },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );
        res.json({token});
    } catch(err) {
        res.status(500).json({error : err.message})
    }
};

export const obtenerAlumnosTutor = async (req, res) => {
    try {
        const tutor_id = req.user.id;
        const grupo_id = req.query.grupo_id;

        let query = supabase
            .from('alumnos')
            .select(`
                id, nombre, ape_p, ape_m, correo, genero,
                grupos!inner(id, nombre, tutor_id, estado),
                carreras(nombre),
                respuestas(
                    puntaje,
                    fecha_respuesta,
                    cuestionarios(nombre)
                ),
                sugerencias(
                    sugerencia,
                    cuestionarios(nombre)
                )
            `)
            .eq('grupos.tutor_id', tutor_id);

        if (grupo_id) {
            query = query.eq('grupos.id', grupo_id);
        }

        const { data, error } = await query;

        if (error) return res.status(400).json(error);

        const procesados = data.map(alumno => {
            const resps = alumno.respuestas || [];
            
            // Obtenemos los últimos puntajes individuales para las estadísticas rápidas
            const getUltimoPuntaje = (key) => {
                const filt = resps.filter(r => r.cuestionarios?.nombre?.toLowerCase().includes(key));
                return filt.length ? filt[filt.length - 1].puntaje : 0;
            };

            return {
                ...alumno,
                ans: getUltimoPuntaje('ansiedad'),
                est: getUltimoPuntaje('estr'),
                dep: getUltimoPuntaje('depresi'),
                estadisticas: {
                    ansiedad: getUltimoPuntaje('ansiedad'),
                    estres: getUltimoPuntaje('estr'),
                    depresion: getUltimoPuntaje('depresi')
                },
                carrera_nombre: alumno.carreras?.nombre || 'No especificada',
                // Enviamos el historial completo para la gráfica
                historial_respuestas: resps.sort((a, b) => new Date(a.fecha_respuesta) - new Date(b.fecha_respuesta)),
                sugerencias_detalle: alumno.sugerencias?.map(s => ({
                    tipo: s.cuestionarios?.nombre || 'General',
                    texto: s.sugerencia
                })) || []
            };
        });

        res.json({ data: procesados });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



export const detalleAlumno = async (req, res) => {
    try {
        const alumno_id = req.params.id;
        const tutor_id = req.user.id;

        const { data: alumno, error: errAlumno } = await supabase
            .from('alumnos')
            .select(`
                *,
                grupos!inner(nombre, tutor_id),
                carreras(nombre),
                sugerencias(
                    sugerencia,
                    cuestionarios(nombre)
                )
            `)
            .eq('id', alumno_id)
            .eq('grupos.tutor_id', tutor_id)
            .single();

        if (errAlumno || !alumno) return res.status(403).json({ error: 'No tienes acceso' });

        const { data: respuestas } = await supabase
            .from('respuestas')
            .select(`puntaje, cuestionarios(nombre)`)
            .eq('alumno_id', alumno_id);

        const obtenerUltimo = (tipo) => {
            if (!respuestas) return 0;
            const f = respuestas.filter(r => r.cuestionarios?.nombre?.toLowerCase().includes(tipo));
            return f.length ? f[f.length - 1].puntaje : 0;
        }

        const promAns = obtenerUltimo('ansiedad');
        const promDep = obtenerUltimo('depresi');
        const promEst = obtenerUltimo('estr');

        res.json({
            alumno: {
                ...alumno,
                carrera_nombre: alumno.carreras?.nombre || 'No especificada'
            },
            estadisticas: { ansiedad: promAns, depresion: promDep, estres: promEst },
            sugerencias: alumno.sugerencias?.map(s => ({
                tipo: s.cuestionarios?.nombre || 'General',
                texto: s.sugerencia
            })) || []
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const historialAlumno = async (req, res) => {
    try {
        const alumno_id = req.params.id;
        const tutor_id = req.user.id;

        const { data: alumno, error: errAlumno } = await supabase
            .from('alumnos')
            .select(`id, grupos!inner(tutor_id)`)
            .eq('id', alumno_id)
            .eq('grupos.tutor_id', tutor_id)
            .single();

        if (errAlumno || !alumno) return res.status(403).json({ error: 'Acceso denegado' });

        const { data, error } = await supabase
            .from('respuestas')
            .select(`puntaje, fecha_respuesta, cuestionarios(nombre)`)
            .eq('alumno_id', alumno_id)
            .order('fecha_respuesta', { ascending: true });

        if (error) return res.status(400).json(error);

        const historial = { ansiedad: [], depresion: [], estres: [] };

        data.forEach(r => {
            const nombre = r.cuestionarios?.nombre?.toLowerCase() || "";
            const item = { fecha: r.fecha_respuesta, puntaje: r.puntaje };

            if(nombre.includes('ansiedad')) historial.ansiedad.push(item);
            if(nombre.includes('depresi'))  historial.depresion.push(item);
            if(nombre.includes('estr'))     historial.estres.push(item);
        });

        res.json(historial);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const obtenerGruposTutor = async (req, res) => {
    try {
        const tutor_id = req.user.id;
        const { data, error } = await supabase
            .from('grupos')
            .select('*')
            .eq('tutor_id', tutor_id);

        if (error) return res.status(400).json(error);
        res.json({ data: data }); // Consistente con el formato de alumnos
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const alumnosPorGrupo = async (req, res) => {
    try {
        const grupo_id = req.params.id;
        const tutor_id = req.user.id;

        const { data: grupo, error: errGrupo } = await supabase
            .from('grupos')
            .select('tutor_id')
            .eq('id', grupo_id)
            .single();

        if (errGrupo || !grupo || grupo.tutor_id !== tutor_id) {
            return res.status(403).json({ error: 'No tienes acceso a este grupo' });
        }

        const { data, error } = await supabase
            .from('alumnos')
            .select('id, nombre, ape_p, ape_m, correo')
            .eq('grupo_id', grupo_id);

        if (error) return res.status(400).json(error);
        res.json({ data: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};