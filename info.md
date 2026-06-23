El Chanquito 🛒
TIF — Trabajo Integrador Final
Autoservicio online tipo Mercado Libre, con suscripciones, descuentos dinámicos, pagos reales con Mercado Pago, chatbot y panel para distintos roles (cliente, admin, repositor).

👥 Equipo

Faramid Faccuse
Elias Rudman
Nicolas Paiz


🧠 ¿Qué hace la app?
Es básicamente un super online. El cliente arma un carrito, ve precios con descuentos automáticos (jubilado, estudiante, suscriptor), elige el método de pago y compra. Hay 3 perfiles de usuario:

Cliente → navega productos, arma carrito, paga, ve sus pedidos, gestiona suscripción y direcciones
Admin → CRUD de productos, precios, categorías, ofertas, ve y gestiona todos los pedidos
Repositor → repone stock y actualiza estados de pedidos

Funcionalidades

Registro y login con JWT + bcrypt
Autenticación 2FA con Google Authenticator / Authy
Carrito con validación de stock en tiempo real
Sistema de descuentos dinámico (jubilado -21%, estudiante -15%)
Suscripciones (Básico, Estándar, Plus) con beneficios distintos
Pagos reales con Mercado Pago (tarjetas, transferencia, efectivo en Rapipago)
Ofertas con fecha de vencimiento y destacadas
Búsqueda con sugerencias en tiempo real
Chatbot/asistente con FAQs (preparado para conectar IA real)
Panel admin completo (productos, categorías, ofertas, pedidos)
Panel repositor (reposición de stock + cambio de estados)
Direcciones de envío del cliente (preparado para integrar mapa)


🛠️ Tecnologías
Backend: Node.js · Express · TypeScript · Prisma 6 · PostgreSQL (Supabase) · JWT · bcryptjs · Zod · speakeasy · MercadoPago SDK
Frontend: React 18 · Vite · TypeScript · React Router 6 · Context API · CSS propio
Deploy: Render (backend) · Netlify (frontend) · Supabase (base de datos)

📁 Estructura del proyecto
changuito/
├── README.md
├── netlify.toml
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── config/         (cliente Prisma)
│       ├── controllers/    (lógica de cada recurso)
│       ├── middlewares/    (JWT, roles, errores)
│       ├── routes/         (definición de endpoints)
│       ├── services/       (descuentos, 2FA, pagos, chat, MP)
│       ├── types/          (tipos TS compartidos)
│       └── utils/          (jwt helpers, validators Zod)
└── frontend/
    └── src/
        ├── api/            (cliente fetch con JWT)
        ├── components/     (Navbar, Cards, Chatbot, etc.)
        ├── context/        (Auth, Cart, Toast)
        ├── pages/          (Home, Login, Cart, Admin...)
        ├── styles/         (theme.css)
        └── types/

🚀 Setup inicial (solo la primera vez)
Requisitos

Node.js 20+
Una cuenta en GitHub
Acceso al repo (pedile a Elias que te agregue como colaborador)

Paso 1: Clonar el repo
bashgit clone https://github.com/Elias0602/changuito-tp.git
cd changuito-tp
Paso 2: Configurar Git con tu identidad (si no lo hiciste nunca)
bashgit config --global user.email "tu@email.com"
git config --global user.name "Tu Nombre"
Paso 3: Crear el archivo .env del backend
El .env NO está en el repo (por seguridad). Pedile a Elias que te pase el contenido por privado (Discord/WhatsApp). Es un archivo con esto adentro:
envDATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
PORT=4000
NODE_ENV=development
JWT_SECRET="..."
JWT_EXPIRES_IN="2d"
FRONTEND_URL="http://localhost:5173"
BACKEND_URL="http://localhost:4000"
MP_ACCESS_TOKEN="TEST-..."
Pegalo en backend/.env.
Paso 4: Instalar dependencias
bashcd backend
npm install

cd ../frontend
npm install
Paso 5: Levantar el proyecto
Abrí DOS terminales.
Terminal 1 — backend:
bashcd backend
npm run dev
Va a quedar corriendo en http://localhost:4000.
Terminal 2 — frontend:
bashcd frontend
npm run dev
Va a quedar corriendo en http://localhost:5173.
Abrí esa URL en el navegador y listo.

