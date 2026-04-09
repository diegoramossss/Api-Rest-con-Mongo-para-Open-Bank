const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protegerRuta = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ error: "Acceso denegado. Token requerido." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = await User.findById(decoded.id).select("-contrasena");

    if (!req.usuario) {
      return res
        .status(401)
        .json({ error: "Token inválido. Usuario no encontrado." });
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido o expirado." });
  }
};

module.exports = { protegerRuta };
