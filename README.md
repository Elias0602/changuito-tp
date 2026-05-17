# Changuito 🛒

**TIF - Trabajo Integrador Final | Grupo 8**
Faramid Faccuse · Elias Rudman · Nicolas Paiz

---

## De qué trata

Changuito es un sistema de autoservicio online, básicamente un super en línea donde los clientes pueden ver productos, armar su carrito y pagar. Tiene tres tipos de usuarios: cliente, admin y repositor, cada uno con su propio panel.

Lo hicimos con Node + Express + Prisma en el back, React en el front, y la base de datos está en Supabase (PostgreSQL). El front se deploya en Netlify y el back en Render.

---

## Cómo levantarlo local

Necesitás Node 20+ instalado.

**Backend:**
```bash
cd backend
cp .env.example .env
# completar las variables del .env (ver abajo)
npm install
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

**Frontend** (en otra terminal):
```bash
cd frontend
npm install
npm run dev
```

El front queda en `localhost:5173` y el back en `localhost:4000`. El proxy de Vite se encarga de que las peticiones al `/api` vayan solas al backend, no hay que configurar nada extra en desarrollo.

---

## Variables de entorno

**Backend** (`backend/.env`):
```
DATABASE_URL=        # connection string de Supabase (pooler, puerto 6543)
DIRECT_URL=          # connection string directo de Supabase (puerto 5432, para migraciones)
JWT_SECRET=          # cualquier string largo y random
JWT_EXPIRES_IN=2d
PORT=4000
FRONTEND_URL=http://localhost:5173
```

**Frontend** (`frontend/.env.local`):
```
VITE_API_URL=        # en local no hace falta, en producción va la URL del backend en Render
```

---

## Deploy

### Base de datos - Supabase
1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ir a Settings → Database → Connection string
3. Copiar la URL del **Connection Pooler** (puerto 6543) para `DATABASE_URL`
4. Copiar la URL **directa** (puerto 5432) para `DIRECT_URL`
5. Correr `npm run prisma:deploy` para aplicar las migraciones
6. Correr `npm run prisma:seed` para cargar datos iniciales

### Backend - Render
1. Crear un Web Service nuevo conectado al repo
2. Root directory: `backend`
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Agregar las variables de entorno (las mismas del `.env`)
6. En `FRONTEND_URL` poner la URL de Netlify cuando la tengas

### Frontend - Netlify
1. Importar el repo en Netlify
2. Base directory: `frontend`
3. Build command: `npm run build`
4. Publish directory: `frontend/dist`
5. Agregar variable de entorno `VITE_API_URL` con la URL del backend en Render
6. El `netlify.toml` ya maneja los redirects del router

---

## Funcionalidades

- Registro y login con JWT y bcrypt
- Autenticación de dos pasos (2FA) con Google Authenticator / Authy
- Tres roles: Cliente, Admin, Repositor
- Carrito de compras con validación de stock en tiempo real
- Sistema de ofertas con fecha de vencimiento y destacadas
- Descuentos automáticos: jubilados (-21%), estudiantes (-15%), suscriptores (-50% + envío gratis)
- Suscripciones: Básico, Estándar y Plus (solo anual)
- Pagos simulados: QR, débito y crédito
- Panel de admin: gestión de productos, categorías, ofertas, precios y pedidos
- Panel de repositor: reposición de stock y actualización de estados

---

## Estructura del proyecto

```
changuito/
├── netlify.toml
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middlewares/
│       ├── routes/
│       ├── services/
│       ├── types/
│       └── utils/
└── frontend/
    └── src/
        ├── api/
        ├── components/
        ├── context/
        ├── pages/
        ├── styles/
        └── types/
```

---

## Contribuciones individuales

### Faramid Faccuse — Seguridad (Plus individual)
Me encargué de todo lo relacionado a la autenticación. Implementé el sistema de 2FA usando TOTP con speakeasy: el usuario escanea un QR con cualquier app autenticadora y a partir de ahí tiene que ingresar el código de 6 dígitos al loguearse. También puse validación de inputs en todos los endpoints del backend usando Zod, así no llegan datos basura a la base de datos. Y el sistema de roles con middleware JWT para proteger las rutas según quién esté logueado.

Archivos principales: `src/services/twofa.service.ts`, `src/utils/validators.ts`, `src/controllers/auth.controller.ts`, `src/middlewares/auth.ts`

### Elias Rudman — Pagos e integración (Plus individual)
Desarrollé la lógica de pagos y el checkout. El checkout corre en una transacción de Prisma, o sea que si algo falla en el medio (por ejemplo el stock se acaba justo antes de terminar), nada queda a medias. También hice el generador de QR dinámico que muestra el código con el monto real de la compra. La arquitectura del servicio de pagos está pensada para que en el futuro sea fácil reemplazar el simulador con la API de MercadoPago.

Archivos principales: `src/services/payment.service.ts`, `src/controllers/order.controller.ts`

### Nicolas Paiz — Frontend y estado (Plus individual)
Me ocupé de todo el frontend. Hice los dos contextos globales (AuthContext y CartContext) que manejan el estado de sesión y carrito en toda la app. El AuthContext se encarga de guardar el JWT, hacer el refresh del perfil automático al recargar la página, y manejar el flujo de login con 2FA. El CartContext sincroniza el carrito con el backend después de cada operación. También diseñé todo el CSS desde cero con custom properties para que sea fácil cambiar colores.

Archivos principales: `src/context/AuthContext.tsx`, `src/context/CartContext.tsx`, `src/styles/theme.css`

---

## Tecnologías

Node.js · Express · TypeScript · Prisma 6 · PostgreSQL (Supabase) · JWT · bcrypt · Zod · speakeasy · React · Vite · React Router · Context API