💻 Día a día — Flujo con Git (para todo el equipo)
Esto es lo más importante para no pisarse entre todos.
✅ ANTES de empezar a programar (siempre)
bashgit pull
Eso baja al disco los cambios que hicieron los demás en GitHub. Si no lo hacés, vas a trabajar sobre una versión vieja del código.
💾 DESPUÉS de hacer cambios
bash# 1) Ver qué archivos cambiaste
git status

# 2) Agregar tus cambios al "staging"
git add .

# 3) Hacer el commit (mensaje describiendo qué hiciste)
git commit -m "agregue el mapa de leaflet en la página de direcciones"

# 4) Subirlo a GitHub
git push
Apenas hacés git push:

Netlify detecta el cambio y rebuildea el frontend automáticamente (~1 min)
Render detecta el cambio y rebuildea el backend automáticamente (~2-3 min)
La página changuito-final.netlify.app se actualiza sola

⚠️ Si te aparece error al hacer push
Si dice algo tipo "rejected" o "hay cambios remotos" significa que alguien más subió algo y vos quedaste desactualizado. Solución:
bashgit pull
# se traen los cambios. Si hay conflicto, te avisa qué archivo
# abrís el archivo, ves las dos versiones marcadas con <<<<<< y >>>>>>
# elegís qué dejar (las dos o una), guardás
git add .
git commit -m "merge"
git push
💡 Tips para no romper nada

Avisá en el grupo antes de tocar archivos compartidos (ej: "voy a tocar el navbar")
No commitees el .env (ya está en .gitignore, pero por las dudas)
No commitees node_modules (ya está ignorado)
Hacé pulls seguido — si vas a programar 2 horas, hacé git pull al empezar
Si rompiste algo y querés volver atrás:

bash   git checkout .       # descarta los cambios sin commitear
   git reset --hard     # vuelve al último commit (DESTRUCTIVO)

🌐 Deploy
Base de datos: Supabase
Está en supabase.com. Si necesitás acceso a la DB pedile a Elias. La conexión está configurada en las variables DATABASE_URL y DIRECT_URL.
Backend: Render

URL: https://changuito-tp.onrender.com
Cada git push rebuildea automáticamente
Si necesitás cambiar variables de entorno: Render → tu servicio → Environment
⚠️ Render Free se duerme tras 50 segundos sin uso. La primera request puede tardar ~30 segundos en despertar.

Frontend: Netlify

URL: https://changuito-final.netlify.app
Cada git push rebuildea automáticamente
Variable de entorno: VITE_API_URL=https://changuito-tp.onrender.com


🔐 Cuentas de prueba
RolEmailContraseña👑 Adminadmin@changuito.comadmin123📦 Repositorrepositor@changuito.comrepo123
Los clientes se registran desde la web (botón "Crear cuenta"). Al registrarte podés tildar "Soy jubilado" o "Soy estudiante" para tener descuento automático.

💳 Cómo probar Mercado Pago
Está configurado en modo TEST (no se cobra plata real). En el checkout, elegí la opción "Tarjeta, transferencia o efectivo" (la RECOMENDADA).
Te redirige a MP. Ahí usás estas credenciales de prueba:
Número:      5031 7557 3453 0604
Vencimiento: 11/30
CVV:         123
Nombre:      APRO
DNI:         12345678
🪄 Truco: el nombre define el resultado:

APRO → pago aprobado ✅
OTHE → pago rechazado ❌
CONT → pago pendiente ⏳

Cuando aprueba, el sistema descuenta stock y marca el carrito como pagado automáticamente.
Para pasar a producción (cobrar plata real)

MP → tu app → Credenciales de Producción
Reemplazar MP_ACCESS_TOKEN en Render por el token productivo (empieza con APP_USR-)
Listo


📝 Tareas pendientes (para que se repartan)
🗺️ Sistema de mapa para direcciones

Donde dice TODO MAPA en frontend/src/pages/Direcciones.tsx (línea ~125)
Hay que instalar leaflet react-leaflet (gratis, usa OpenStreetMap)
Renderizar mapa, marker draggable, guardar lat/lng en el form
También se puede hacer geocoding (calle+número → lat/lng) en el backend en backend/src/controllers/address.controller.ts

🤖 Conectar IA real al chatbot

En backend/src/services/chat.service.ts (función llamarIA)
Está todo el código de ejemplo comentado adentro
Opciones: Anthropic Claude (recomendado), OpenAI, Groq (gratis)
Hay que:

