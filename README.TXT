# 🏦 OpenBank API

API REST construida con **Node.js + Express + MongoDB** para el proyecto OpenBank.

---

## 📁 Estructura del proyecto

```
openbank-api/
├── models/
│   └── User.js            # Modelo de usuario con movimientos embebidos
├── routes/
│   ├── auth.js            # Login y registro
│   ├── account.js         # Datos de cuenta y saldo
│   └── transactions.js    # Movimientos (CRUD + filtros)
├── middleware/
│   └── auth.js            # Verificación de JWT
├── server.js              # Entrada principal
├── seed.js                # Script para poblar la BD con datos de prueba
├── .env.example           # Variables de entorno de ejemplo
└── package.json
```

---

## 🚀 Instalación y puesta en marcha

### 1. Prerrequisitos
- Node.js >= 18
- MongoDB instalado localmente **o** una cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas) (gratuita)

### 2. Clonar e instalar dependencias
```bash
cd openbank-api
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
```
Edita `.env` con tus valores:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/openbank
JWT_SECRET=pon_aqui_una_clave_larga_y_secreta
```

### 4. (Opcional) Poblar la BD con usuarios de prueba
```bash
node seed.js
```
Esto crea dos usuarios de prueba:
- usuario: `ana` / contraseña: `123456`
- usuario: `carlos` / contraseña: `123456`

### 5. Arrancar el servidor
```bash
# Producción
npm start

# Desarrollo (con auto-reload)
npm run dev
```

El servidor estará disponible en: `http://localhost:5000`

---

## 📡 Endpoints de la API

### 🔐 Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/registro` | Crear nuevo usuario |
| POST | `/api/auth/login` | Iniciar sesión |

#### POST `/api/auth/registro`
```json
{
  "nombre": "María Pérez",
  "usuario": "maria",
  "contrasena": "mipassword",
  "saldoInicial": 1000
}
```

#### POST `/api/auth/login`
```json
{
  "usuario": "ana",
  "contrasena": "123456"
}
```
**Respuesta:**
```json
{
  "mensaje": "Inicio de sesión exitoso",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": {
    "id": "...",
    "nombre": "Ana García",
    "usuario": "ana",
    "saldo": 2500
  }
}
```

> ⚠️ Guarda el `token` — lo necesitas en todas las demás peticiones.

---

### 💳 Cuenta (requiere token)

Incluye en todas las peticiones el header:
```
Authorization: Bearer <tu_token_aqui>
```

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/account/mi-cuenta` | Datos completos de la cuenta |
| GET | `/api/account/saldo` | Solo el saldo actual |

---

### 💸 Movimientos (requiere token)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/transactions` | Todos los movimientos |
| GET | `/api/transactions?tipo=gasto` | Filtrar por tipo |
| GET | `/api/transactions?categoria=alimentacion` | Filtrar por categoría |
| GET | `/api/transactions?limite=5` | Últimos N movimientos |
| GET | `/api/transactions/gastos` | Solo gastos |
| GET | `/api/transactions/ingresos` | Solo ingresos |
| POST | `/api/transactions` | Añadir movimiento |
| DELETE | `/api/transactions/:id` | Eliminar movimiento |

#### POST `/api/transactions` — Añadir movimiento
```json
{
  "tipo": "gasto",
  "descripcion": "Cena restaurante",
  "monto": 45.50,
  "categoria": "alimentacion"
}
```

**Categorías disponibles:**
`salario` | `transferencia` | `alquiler` | `alimentacion` | `transporte` | `ocio` | `salud` | `otros`

#### Respuesta de GET `/api/transactions`
```json
{
  "movimientos": [
    {
      "_id": "...",
      "tipo": "ingreso",
      "descripcion": "Salario enero",
      "monto": 2000,
      "categoria": "salario",
      "fecha": "2024-01-31T10:00:00.000Z"
    }
  ],
  "resumen": {
    "totalIngresos": 2700,
    "totalGastos": 1026,
    "saldoActual": 2500,
    "cantidadMovimientos": 8
  }
}
```

---

## 🔒 Seguridad implementada

- ✅ Contraseñas hasheadas con **bcrypt** (salt 12)
- ✅ Autenticación stateless con **JWT** (expira en 7 días)
- ✅ Verificación de saldo antes de registrar gastos
- ✅ Rutas protegidas con middleware de autenticación

---

## 🗺️ Próximo paso: Frontend React

Una vez que la API esté funcionando, el frontend React deberá:
1. Guardar el `token` en `localStorage` al hacer login
2. Incluirlo en cada petición como header `Authorization: Bearer <token>`
3. Mostrar la pantalla de login si no hay token
4. Llamar a `/api/transactions` con los filtros según lo que el usuario seleccione