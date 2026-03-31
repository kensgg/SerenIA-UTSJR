import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    try{
        const authHeader = req.headers.authorization;

        if (!authHeader) { 
            return res.status(400).json({ error : 'Token Requerido'});
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next();
    } catch ( error ) {
        res.status(4001).json({ error : 'Token inválido'});
    }
};

export const isTutor = (req, res, next) =>{
    if (req.user.rol !== 'tutor'){
        return res.status(403).json({ error : 'Solo tutores pueden ver esta pagina'});
    }
    next();
}