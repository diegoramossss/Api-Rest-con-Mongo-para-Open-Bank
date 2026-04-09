const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Sub-schema para movimientos/transacciones
const transactionSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: ["ingreso", "gasto"],
    required: true,
  },
  descripcion: {
    type: String,
    required: true,
    trim: true,
  },
  monto: {
    type: Number,
    required: true,
    min: 0.01,
  },
  categoria: {
    type: String,
    enum: [
      "salario",
      "transferencia",
      "alquiler",
      "alimentacion",
      "transporte",
      "ocio",
      "salud",
      "otros",
    ],
    default: "otros",
  },
  fecha: {
    type: Date,
    default: Date.now,
  },
});

// Schema principal del usuario
const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    usuario: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    contrasena: {
      type: String,
      required: true,
      minlength: 6,
    },
    saldo: {
      type: Number,
      default: 0,
    },
    movimientos: [transactionSchema],
  },
  {
    timestamps: true,
  },
);

// Hash de contraseña antes de guardar
userSchema.pre("save", async function () {
  if (!this.isModified("contrasena")) return;
  this.contrasena = await bcrypt.hash(this.contrasena, 12);
});

// Método para comparar contraseñas
userSchema.methods.compararContrasena = async function (contrasenaIngresada) {
  return await bcrypt.compare(contrasenaIngresada, this.contrasena);
};

module.exports = mongoose.model("User", userSchema);
