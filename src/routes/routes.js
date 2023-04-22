//-------------------------------------------------------------- Importación -------------------------------------------------------------------------------
import { Router } from "express";
import bodyParser from "body-parser";
import { body, validationResult } from 'express-validator'; 
import passport from "passport";
import PassportLocal from "passport-local"
import session from "express-session"
import cookieParser from "cookie-parser";
import mysql from "mysql"
import dotenv from "dotenv" 
import flash from "connect-flash"
import { ingresarOferta, obtenerUsuario } from "../controllers/controllers.js";
//-------------------------------------------------------------- Constantes -------------------------------------------------------------------------------
const router = Router()
const PassPortLocal = PassportLocal.Strategy 

//-------------------------------------------------------------- Variables --------------------------------------------------------------------------------
let nombre;
let autenticacion = false;

//------------------------------------------------------- Configuracion de dotenv ------------------------------------------------------------------
dotenv.config() 

//------------------------------------------------------- Conexión base de datos -------------------------------------------------------------------
const conexion = mysql.createPool({
    host: process.env.DB_HOST,
    database: process.env.DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT
});

conexion.getConnection((err,connection)=> {
    if(err)
    throw err;
    console.log('Base de Datos conectada');
;})

//############################################################# MIDDLEWARE ########################################################################

//----------------------------------------------------- configuracion de bodyParser --------------------------------------------------------------
router.use(bodyParser.json({limit: "50mb"}));  
router.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}))

//-------------------------------------------------------- Configuración cookieParser ---------------------------------------------------------------
router.use(cookieParser("secretKey"))

//-------------------------------------------------------- Configuración session --------------------------------------------------------------------
router.use(session({
    secret:"secretKey",
    saveUninitialized: false, 
    resave:true

}))

//---------------------------------------------------------Configuración passport -------------------------------------------------------------------
router.use(passport.initialize())
router.use(passport.session())

//---------------------------------------------------------Configuración flash -------------------------------------------------------------------
router.use(flash())

//----------------------------------------- Creación de la estrategia para la validación de usuarios -------------------------------------------------
passport.use(new PassPortLocal(async function(username,password,done){
    const usuario = await obtenerUsuario(username,password)
    if(!usuario){
        return done(null,false, { message: 'Credenciales incorrectas' })
    }else{
        return done(null,{id:usuario.idusuario, name:usuario.nombre, correo:usuario.correo,apellido:usuario.apellido})
    }    
}))

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null,user)
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
                            if(req.isAuthenticated()){
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
                                
                                conexion.query(`SELECT * from usuarios where correo LIKE ?`,[correo], (error,response,fields) =>{
                                   if(error){
                                        throw error
                                    }else{
                                        let usuario = response
                                        if(usuario.length > 0){
                                            res.send("<script>alert('Correo ya se encuentra registrado');window.location.href = 'http://localhost:3000/registro'</script>")
                                        }else{
                                            conexion.query(`INSERT INTO usuarios(nombre,apellido,correo,contrasena)
                                                            VALUES (?,?,?,?);`,[nombre,apellido,correo,contra], (error,response,fields) =>{
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
/*Comprobación de login, usando passport.authenticate mediante la estrategia "local" creada anteriormente,
en caso de éxito dirige  a "index", en caso de fallo al autenticar dirige a "login" */
router.post("/ingreso",passport.authenticate("local",{failureRedirect:"/login", failureFlash: true}),
                        function(req, res){
                                
                                nombre = req.session.passport.user.name
                                autenticacion = true
                                res.render("index",{autenticacion,nombre})
                        
                        }                  
)

//-------------------------------------------------------------- Subir oferta -------------------------------------------------------------------

/*A esta ruta solo pueden acceder los usuarios logeados, 
esto se logra usando  isAuthenticated() de passport como parámetro del router.get()*/
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
                            body("latitud").notEmpty(),
                            body("longitud").notEmpty(),
                            body("categoria").isString().notEmpty(),
                            async (req, respuesta) =>{
                                let error = validationResult(req)
                                if ( !error.isEmpty()) {
                                    console.log(error.array());
                                    return respuesta.json({error: error.array() });
                                }else{
                                    req.body.id = req.session.passport.user.id
                                    try{
                                        let resultado = await ingresarOferta(req.body)  
                                        console.log(resultado)
                                    }catch(error){
                                        console.log(error)
                                    }
                                    
                                }
                            }
)


//-------------------------------------------------------------- Buscar oferta -------------------------------------------------------------------

router.get("/busqueda",(req, res) =>{
    res.render("busqueda")
})

router.get("/buscar", (req, response)=>{
    let busqueda = "%" + req.query.busqueda.toString() + "%"
    console.log( busqueda)
    let query = {
        name: 'get-ofertas',
        text: "SELECT * FROM oferta o JOIN subcategoria s on(s.idsubcategoria = o.subcategoria_idsubcategoria) JOIN categoria c on(s.idsubcategoria = c.idcategoria) WHERE s.nombre LIKE ? OR c.nombre LIKE ?",
        values: [busqueda],
        rowMode: 'array',
    }
    conexion.query(query.text,[busqueda],
        (error, res)=>{
            if(error){
                throw error
            }else{
                console.log(res)
            }
        
    })
    
    
})



//-------------------------------------------------------- Página de información -------------------------------------------------------------
router.get("/que-es-ofertapp", (req,res,next) =>{  
                                    if(req.isAuthenticated()){ 
                                        autenticacion = true
                                        return next()
                                    }else{
                                        autenticacion = false 
                                        next()
                                    }
                                }, (req, res) =>{
                                    res.render("que-es-ofertapp",{autenticacion,nombre})
                                }

)


//-------------------------------------------------------- Página de contacto -------------------------------------------------------------

router.get("/contacto",(req,res,next) =>{  
                            if(req.isAuthenticated()){ 
                                autenticacion = true
                                let apellido= req.session.passport.user.apellido
                                let correo = req.session.passport.user.correo
                                res.render("contacto",{autenticacion,nombre,apellido,correo})
                            }else{
                                autenticacion = false 
                                res.render("contacto",{autenticacion,nombre})
                            }
                        }
)

               
router.post("/contacto",body("correo").isString().notEmpty(),
                        body("nombre").isString().notEmpty(),
                        body("mensaje").isString().notEmpty(),
                        (req, res) =>{
                            let error = validationResult(req)
                            if ( !error.isEmpty()) {
                                console.log(error.array());
                                return res.json({error: error.array() });
                                
                            }else{
                                res.send("<script>alert('Mensaje enviado!'); window.location.href = 'http://localhost:3000/index'</script>")
                            }
})

//-------------------------------------------------------- Terminar sesión de usuario -------------------------------------------------------------
router.get('/logout',(req, res, next) =>{
    req.logout(function(err) {
      if (err) { return next(err); }
      res.render('index');
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