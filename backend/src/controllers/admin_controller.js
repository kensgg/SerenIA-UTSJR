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
            .select('id, genero, carrera_id, grupo_id');
        if (errA) return res.status(400).json(errA);

        const { data: tutores, error: errT } = await supabase
            .from('tutores')
            .select('id')
            .eq('rol', 'tutor');
        if (errT) return res.status(400).json(errT);

        const { data: grupos, error: errG } = await supabase
            .from('grupos')
            .select('id, nombre');
        if (errG) return res.status(400).json(errG);

        const { data: carreras, error: errC } = await supabase
            .from('carreras')
            .select('id, siglas');
        if (errC) return res.status(400).json(errC);

        const { data: respuestas, error: errR } = await supabase
            .from('respuestas')
            .select('puntaje, fecha_respuesta, cuestionarios(id, nombre), alumnos(genero, carrera_id, grupo_id)');
        if (errR) return res.status(400).json(errR);

        // 1. Totales Básicos
        const total_alumnos = alumnos.length;
        const total_tutores = tutores.length;
        const total_grupos = grupos.length;

        // 2. Distribución por Género
        const generoCount = { Masculino: 0, Femenino: 0, Otro: 0, 'No Especificado': 0 };
        alumnos.forEach(a => {
            const g = a.genero?.toLowerCase() || '';
            if (g === 'masculino' || g === 'm') generoCount.Masculino++;
            else if (g === 'femenino' || g === 'f') generoCount.Femenino++;
            else if (g) generoCount.Otro++;
            else generoCount['No Especificado']++;
        });

        // 3. Distribución por Carrera
        const alumnosPorCarrera = {};
        carreras.forEach(c => alumnosPorCarrera[c.siglas] = 0);
        alumnosPorCarrera['S/C'] = 0;

        alumnos.forEach(a => {
            if (a.carrera_id) {
                const c = carreras.find(car => car.id === a.carrera_id);
                if (c) alumnosPorCarrera[c.siglas]++;
                else alumnosPorCarrera['S/C']++;
            } else {
                alumnosPorCarrera['S/C']++;
            }
        });

        // 4. Emociones y Timeline
        const emocionesData = {
            ansiedad: { bajo: 0, moderado: 0, alto: 0 },
            estres: { bajo: 0, moderado: 0, alto: 0 },
            depresion: { bajo: 0, moderado: 0, alto: 0 }
        };

        const respuestasPorSemana = {};

        respuestas.forEach(r => {
            // Emociones
            const nombre = r.cuestionarios?.nombre?.toLowerCase() || '';
            // Máximo según cuestionario: estrés=42, ansiedad/depresión=63
            const max = (r.cuestionarios?.id === 1 || nombre.includes('estr')) ? 42 : 63;
            const porcentaje = (r.puntaje / max) * 100;

            let nivel = 'bajo';
            if (porcentaje >= 50) nivel = 'alto'; 
            else if (porcentaje >= 25) nivel = 'moderado';

            if (nombre.includes('ansiedad')) emocionesData.ansiedad[nivel]++;
            if (nombre.includes('estres') || nombre.includes('estr')) emocionesData.estres[nivel]++;
            if (nombre.includes('depresion') || nombre.includes('depresi')) emocionesData.depresion[nivel]++;

            // Timeline
            if (r.fecha_respuesta) {
                const d = new Date(r.fecha_respuesta);
                // Agrupar por inicio de semana (Lunes)
                const day = d.getDay() || 7; // Convertir domingo (0) a 7
                d.setHours(-24 * (day - 1)); // Retroceder al Lunes
                const weekKey = d.toISOString().split('T')[0];
                respuestasPorSemana[weekKey] = (respuestasPorSemana[weekKey] || 0) + 1;
            }
        });

        const sortedWeeks = Object.keys(respuestasPorSemana).sort();
        const timeline = {
            labels: sortedWeeks,
            data: sortedWeeks.map(w => respuestasPorSemana[w])
        };

        res.json({
            total_alumnos,
            total_tutores,
            total_grupos,
            genero: generoCount,
            alumnos_por_carrera: alumnosPorCarrera,
            emociones: emocionesData,
            timeline: timeline
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}