const express = require("express");
const User = require("../models/User");
const { protegerRuta } = require("../middleware/auth");

const router = express.Router();

// GET /api/account/mi-cuenta - Ver datos de mi cuenta
router.get("/mi-cuenta", protegerRuta, async (req, res) => {
  try {
    const usuario = await User.findById(req.usuario._id).select("-contrasena");

    res.json({
      id: usuario._id,
      nombre: usuario.nombre,
      usuario: usuario.usuario,
      saldo: usuario.saldo,
      totalMovimientos: usuario.movimientos.length,
      cuentaDesde: usuario.createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los datos de la cuenta." });
  }
});

// GET /api/account/saldo - Solo el saldo actual
router.get("/saldo", protegerRuta, async (req, res) => {
  try {
    const usuario = await User.findById(req.usuario._id).select("saldo nombre");

    res.json({
      nombre: usuario.nombre,
      saldo: usuario.saldo,
    });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el saldo." });
  }
});

module.exports = router;