npm install @anthropic-ai/sdk en backend/
Sacar API key en console.anthropic.com
Agregar ANTHROPIC_API_KEY en Render → Environment
Descomentar el código de ejemplo de llamarIA()



Si no se conecta IA real, el chatbot igual funciona con 8 FAQs hardcodeadas como fallback.

👥 Contribuciones individuales (Plus de promoción)
Faramid Faccuse — Seguridad
Me encargué de toda la parte de autenticación. Hice el sistema de 2FA con TOTP usando speakeasy: el usuario escanea un QR con Google Authenticator o Authy y a partir de ahí necesita el código de 6 dígitos cada vez que se loguea. También se puede desactivar pero pidiendo el código actual. Validación estricta con Zod en todos los endpoints del backend y middleware de roles que protege las rutas según quién esté logueado.
Archivos principales: src/services/twofa.service.ts, src/utils/validators.ts, src/controllers/auth.controller.ts, src/middlewares/auth.ts
Elias Rudman — Pagos
Desarrollé toda la integración con Mercado Pago Checkout Pro. Cuando el usuario paga, se crea una preferencia en MP, se redirige a la pasarela, y al volver el sistema verifica con la API de MP el estado del pago. Si está aprobado, una transacción de Prisma descuenta stock, crea la Order y marca el carrito como pagado, todo atómicamente — si falla algo, no queda nada inconsistente. Además dejé un webhook listo para que MP notifique los pagos asíncronos. El sistema soporta también un modo demo con QR para mostrar el flujo sin necesidad de la API real.
Archivos principales: src/services/mercadopago.service.ts, src/services/payment.service.ts, src/controllers/order.controller.ts
Nicolas Paiz — Frontend y UX
Hice todo el frontend. Tres contextos globales con Context API (Auth, Cart y Toast) que mantienen el estado en toda la app y sincronizan automáticamente con el backend. El AuthContext maneja el JWT y el flujo de 2FA en login. El CartContext implementa optimistic updates: cuando agregás algo al carrito, el cambio se ve instantáneo. El ToastContext muestra notificaciones flotantes en lugar de los alert() feos del navegador. Todo el CSS lo hice desde cero con custom properties, con animaciones (skeletons, fade-in escalonado, bounce del badge, transiciones entre páginas). También hice un loader propio con el changuito que se mueve.
Archivos principales: src/context/, src/styles/theme.css, src/components/Navbar.tsx, src/components/Chatbot.tsx, src/components/Loader.tsx

🐛 Bugs conocidos y cómo arreglarlos
"Sin stock suficiente" al pagar con MP
Si volviste atrás en MP a mitad del pago, quedó una orden PENDIENTE asociada al carrito. Hay que borrarla manualmente desde Supabase, o el sistema ya la reutiliza automáticamente en el próximo intento.
Backend tarda mucho en responder la primera vez
Render Free duerme el servicio tras 50s sin uso. La primera carga tarda ~30 segundos en despertarlo. Después funciona normal.
2FA: si activé pero no veo el estado actualizado
Hacé F5 una vez. Después se mantiene sincronizado solo.

📚 Endpoints de la API (resumen)
Base: https://changuito-tp.onrender.com/api
MétodoRutaDescripciónPOST/auth/registerRegistrarPOST/auth/loginLogin (devuelve token o pide 2FA)POST/auth/2fa/setupIniciar setup 2FAPOST/auth/2fa/confirmActivar 2FA con códigoPOST/auth/2fa/disableDesactivar 2FAGET/auth/meMi perfilGET/productsListar productosGET/products/recomendacionesImperdibles + nuevosPOST/productsCrear producto (admin)POST/products/:id/reponerReponer stockGET/categoriesListar categoríasGET/cartMi carritoPOST/cart/itemsAgregar al carritoPOST/orders/checkoutCheckout simulado (QR)POST/orders/checkout-mpCheckout con Mercado PagoGET/orders/:id/verificar-pagoConfirmar pago de MPPOST/orders/webhook/mpWebhook de MPGET/orders/meMis pedidosGET/offersOfertas activasGET/subscriptions/planesVer planesPOST/subscriptionsSuscribirmeGET/addressesMis direccionesPOST/addressesNueva direcciónPOST/chatHablar con el asistente
