const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const crypto = require('crypto');
const { User } = require("../models/users/userModel");

const secretKey = crypto.randomBytes(32).toString('hex');

router.post("/login", async (req, res) => {
    const { email, password, role } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(200).json({ logged: false, message: "Usuario no encontrado" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(200).json({ logged: false, message: "Usuario o contraseña incorrectos" });
        }

        const token = jwt.sign({ email }, secretKey, { expiresIn: '1h' });
        res.status(200).json({ logged: true, message: "Login exitoso", token });
    } catch (error) {
        console.error(error.message);
        res.status(500).send();
    }
});

router.post("/newUser", async (req, res) => {
    const { email, password, role } = req.body;

    try {
        let existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "El usuario ya existe" });
        }

        const newUser = new User({
            email,
            password,
            role
        });

        await newUser.save();

        res.status(201).json({ message: "Usuario creado exitosamente" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Error en endpoint" });
    }
});

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(403).json({ error: 'Token no proporcionado' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Token inválido' });
        }
        req.user = decoded;
        next();
    });
};

router.get('/jwt', verifyToken, (req, res) => {
    res.json({ logged: true });
});

module.exports = router;
