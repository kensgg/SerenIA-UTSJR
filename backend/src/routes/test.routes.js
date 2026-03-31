import express from 'express';
import {verifyToken} from '../middleware/auth.middleware.js'

const router = express.Router();

router.get('/private', verifyToken, (req, res) => {
    res.json({
        message : 'Ruta privada',
        user : req.user
    });
});

export default router;