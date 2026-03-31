import supabase from '../db/supabaseClient.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const register = async(req,res) =>{
    try {
        const {
            nombre,
            ape_p,
            ape_m,
            carrera_id,
            grupo_id,
            cuatrimestre,
            genero,
            correo,
            password
        } = req.body;

        const password_hash = await bcrypt.hash(password, 10);

        const { data, error } = await supabase
            .from('alumnos')
            .insert([{
                nombre,
                ape_p,
                ape_m,
                carrera_id,
                grupo_id,
                cuatrimestre,
                genero,
                correo,
                password_hash
            }]);

        if (error) {
            return res.status(400).json(error);
        }

        res.json({ message: 'Alumno registrado correctamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const login = async (req,res) => {
    try {
        const {correo, password} = req.body;

        const  {data, error} = await supabase
            .from('alumnos')
            .select('*')
            .eq('correo', correo)
            .single();

        if (error || !data) {
            return res.status(400).json({ error : 'Usuario no encontrado'});
        }

        const validPassword = await bcrypt.compare(password, data.password_hash);
        
        if (!validPassword){
            return res.status(400).json({ error: 'Contraseña incorrecta'});
        }

        const token = jwt.sign(
            { id : data.id, correo : data.correo, rol : 'alumno'},
            process.env.JWT_SECRET,
            { expiresIn : '2h'}
        );

        res.json({
            message : 'Login exitoso',
            token
        });
    } catch (err) {
        res.status(500).json({ error : err.message})
    }
}