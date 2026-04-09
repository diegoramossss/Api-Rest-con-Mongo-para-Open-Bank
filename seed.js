// Script para poblar la base de datos con usuarios de prueba
// Ejecutar con: node seed.js

const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

const usuariosDePrueba = [
  {
    nombre: "Ana García",
    usuario: "ana",
    contrasena: "123456",
    saldo: 2500.0,
    movimientos: [
      {
        tipo: "ingreso",
        descripcion: "Salario enero",
        monto: 2000,
        categoria: "salario",
      },
      {
        tipo: "ingreso",
        descripcion: "Freelance diseño web",
        monto: 500,
        categoria: "otros",
      },
      {
        tipo: "gasto",
        descripcion: "Alquiler piso",
        monto: 750,
        categoria: "alquiler",
      },
      {
        tipo: "gasto",
        descripcion: "Supermercado Mercadona",
        monto: 120,
        categoria: "alimentacion",
      },
      {
        tipo: "gasto",
        descripcion: "Abono transporte mensual",
        monto: 54,
        categoria: "transporte",
      },
      {
        tipo: "gasto",
        descripcion: "Netflix + Spotify",
        monto: 22,
        categoria: "ocio",
      },
      {
        tipo: "ingreso",
        descripcion: "Transferencia recibida",
        monto: 200,
        categoria: "transferencia",
      },
      { tipo: "gasto", descripcion: "Farmacia", monto: 35, categoria: "salud" },
    ],
  },
  {
    nombre: "Carlos López",
    usuario: "carlos",
    contrasena: "123456",
    saldo: 1800.5,
    movimientos: [
      {
        tipo: "ingreso",
        descripcion: "Nómina febrero",
        monto: 1800,
        categoria: "salario",
      },
      {
        tipo: "gasto",
        descripcion: "Gasolinera Repsol",
        monto: 65,
        categoria: "transporte",
      },
      {
        tipo: "gasto",
        descripcion: "Restaurante La Taberna",
        monto: 45,
        categoria: "alimentacion",
      },
      {
        tipo: "ingreso",
        descripcion: "Devolución Hacienda",
        monto: 320,
        categoria: "otros",
      },
      {
        tipo: "gasto",
        descripcion: "Gimnasio mensual",
        monto: 39,
        categoria: "salud",
      },
      {
        tipo: "gasto",
        descripcion: "Amazon compras",
        monto: 87,
        categoria: "otros",
      },
    ],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado a MongoDB");

    // Limpiar usuarios existentes
    await User.deleteMany({});
    console.log("🗑️  Base de datos limpiada");

    // Insertar usuarios (el middleware de bcrypt se ejecuta automáticamente)
    for (const datos of usuariosDePrueba) {
      const usuario = new User(datos);
      await usuario.save();
      console.log(`👤 Usuario creado: ${datos.usuario} / ${datos.contrasena}`);
    }

    console.log("\n🎉 Seed completado exitosamente!");
    console.log("📋 Usuarios disponibles:");
    usuariosDePrueba.forEach((u) => {
      console.log(
        `   → usuario: "${u.usuario}" | contraseña: "${u.contrasena}"`,
      );
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error en seed:", error);
    process.exit(1);
  }
}

seed();
