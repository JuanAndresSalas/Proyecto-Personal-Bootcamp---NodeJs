# Proyecto Personal Bootcamp 

## Puesta en marcha
- 1° Tener en consideración que este proyecto hace uso de API, implementada en este repositorio: [API_NodeJS](https://github.com/JuanAndresSalas/API_NodeJS)
- 2° Luego de descargar el repositorio, instalar los paquetes necesarios mediante el comando (sin comillas): 
  "npm i bcrypt body-parser cookie-parser dotenv express express-session express-validator hbs passport passport passport-local nodemon"
- 3° Para iniciar la aplicación use el siguiente comando (sin comillas): "npm run ofertapp" 
- 4° En el navegador ir a la dirección: http://localhost:3000

**Para fines prácticos de demostración se agregaron los archivos .env de los respectivos proyectos**

**Cuenta Administrador: admin@mail.com**
**Contraseña: 123456789**



## Rúbrica: 
Links donde encontrar ejemplos de los aspectos a evaluar:
#### Consulta a la base de datos
- Selección de columnas requeridas para presentar la información solicitada: [API_NodeJS: src/controllers.js](https://github.com/JuanAndresSalas/API_NodeJS/blob/main/src/controllers.js)
- Uso de JOIN para relacionar la información de distintas tablas: [API_NodeJS: src/controllers.js Linea: 147](https://github.com/JuanAndresSalas/API_NodeJS/blob/main/src/controllers.js)
- Uso de WHERE para filtrar la información requerida: [API_NodeJS: src/controllers.js Linea: 169](https://github.com/JuanAndresSalas/API_NodeJS/blob/main/src/controllers.js)
- Uso de cláusulas de ordenamiento para presentar la información: [API_NodeJS: src/controllers.js Línea: 111](https://github.com/JuanAndresSalas/API_NodeJS/blob/main/src/controllers.js)
- Uso de cláusulas de agrupación de información para obtener datos agregados: [API_NodeJS: src/controllers.js Línea: 140](https://github.com/JuanAndresSalas/API_NodeJS/blob/main/src/controllers.js)

#### Algorítmo de cálculo y manipulación de archivos de texto
- Uso general del lenguaje, sintáxis, selección de tipos de dato, sentencias lógicas, expresiones, operaciones y comparaciones: Ejemplos: API_NodeJS/routes/router.js [1](https://github.com/JuanAndresSalas/API_NodeJS/blob/main/routes/router.js) , Proyecto-Personal-Bootcamp---NodeJs/src/public/js/subir.js [2](https://github.com/JuanAndresSalas/Proyecto-Personal-Bootcamp---NodeJs/blob/master/src/public/js/subir.js)
- Uso de sentencias repetitivas: [Proyecto-Personal-Bootcamp---NodeJs src/routes/routes.js Línea: 242](https://github.com/JuanAndresSalas/Proyecto-Personal-Bootcamp---NodeJs/blob/master/src/routes/routes.js)
- Convenciones y estilos de programación: [Proyecto-Personal-Bootcamp---NodeJs src/routes/routes.js](https://github.com/JuanAndresSalas/Proyecto-Personal-Bootcamp---NodeJs/blob/master/src/routes/routes.js)
- Utilización correcta de estructuras de datos[Proyecto-Personal-Bootcamp---NodeJs src/public/js/subir.js](https://github.com/JuanAndresSalas/Proyecto-Personal-Bootcamp---NodeJs/blob/master/src/public/js/subir.js)
- Manipulación de archivos: Frontend: [http://localhost:3000/subir-oferta](http://localhost:3000/subir-oferta),JS: [Proyecto-Personal-Bootcamp---NodeJs src/public/js/subir.js Línea: 23](https://github.com/JuanAndresSalas/Proyecto-Personal-Bootcamp---NodeJs/blob/master/src/public/js/subir.js)

#### Página Web y HTML
- Uso de tags html, estilos y responsividad - Uso de Bootstrap: [Proyecto-Personal-Bootcamp---NodeJs src/views](https://github.com/JuanAndresSalas/Proyecto-Personal-Bootcamp---NodeJs/tree/master/src/views) , en esta carpeta se encuentran los archivos HBS donde se implementa  HTML y Bootstrap

#### Lenguaje Node
- Inclusión de paquetes y librerías de usuario: [Proyecto-Personal-Bootcamp---NodeJs package.json](https://github.com/JuanAndresSalas/Proyecto-Personal-Bootcamp---NodeJs/blob/master/package.json) , [API_NodeJS package.json](https://github.com/JuanAndresSalas/API_NodeJS/blob/main/package.json), [Ejemplo en código: Proyecto-Personal-Bootcamp---NodeJs/src/routes/routes.js Línea: 1](https://github.com/JuanAndresSalas/Proyecto-Personal-Bootcamp---NodeJs/blob/master/src/routes/routes.js)
- Agrupación del código y separación por funcionalidad: En la siguiente carpeta se encuentran distintas funcionalidades separadas en archivos y funciones [API_NodeJS src](https://github.com/JuanAndresSalas/API_NodeJS/tree/main/src)
- Utilización de funciones asíncronas: [Proyecto-Personal-Bootcamp---NodeJs src/routes/routes.js](https://github.com/JuanAndresSalas/Proyecto-Personal-Bootcamp---NodeJs/blob/master/src/routes/routes.js), [API_NodeJS src/controllers.js](https://github.com/JuanAndresSalas/API_NodeJS/blob/main/src/controllers.js)
- Lectura de parámetros de entrada: [Proyecto-Personal-Bootcamp---NodeJs src/public/js/contacto.js Línea: 7](https://github.com/JuanAndresSalas/Proyecto-Personal-Bootcamp---NodeJs/blob/master/src/public/js/contacto.js)

#### Conexión a Base de Datos
- Manejo de conexión a base de datos desde Node: Implementada con ORM Sequelize [API_NodeJS src/models.js](https://github.com/JuanAndresSalas/API_NodeJS/blob/main/src/models.js)
- Manejo y ejecución de consultas desde Node: Implementada con ORM Sequelize [API_NodeJS src/controllers.js](https://github.com/JuanAndresSalas/API_NodeJS/blob/main/src/controllers.js)

#### Uso de Express
- Creación servicio Rest con Express: [API_NodeJS](https://github.com/JuanAndresSalas/API_NodeJS)
