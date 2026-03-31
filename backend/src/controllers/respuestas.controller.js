import supabase from '../db/supabaseClient.js';
import Groq from "groq-sdk";

// Inicializamos Groq con la API Key del .env
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const guardarRespuesta = async (req, res) => {
    try {
        const alumno_id = req.user.id;
        const { cuestionario_id, puntaje } = req.body;

        // 1. Guardar en el Historial
        const { error: errResp } = await supabase
            .from('respuestas')
            .insert([{ alumno_id, cuestionario_id, puntaje }]);

        if (errResp) return res.status(400).json(errResp);

        // 2. Configuración de Cuestionarios
        const nombresCuestionarios = { 1: "Estrés", 2: "Ansiedad", 3: "Depresión" };
        const sugerenciasBase = {
            1: { bajo: "Tus niveles de estrés son saludables. Mantén tus rutinas.", moderado: "Estrés moderado. Prueba la técnica Pomodoro." },
            2: { bajo: "Te encuentras en calma. Sigue así.", moderado: "Ansiedad leve. Reduce la cafeína y haz ejercicio." },
            3: { bajo: "Estado estable. Sigue socializando.", moderado: "Desánimo leve. Intenta retomar un hobby hoy." }
        };

        // 3. Cálculo de Nivel
        const max = (cuestionario_id === 1) ? 42 : 63;
        const porcentaje = (puntaje / max) * 100;
        
        let nivel = 'bajo';
        if (porcentaje >= 75) nivel = 'critico';
        else if (porcentaje >= 50) nivel = 'alto';
        else if (porcentaje >= 25) nivel = 'moderado';

        let textoSugerencia = "";

        // 4. Lógica de IA con GROQ (Niveles Alto y Crítico)
        if (nivel === 'alto' || nivel === 'critico') {
            try {
                const prompt = `Actúa como un psicólogo clínico cálido y humano. 
                Un estudiante tiene un nivel ${nivel.toUpperCase()} de ${nombresCuestionarios[cuestionario_id]} (${puntaje}/${max} puntos).
                
                Escribe un párrafo breve (máximo 280 caracteres) que incluya:
                1. Una frase de validación empática.
                2. Sugiere 2 actividades prácticas (como respiración diafragmática o técnica 5-4-3-2-1).
                3. Cierra diciendo: "${nivel === 'critico' ? 'Es urgente que acudas hoy mismo a orientación psicopedagógica.' : 'Te sugiero platicar con tu tutor pronto.'}"
                
                IMPORTANTE: No uses negritas, ni asteriscos (*), ni listas de puntos. Solo texto fluido.`;
                const completion = await groq.chat.completions.create({
                    messages: [{ role: "user", content: prompt }],
                    // Cambia el anterior por uno de estos:
                    model: "llama-3.3-70b-versatile", // Es el más inteligente actualmente
                    // O si prefieres uno más ligero y rápido:
                    // model: "llama-3.1-8b-instant", 
                    temperature: 0.6,
                    max_tokens: 300,
                });

                textoSugerencia = completion.choices[0]?.message?.content.trim() || "Nivel alto detectado. Por favor busca apoyo.";

            } catch (errorGroq) {
                console.error("Error en Groq:", errorGroq);
                const fallback = {
                    alto: "Nivel significativo detectado. Acércate a tu tutor para una charla de apoyo.",
                    critico: "Nivel crítico. Acude de inmediato al cubículo de orientación psicopedagógica."
                };
                textoSugerencia = fallback[nivel];
            }
        } else {
            textoSugerencia = sugerenciasBase[cuestionario_id][nivel];
        }

        // 5. Guardar sugerencia (UPSERT)
        await supabase
            .from('sugerencias')
            .upsert({
                alumno_id,
                cuestionario_id,
                sugerencia: textoSugerencia,
                fecha: new Date().toISOString()
            }, { onConflict: 'alumno_id,cuestionario_id' });

        // 6. Respuesta final al Frontend
        res.json({ 
            message: 'Análisis completado', 
            sugerencia: textoSugerencia,
            nivel: nivel.toUpperCase() 
        });

    } catch (err) {
        console.error("Error General:", err);
        res.status(500).json({ error: err.message });
    }
};

export const historialRespuestas = async (req, res) => {
    try {
        const alumno_id = req.user.id;

        const { data, error } = await supabase
            .from('respuestas')
            .select(`
                puntaje,
                fecha_respuesta,
                cuestionarios (
                    nombre
                )
            `)
            .eq('alumno_id', alumno_id)
            .order('fecha_respuesta', { ascending: false });

        if (error) return res.status(400).json(error);

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};