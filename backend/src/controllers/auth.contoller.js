import supabase from '../db/supabaseClient.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// --- LOGIN ---
export const login = async (req, res) => {
    try {
        const { correo, password } = req.body;

        const { data, error } = await supabase
            .from('alumnos')
            .select('*')
            .eq('correo', correo)
            .single();

        // 1. Si no hay datos, el usuario NO existe (404 Not Found)
        if (error || !data) {
            return res.status(404).json({ error: 'El correo no está registrado' });
        }

        // 2. Verificar contraseña
        const validPassword = await bcrypt.compare(password, data.password_hash);
        
        // 3. Si no coincide, es error de credenciales (401 Unauthorized)
        if (!validPassword) {
            return res.status(401).json({ error: 'La contraseña es incorrecta' });
        }

        // 4. Generar Token
        const token = jwt.sign(
            { id: data.id, correo: data.correo, rol: 'alumno' },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.json({
            message: 'Bienvenido a SerenIA',
            token
        });

    } catch (err) {
        // Error de servidor (500)
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// --- REGISTER ---
export const register = async (req, res) => {
    try {
        const { nombre, ape_p, ape_m, carrera_id, grupo_id, cuatrimestre, genero, correo, password } = req.body;

        // Verificar si el correo ya existe antes de registrar
        const { data: existingUser } = await supabase
            .from('alumnos')
            .select('correo')
            .eq('correo', correo)
            .single();

        if (existingUser) {
            return res.status(409).json({ error: 'Este correo ya tiene una cuenta' });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const { error } = await supabase
            .from('alumnos')
            .insert([{
                nombre, ape_p, ape_m, carrera_id, grupo_id, 
                cuatrimestre, genero, correo, password_hash
            }]);

        if (error) return res.status(400).json({ error: 'Datos de registro inválidos' });

        res.status(201).json({ message: 'Alumno registrado correctamente' });

    } catch (err) {
        res.status(500).json({ error: 'No se pudo completar el registro' });
    }
};