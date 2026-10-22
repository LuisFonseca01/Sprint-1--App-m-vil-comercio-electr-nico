Esta es la tercera y ultima fase de desarrollo, revisión y ajuste de los Sprints y el backlog del proyecto para la elaboración de una app movil de comercio electrónico para la asignatura de Proyecto II, en el se siguen los parámetros y requerimientos de la metodología ágil SCRUM. 

# Gamecube

Gamecube es una app de comercio electrónico sobre productos gaming. 

La aplicación está hecha con Expo y React Native. Los usuarios, productos, carritos, pedidos y mensajes de seguimiento de las sesiones conectadas se guardan en MongoDB Atlas. Los pedidos de las sesiones locales de demostración se guardan en el dispositivo.

## Añadido en esta ultima fase: Bienvenida, reseñas y temas

- Al abrir la app aparece la pantalla de bienvenida; **Comenzar a explorar** lleva a la tienda.
- En el detalle de cada producto, las personas con sesión iniciada pueden publicar una calificación de 1 a 5 estrellas y un comentario. Las sesiones conectadas guardan las reseñas en MongoDB y las cuentas de demostración las guardan localmente en el dispositivo.
- El botón de sol/luna de la pantalla principal alterna entre modo claro y oscuro. La preferencia se conserva en el dispositivo.
- La búsqueda de productos permite combinar texto y categoría con filtros de precio y calificación, además de ordenar por relevancia, precio o puntuación.


## Qué necesitas

- Node.js y npm.
- Una cuenta de MongoDB Atlas.
- Expo Go si vas a probar la app en tu móvil.

## 1. Instalar el proyecto

Abre una terminal en la carpeta del proyecto y ejecuta:

```powershell
npm.cmd install
npm.cmd install --prefix server
```

## 2. Configurar MongoDB

En MongoDB Atlas:

1. Crea un usuario en **Security -> Database Access**.
2. Añade tu IP en **Security -> Network Access**.
3. Copia la URI de conexión desde **Database -> Connect -> Drivers**.

Crea el archivo `server/.env` copiando la plantilla:

```powershell
Copy-Item server/.env.example server/.env
```

Después abre `server/.env` y escribe tus datos:

```env
PORT=5000
MONGO_URI=mongodb+srv://USUARIO:CONTRASENA@CLUSTER.mongodb.net/gamecube?retryWrites=true&w=majority
JWT_SECRET=pon-aqui-una-clave-larga
```

## 3. Configurar Expo

Copia la plantilla:

```powershell
Copy-Item .env.example .env
```

Si usas el navegador o un emulador en la computadora, deja esta dirección:

```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

Si usas un celular físico, reemplaza `localhost` por la IP de tu ordenador:

```powershell
ipconfig
```

Después escribe esa IP en `.env`. Por ejemplo:

```env
EXPO_PUBLIC_API_URL=http://192.168.7.109:5000/api
```

El celular y la computadora deben estar conectados a la misma Wi-Fi.

## 4. Cargar los productos

Para guardar los productos en MongoDB, ejecuta:

```powershell
npm.cmd --prefix server run seed
```

Esto carga los productos de `src/data/products.js` en la colección `products`.

## 5. Ejecuta el proyecto

La campana de la pantalla principal abre una bandeja local con avisos de compras, cambios de pedido, favoritos, productos añadidos al carrito y respuestas de soporte. Los cambios de pedidos y respuestas se consultan mientras la app está abierta; son avisos dentro de la app, no notificaciones push del sistema.

Los métodos de pago son una simulación: puedes probar con la targeta  `4242 4242 4242 4242`, vencimiento con fecha futura y CVC `123`, o elegir PayPal, transferencia o efectivo. No se hacen cargos ni se envían datos de pago a servicios externos. Los pedidos de usuarios conectados se guardan en MongoDB para que laadministración pueda cambiar su estado. Cada cambio se conserva como un mensaje de seguimiento que aparece en el historial del clienten.

Desde el perfil puedes consultar el historial, filtrar pedidos por fecha o estado, revisar las notificaciones y el detalle de cada orden, editar tus datos y foto, cambiar tu contraseña y abrir las preguntas frecuentes.

El chat de soporte actualiza mensajes automáticamente. Los errores de conexión, validación y guardado se muestran en mensajes con acciones claras.


Primero abre una terminal y arranca el backend:

```powershell
npm.cmd run api
```

Si funciona, verás:

```text
Gamecube API escuchando en http://localhost:5000
```

Luego abre otra terminal y arranca Expo:

```powershell
npm.cmd start
```

Para limpiar la caché si no ves los últimos cambios:

```powershell
npx.cmd expo start -c
```

## Comprobar MongoDB

Con el backend encendido, ejecuta:

```powershell
Invoke-RestMethod http://localhost:5000/api/health
```

Debe aparecer:

```json
{"ok":true}
```

También puedes ver los productos desde:

```text
http://localhost:5000/api/products
```

## Comandos rápidos

```powershell
npm.cmd run web
npm.cmd run android
npm.cmd run ios
```

## Importante

En MongoDB Atlas encontrarás estas colecciones donde se pueden ver los usuarios registrados, los productos y las ordenes:

```text
products   productos de la tienda
users      usuarios registrados
orders     compras, estado actual y mensajes de seguimiento
supportmessages   conversaciones de soporte
```
