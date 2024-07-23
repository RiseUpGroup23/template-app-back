const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { User } = require("../models/users/userModel");

router.post("/login", async (req, res) => {
    const { email, password, role } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ logged: false, message: "Usuario no encontrado" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ logged: false, message: "Usuario o contraseña incorrectos" });
        }

        res.status(200).json({ logged: true, message: "Login exitoso" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ logged: false, message: "Hubo un error al intentar acceder" });
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

        // Guardar el usuario en la base de datos
        await newUser.save();

        res.status(201).json({ message: "Usuario creado exitosamente" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Error en endpoint" });
    }
});

module.exports = router;
