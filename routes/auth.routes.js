const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Generar JWT
const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// POST /api/auth/registro - Crear nuevo usuario
router.post("/registro", async (req, res) => {
  try {
    const { nombre, usuario, contrasena, saldoInicial = 0 } = req.body;

    if (!nombre || !usuario || !contrasena) {
      return res
        .status(400)
        .json({ error: "Todos los campos son requeridos." });
    }

    const usuarioExistente = await User.findOne({ usuario });
    if (usuarioExistente) {
      return res
        .status(400)
        .json({ error: "El nombre de usuario ya está en uso." });
    }

    const nuevoUsuario = await User.create({
      nombre,
      usuario,
      contrasena,
      saldo: saldoInicial,
    });

    const token = generarToken(nuevoUsuario._id);

    res.status(201).json({
      mensaje: "Usuario creado exitosamente",
      token,
      usuario: {
        id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        usuario: nuevoUsuario.usuario,
        saldo: nuevoUsuario.saldo,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// POST /api/auth/login - Iniciar sesión
router.post("/login", async (req, res) => {
  try {
    const { usuario, contrasena } = req.body;

    if (!usuario || !contrasena) {
      return res
        .status(400)
        .json({ error: "Usuario y contraseña son requeridos." });
    }

    const usuarioEncontrado = await User.findOne({ usuario });
    if (!usuarioEncontrado) {
      return res.status(401).json({ error: "Credenciales incorrectas." });
    }

    const contrasenaCorrecta =
      await usuarioEncontrado.compararContrasena(contrasena);
    if (!contrasenaCorrecta) {
      return res.status(401).json({ error: "Credenciales incorrectas." });
    }

    const token = generarToken(usuarioEncontrado._id);

    res.json({
      mensaje: "Inicio de sesión exitoso",
      token,
      usuario: {
        id: usuarioEncontrado._id,
        nombre: usuarioEncontrado.nombre,
        usuario: usuarioEncontrado.usuario,
        saldo: usuarioEncontrado.saldo,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

module.exports = router;
