const express = require("express");
const User = require("../models/User");
const { protegerRuta } = require("../middleware/auth");

const router = express.Router();

// GET /api/transactions - Obtener todos los movimientos (con filtros opcionales)
// Query params: tipo=ingreso|gasto, categoria=..., limite=10
router.get("/", protegerRuta, async (req, res) => {
  try {
    const { tipo, categoria, limite } = req.query;
    const usuario = await User.findById(req.usuario._id);

    let movimientos = usuario.movimientos;

    // Filtrar por tipo (ingreso o gasto)
    if (tipo && ["ingreso", "gasto"].includes(tipo)) {
      movimientos = movimientos.filter((m) => m.tipo === tipo);
    }

    // Filtrar por categoría
    if (categoria) {
      movimientos = movimientos.filter((m) => m.categoria === categoria);
    }

    // Ordenar por fecha (más reciente primero)
    movimientos = movimientos.sort(
      (a, b) => new Date(b.fecha) - new Date(a.fecha),
    );

    // Limitar cantidad de resultados
    if (limite) {
      movimientos = movimientos.slice(0, parseInt(limite));
    }

    // Calcular totales
    const totalIngresos = usuario.movimientos
      .filter((m) => m.tipo === "ingreso")
      .reduce((sum, m) => sum + m.monto, 0);

    const totalGastos = usuario.movimientos
      .filter((m) => m.tipo === "gasto")
      .reduce((sum, m) => sum + m.monto, 0);

    res.json({
      movimientos,
      resumen: {
        totalIngresos,
        totalGastos,
        saldoActual: usuario.saldo,
        cantidadMovimientos: movimientos.length,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los movimientos." });
  }
});

// GET /api/transactions/gastos - Solo gastos
router.get("/gastos", protegerRuta, async (req, res) => {
  try {
    const usuario = await User.findById(req.usuario._id);
    const gastos = usuario.movimientos
      .filter((m) => m.tipo === "gasto")
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    const totalGastos = gastos.reduce((sum, m) => sum + m.monto, 0);

    res.json({
      gastos,
      total: totalGastos,
      cantidad: gastos.length,
    });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los gastos." });
  }
});

// GET /api/transactions/ingresos - Solo ingresos
router.get("/ingresos", protegerRuta, async (req, res) => {
  try {
    const usuario = await User.findById(req.usuario._id);
    const ingresos = usuario.movimientos
      .filter((m) => m.tipo === "ingreso")
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    const totalIngresos = ingresos.reduce((sum, m) => sum + m.monto, 0);

    res.json({
      ingresos,
      total: totalIngresos,
      cantidad: ingresos.length,
    });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los ingresos." });
  }
});

// POST /api/transactions - Agregar un nuevo movimiento
router.post("/", protegerRuta, async (req, res) => {
  try {
    const { tipo, descripcion, monto, categoria } = req.body;

    if (!tipo || !descripcion || !monto) {
      return res
        .status(400)
        .json({ error: "Tipo, descripción y monto son requeridos." });
    }

    if (!["ingreso", "gasto"].includes(tipo)) {
      return res
        .status(400)
        .json({ error: 'El tipo debe ser "ingreso" o "gasto".' });
    }

    if (monto <= 0) {
      return res.status(400).json({ error: "El monto debe ser mayor a 0." });
    }

    const usuario = await User.findById(req.usuario._id);

    // Verificar saldo suficiente para gastos
    if (tipo === "gasto" && usuario.saldo < monto) {
      return res
        .status(400)
        .json({ error: "Saldo insuficiente para realizar este gasto." });
    }

    // Crear el movimiento
    const nuevoMovimiento = {
      tipo,
      descripcion,
      monto,
      categoria: categoria || "otros",
      fecha: new Date(),
    };

    // Actualizar saldo
    if (tipo === "ingreso") {
      usuario.saldo += monto;
    } else {
      usuario.saldo -= monto;
    }

    usuario.movimientos.push(nuevoMovimiento);
    await usuario.save();

    res.status(201).json({
      mensaje: "Movimiento registrado exitosamente",
      movimiento: nuevoMovimiento,
      nuevoSaldo: usuario.saldo,
    });
  } catch (error) {
    res.status(500).json({ error: "Error al registrar el movimiento." });
  }
});

// DELETE /api/transactions/:id - Eliminar un movimiento
router.delete("/:id", protegerRuta, async (req, res) => {
  try {
    const usuario = await User.findById(req.usuario._id);
    const movimiento = usuario.movimientos.id(req.params.id);

    if (!movimiento) {
      return res.status(404).json({ error: "Movimiento no encontrado." });
    }

    // Revertir el saldo
    if (movimiento.tipo === "ingreso") {
      usuario.saldo -= movimiento.monto;
    } else {
      usuario.saldo += movimiento.monto;
    }

    movimiento.deleteOne();
    await usuario.save();

    res.json({
      mensaje: "Movimiento eliminado",
      nuevoSaldo: usuario.saldo,
    });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el movimiento." });
  }
});

module.exports = router;
