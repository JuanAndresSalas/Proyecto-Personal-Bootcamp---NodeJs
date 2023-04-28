//Importar express
import express from "express"; 



//Siguentes dos import son para configurar la ruta donde se guardan las views
import {dirname, join} from "path"; //join sirve para concatenar el path con el nombre de la carpeta donde estan las views
import {fileURLToPath} from "url";

//Importar rutas desde archivo routes en carpeta src\routes
import indexRoutes from "./routes/routes.js"

 //Asignar express a una constante
const app = express();

// __dirname es donde quedará guardado de forma dínamica el path de los archivos en caso de mover el proyecto a otra carpeta o dirección
export const __dirname = dirname(fileURLToPath(import.meta.url))

//Configuración de carpeta public, donde iran los css
app.use(express.static(join(__dirname,"/public")))

//Configuración de carpeta donde están los script
app.use(express.static(join(__dirname,"/js")))

//Configuración de Handlebars//
import hbs from "hbs"; 
hbs.registerPartials(__dirname + '/views/partials'); //Configurar direccion de partials 
app.set("views", join(__dirname,"views")) //Segundo parámetro es el path obtenido en la constante __dirname mas "views" que es el nombre de la carpeta, concatenados con la funcion join
app.set("view engine", "hbs");

//Configurar que express use las rutas del archivo routes.js
app.use(indexRoutes)

//Levantar servidor
app.listen(3000, function(){
    console.log("Server is listening in port 3000")
});

