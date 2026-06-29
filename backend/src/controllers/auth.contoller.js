import supabase from '../db/supabaseClient.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../services/email.service.js';

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

// --- FORGOT PASSWORD ---
export const forgotPassword = async (req, res) => {
    try {
        const { correo } = req.body;

        if (!correo) {
            return res.status(400).json({ error: 'El correo es obligatorio' });
        }

        // Verificar que el usuario exista (sin revelar si existe o no por seguridad)
        const { data: alumno } = await supabase
            .from('alumnos')
            .select('correo')
            .eq('correo', correo.toLowerCase().trim())
            .single();

        let userExists = !!alumno;

        if (!userExists) {
            const { data: tutor } = await supabase
                .from('tutores')
                .select('correo')
                .eq('correo', correo.toLowerCase().trim())
                .single();
            userExists = !!tutor;
        }

        // Respuesta genérica para evitar enumeración de correos
        if (!userExists) {
            return res.status(200).json({
                message: 'Si ese correo está registrado, recibirás un enlace en breve.'
            });
        }

        // Generar token seguro de un solo uso
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

        // Invalidar tokens anteriores del mismo correo
        await supabase
            .from('password_reset_tokens')
            .update({ used: true })
            .eq('correo', correo.toLowerCase().trim())
            .eq('used', false);

        // Guardar el nuevo token
        const { error: insertError } = await supabase
            .from('password_reset_tokens')
            .insert([{ correo: correo.toLowerCase().trim(), token, expires_at: expiresAt }]);

        if (insertError) {
            console.error('[forgotPassword] Error guardando token:', insertError);
            return res.status(500).json({ error: 'Error al procesar la solicitud' });
        }

        // Construir link de reset
        const resetLink = `${process.env.APP_URL}/reset-password?token=${token}`;

        // Enviar email
        await sendPasswordResetEmail(correo.toLowerCase().trim(), resetLink);

        res.status(200).json({
            message: 'Si ese correo está registrado, recibirás un enlace en breve.'
        });

    } catch (err) {
        console.error('[forgotPassword]', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// --- RESET PASSWORD ---
export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Token y nueva contraseña son requeridos' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
        }

        // Buscar el token en la base de datos
        const { data: resetData, error: tokenError } = await supabase
            .from('password_reset_tokens')
            .select('*')
            .eq('token', token)
            .eq('used', false)
            .single();

        if (tokenError || !resetData) {
            return res.status(400).json({ error: 'El enlace es inválido o ya fue utilizado' });
        }

        // Verificar expiración
        if (new Date() > new Date(resetData.expires_at)) {
            return res.status(400).json({ error: 'El enlace ha expirado. Solicita uno nuevo.' });
        }

        // Hashear la nueva contraseña
        const password_hash = await bcrypt.hash(newPassword, 10);

        // Verificar a qué tabla pertenece el usuario
        const { data: alumno } = await supabase
            .from('alumnos')
            .select('id')
            .eq('correo', resetData.correo)
            .single();

        let updateError = null;

        if (alumno) {
            const { error } = await supabase
                .from('alumnos')
                .update({ password_hash })
                .eq('correo', resetData.correo);
            updateError = error;
        } else {
            const { error } = await supabase
                .from('tutores')
                .update({ password_hash })
                .eq('correo', resetData.correo);
            updateError = error;
        }

        if (updateError) {
            console.error('[resetPassword] Error actualizando contraseña:', updateError);
            return res.status(500).json({ error: 'No se pudo actualizar la contraseña' });
        }

        // Marcar el token como usado
        await supabase
            .from('password_reset_tokens')
            .update({ used: true })
            .eq('token', token);

        res.status(200).json({ message: 'Contraseña actualizada correctamente' });

    } catch (err) {
        console.error('[resetPassword]', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};