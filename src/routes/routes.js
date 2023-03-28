//-------------------------------------------------------------- Importación -------------------------------------------------------------------------------
import { Router } from "express";
import bodyParser from "body-parser";
import { body, validationResult } from 'express-validator'; 
import passport from "passport";
import PassportLocal from "passport-local"
import session from "express-session"
import cookieParser from "cookie-parser";
import fs from "fs"
import mysql from "mysql"
import dotenv from "dotenv" //dotenv para proteger los datos de la base de datos

//-------------------------------------------------------------- Constantes -------------------------------------------------------------------------------
const router = Router()
const PassPortLocal = PassportLocal.Strategy //Middleware para crear la estrategia de autenticación

//-------------------------------------------------------------- Variables --------------------------------------------------------------------------------
let nombre;
let autenticacion = false;

//------------------------------------------------------- Configuracion de dotenv ------------------------------------------------------------------
dotenv.config() 

//------------------------------------------------------- Conexión base de datos -------------------------------------------------------------------
const conexion = mysql.createConnection({
    host: process.env.DB_HOST,
    database: process.env.DB,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
});

conexion.connect((error) =>{
   if(error){
       throw error
   }else{
       console.log("conexion exitosa")
   }
})

//############################################################# MIDDLEWARE ########################################################################

//----------------------------------------------------- configuracion de bodyParser --------------------------------------------------------------
router.use(bodyParser.json({limit: "50mb"}));  
router.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}))

//-------------------------------------------------------- Configuración cookieParser ---------------------------------------------------------------
router.use(cookieParser("secretKey"))

// ------------------------------------------------------- Configuración session --------------------------------------------------------------------
router.use(session({
    secret:"secretKey",
    saveUninitialized: true, 
    resave:true

}))

//---------------------------------------------------------Configuración passport -------------------------------------------------------------------
router.use(passport.initialize())
router.use(passport.session())

//----------------------------------------- Creación de la estrategia a usar para la validación de usuarios -------------------------------------------------
passport.use(new PassPortLocal(function(username,password,done){
    let usuario
    conexion.query(`SELECT correo, contrasena,idusuario,nombre from usuario where correo LIKE '${username}'`, (error,res,fields) =>{
        if(error){
            throw error
        }else{
            usuario = res[0]
            if(username == usuario.correo && password == usuario.contrasena){
                nombre = usuario.nombre
                return done(null,{id:usuario.idusuario, name:usuario.nombre})
            }
            return done(null,false)
        }
    })
    
}))

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    done(null,{id})
});

//################################################################ RUTAS ########################################################################

//-------------------------------------------------------------- Principal ----------------------------------------------------------------------
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

//-------------------------------------------------------------- Registro -----------------------------------------------------------------------
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
                             body("password").isString().notEmpty(),
                             (req,res,next) =>{   
                                if(req.isAuthenticated()){
                                    autenticacion = false
                                    res.render("index")
                                }else{
                                    autenticacion = true
                                    return next()
                                }
                            },
                            (request, res) =>{     
                                let correo = request.body.correo;
                                let nombre = request.body.nombre;
                                let apellido = request.body.apellido
                                let contra = request.body.password;
                                
                                conexion.query(`SELECT * from usuario where correo LIKE '${correo}'`, (error,response,fields) =>{
                                   if(error){
                                        throw error
                                    }else{
                                        let usuario = response
                                        if(usuario.length > 0){
                                            res.send("<script>alert('Correo ya se encuentra registrado');window.location.href = 'http://localhost:3000/registro'</script>")
                                        }else{
                                            conexion.query(`INSERT INTO usuario(nombre,apellido,correo,contrasena)
                                                            VALUES ('${nombre}','${apellido}','${correo}','${contra}');`, (error,response,fields) =>{
                                                                if(error){
                                                                    throw error
                                                                }else{
                                                                    res.send("<script>alert('Usuario registrado con éxito');window.location.href = 'http://localhost:3000/index'</script>")
                                                                }
                                            })
                                            
                                        }  
                                    }
                                })
                                
                            }
)

//---------------------------------------------------------------- Login ------------------------------------------------------------------------- 
router.get("/login", (req, res) =>{
    res.render("login")
})
/*Coprobación de login, usando passport.authenticate mediante la estrategia "local" creada anteriormente,
en caso de éxito dirije  a "index", en caso de fallo al autenticar dirije a "login" */
router.post("/ingreso",passport.authenticate("local",{failureRedirect: "/login"}),
                        function(req, res){
                            autenticacion = true
                            res.render("index",{autenticacion,nombre})
                        }                  
)

//-------------------------------------------------------------- Subir oferta -------------------------------------------------------------------

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
                                conexion.query(`SELECT nombre from subcategoria`, (error,response,fields) =>{
                                    if(error){
                                         throw error
                                    }else{
                                        let categorias = response.map(element => element.nombre)
                                        res.render("subir-oferta",{autenticacion,nombre,categorias})
                                    }
                                 })                            
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

//-------------------------------------------------------- Terminar sesión de usuario -------------------------------------------------------------
router.get('/logout',(req, res, next) =>{
    req.logout(function(err) {
      if (err) { return next(err); }
      nombre = undefined
      res.redirect('/');
    });
    
});

//------------------------------------------------------------ Dirección Erronea ----------------------------------------------------------------
router.get("*",  (req,res,next) =>{                
        if(req.isAuthenticated()){ 
            autenticacion = true
            res.render("error",{autenticacion,nombre})
        }else{
            res.render("error") 
        }
    }
)

export default router //Exportar el contenido de este archivo