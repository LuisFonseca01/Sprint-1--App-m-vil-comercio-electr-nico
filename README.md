Este es el primer Sprint backlog del proyecto para la elaboración de una app movil de comercio electrónico para la asignatura de Proyecto II, en el se siguen los parametros y requerimientos de la metodología ágil SCRUM. 

# Gamecube

Gamecube es una app de comercio electrónico sobre productos gaming. Puedes ver productos, buscarlos, registrarte, iniciar sesión, añadir productos al carrito y comprar.

La aplicación está hecha con Expo y React Native. Los usuarios, productos, carritos y compras se guardan en MongoDB Atlas.


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

Si usas un celular físico, busca la IP de tu ordenador con:

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

En MongoDB Atlas encontrarás estas colecciones donde se pueden ver los usuarios registrados, los productos y las ordenes(aun no programadas en este Sprint):

```text
products   productos de la tienda
users      usuarios registrados
orders     compras realizadas
```
