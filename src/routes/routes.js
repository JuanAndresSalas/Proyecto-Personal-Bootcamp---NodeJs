//Importación
import { Router } from "express";
import bodyParser from "body-parser";
import { body, validationResult } from 'express-validator'; 
import passport from "passport";
import PassportLocal from "passport-local"
import session from "express-session"
import cookieParser from "cookie-parser";
import fs from "fs"

import {leerArchivo} from "../functions/functions.js" //Función para leer archivos almacenados en local

//Constantes
const router = Router()
const PassPortLocal = PassportLocal.Strategy //Middleware usado para crear una estrategia de autenticación
const rutaUsuarios = "data/usuarios.json" // Ruta a json con los usuarios "registrados"
const usuarios = await leerArchivo(rutaUsuarios) //Lectura y asignación json a variable usuarios
let nombre;
//Variable
let autenticacion = false;


//Middleware

//configuracion de bodyParser
router.use(bodyParser.json({limit: "50mb"}));  //Por el tamaño del string de la imagen se aumenta la clave "limit"
router.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}))

//Configuración cookieParser
router.use(cookieParser("secretKey")) //El string puede ser cualquier texto

//Configuración session

router.use(session({
    secret:"secretKey",
    saveUninitialized: true, 
    resave:true

}))

//Configuración passport
router.use(passport.initialize())
router.use(passport.session())

//Creación de la estrategia a usar para la validación de usuarios
passport.use(new PassPortLocal(function(username,password,done){
    for (let index = 0; index < usuarios.length; index++) {
        let element = usuarios[index];
        if(username == element.correo && password == element.password){
           
            return done(null,{id:element.id, name:element.nombre})
        }
    }
    return done(null,false)
}))

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    done(null,{id})
});

//Rutas
router.get("/", (req,res,next) =>{                  
    if(req.isAuthenticated()){ //Si ya está autenticado seguira al siguiente parámetro que ingresemos a router.get()
        autenticacion = true
        return next()
    }else{
        autenticacion = false
        return next()
    }
},
 (req, res) =>{
    res.render("index",{autenticacion},nombre)
    
    
})


router.get("/login", (req, res) =>{
    res.render("login")
})

router.get("/registro", (req,res,next) =>{   
                            if(req.isAuthenticated()){ //Si ya está autenticado seguira al siguiente parámetro que ingresemos a router.get()
                                autenticacion = true
                                return next()
                            }else{
                                autenticacion = false
                                res.render("registro")
                            }
                        },
                        (req, res) =>{
                            res.render("index",{autenticacion,nombre})
                            
                        }
)

router.post("/formregistro", body("correo").isEmail().notEmpty(),
                             body("nombre").isString().notEmpty(),
                             body("apellido").isString().notEmpty(),
                             body("apellido").isString().notEmpty(),
                             body("password").isString().notEmpty(),
                             (req,res,next) =>{   
                                if(req.isAuthenticated()){
                                    autenticacion = false
                                    res.render("index")
                                }else{
                                    autenticacion = true
                                    return next()
                                }
                            },(req, res) =>{
                                let comprobacion = usuarios.find(usuario => usuario.correo == req.body.correo)
                                
                                if(comprobacion){
                                    res.send("<script>alert('Usuario ya está registrado');window.location.href = 'http://localhost:3000/registro'</script>")

                                }else{

                                    let arregloID = usuarios.map(usuario => usuario.id)
                                    arregloID.sort((a,b) => b - a)
                                    let nuevoUsuario ={
                                        "id": arregloID[0] + 1,
                                        "nombre": req.body.nombre,
                                        "apellido": req.body.apellido,
                                        "correo": req.body.correo,
                                        "password": req.body.password
                                    }
                                    usuarios.push(nuevoUsuario)

                                    fs.writeFile("data/usuarios.json", JSON.stringify(usuarios), (err) =>{
                                        if(err){
                                            console.log("ERROR: ", err)
                                        }else{
                                            res.send("<script>alert('Usuario registrado con éxito');window.location.href = 'http://localhost:3000/index'</script>")
                                        }
                                    } )

                                }
                                
                                 
                            }


)

router.get("/index", (req,res,next) =>{ 
                            if(req.isAuthenticated()){ //Si ya está autenticado seguira al siguiente parámetro que ingresemos a router.get()
                                autenticacion = true
                                return next()
                            }else{
                                autenticacion = false
                                return next()
                            }
                        },
                         (req, res) =>{
                            res.render("index",{autenticacion,nombre})
                            
                        }
)

/*Coprobación de login, usando passport.authenticate mediante la estrategia "local" creada anteriormente,
en caso de éxito dirije  a "index", en caso de fallo al autenticar dirije a "login" */
router.post("/ingreso",passport.authenticate("local",{failureRedirect: "/login"}),
                        function(req, res){
                            let nombreUsuario = usuarios.find(usuario => usuario.correo == req.body.username)
                            req.session.userName = nombreUsuario
                            autenticacion = true
                             nombre = req.session.userName.nombre
                            res.render("index",{autenticacion,nombre})
                        }                  
)

/*A esta ruta solo pueden acceder los usuarios logeados, 
esto se logra usando el isAuthenticated() de passport como parámetro del router.get()*/

router.get("/subir-oferta", (req,res,next) =>{  
                                
                                if(req.isAuthenticated()){ //Si ya está autenticado seguira al siguiente parámetro que ingresemos a router.get()
                                    autenticacion = true
                                    return next()
                                }else{
                                    res.redirect("/login") //Si aún no está autenticado, redirigirá a "login"
                                }
                            },
                            (req, res) =>{ //Con las comprobaciones anteriores exitosas pasa a renderizar la vista "subir-oferta"
                                res.render("subir-oferta",{autenticacion,nombre})
                            }
)


/*Recepción del formulario con action="oferta-nueva", validado mediante el uso de body de express-validator,
body recibe como parámetro el name del input que enviamos al servidor y
se encadenan funciones en virtud de la comprobación*/
router.post("/oferta-nueva",
                            body("precio").isNumeric().notEmpty(), //Ejemplo: comprueba que "precio" sea un número y no esté vacío
                            body("imagen").isString(),
                            body("descripcion").isString().notEmpty(),
                            body("lugar").notEmpty().isString(),
                            body("latitud").isNumeric().notEmpty(),
                            body("longitud").isNumeric().notEmpty(),
                            (req, res) =>{
                                let error = validationResult(req)
                                if ( !error.isEmpty()) {
                                    console.log(error.array());
                                    return res.json({error: error.array() });
                                }else{
                                    let archivoOfertas = JSON.parse(fs.readFileSync("./BD/ofertas.json"))
                                    let imagen = req.body.imagen
                                    let lugar = req.body.lugar
                                    let precio = req.body.precio
                                    let descripcion = req.body.descripcion
                                }
                            }
)

//Terminar sesión de usuario
router.get('/logout', function(req, res, next){
    req.logout(function(err) {
      if (err) { return next(err); }
      nombre = undefined
      res.redirect('/');
    });
});


export default router //Exportar el contenido de este archivo