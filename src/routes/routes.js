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
    res.render("index",{autenticacion})
    
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
                            res.render("index",{autenticacion})
                            
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
                                console.log(req.body)
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
                            res.render("index",{autenticacion})
                            
                        }
)

/*Coprobación de login, usando passport.authenticate mediante la estrategia "local" creada anteriormente,
en caso de éxito dirije  a "index", en caso de fallo al autenticar dirije a "login" */
router.post("/ingreso",passport.authenticate("local",{successRedirect: "/index",failureRedirect: "/login"}))

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
                                res.render("subir-oferta",{autenticacion})
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
      res.redirect('/');
    });
});


export default router //Exportar el contenido de este archivo