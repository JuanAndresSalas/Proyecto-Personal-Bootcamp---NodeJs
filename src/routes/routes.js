//-------------------------------------------------------------- Importación -------------------------------------------------------------------------------
import { Router } from "express";
import bodyParser from "body-parser";
import { body, validationResult } from 'express-validator';
import passport from "passport";
import PassportLocal from "passport-local"
import session from "express-session"
import cookieParser from "cookie-parser";
import dotenv from "dotenv"
import flash from 'express-flash'



import { borrarOferta, busquedaOfertas, infoUsuariosConOfertas, ingresarOferta, nuevoUsuario, obtenerCategorias, obtenerOfertasAdmin, obtenerUsuario, ofertasSugeridas } from "../controllers/controllers.js";
import { encriptarPassword } from "../controllers/encriptacion.js";
import { __dirname } from "../index.js";
import { formatoPrecio } from "../js/functions.js";
//-------------------------------------------------------------- Constantes -------------------------------------------------------------------------------
const router = Router()
const PassPortLocal = PassportLocal.Strategy

//-------------------------------------------------------------- Variables --------------------------------------------------------------------------------
let nombre;
let autenticacion = false;
let mensajeError

//------------------------------------------------------- Configuracion de dotenv ------------------------------------------------------------------
dotenv.config()


//############################################################# MIDDLEWARE ########################################################################

//----------------------------------------------------- configuracion de bodyParser --------------------------------------------------------------
router.use(bodyParser.json({ limit: "50mb" }));
router.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }))

//-------------------------------------------------------- Configuración cookieParser ---------------------------------------------------------------
router.use(cookieParser("secretKey"))

//-------------------------------------------------------- Configuración session --------------------------------------------------------------------
router.use(session({
    secret: "secretKey",
    saveUninitialized: false,
    resave: true

}))

//---------------------------------------------------------Configuración flash -------------------------------------------------------------------
router.use(flash())
//---------------------------------------------------------Configuración passport -------------------------------------------------------------------
router.use(passport.initialize())
router.use(passport.session())


//----------------------------------------- Creación de la estrategia para la validación de usuarios -------------------------------------------------
passport.use(new PassPortLocal(async function (username, password, done) {

    const usuario = await obtenerUsuario(username, password)
    if (!usuario) {
        mensajeError = { mensaje: 'Credenciales incorrectas' }
        return done(null, false)
    } else {
        if (usuario.admin == 1) {
            return done(null, { id: usuario.idusuario, name: usuario.nombre, correo: usuario.correo, apellido: usuario.apellido, admin: true })
        } else {
            return done(null, { id: usuario.idusuario, name: usuario.nombre, correo: usuario.correo, apellido: usuario.apellido })
        }

    }
}))

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user)
});

//################################################################ RUTAS ########################################################################

//-------------------------------------------------------------- Principal ----------------------------------------------------------------------
router.get("/", (req, res, next) => {
    if (req.isAuthenticated()) { //Si ya está autenticado seguira al siguiente parámetro que ingresemos a router.get()
        autenticacion = true
        return next()
    } else {
        autenticacion = false
        return next()
    }
},
    (req, res) => {
        res.render("index", { autenticacion }, nombre)
    })

router.get("/index", (req, res, next) => {
    if (req.isAuthenticated()) { //Si ya está autenticado seguira al siguiente parámetro que ingresemos a router.get()
        autenticacion = true
        let admin = req.session.passport.user.admin
        if (admin) {
            res.render("index", { autenticacion, nombre, admin })
        } else {
            res.render("index", { autenticacion, nombre })
        }
    } else {
        res.render("index")
    }
})


//-------------------------------------------------------------- Registro -----------------------------------------------------------------------
router.get("/registro", (req, res, next) => {
    if (req.isAuthenticated()) {
        autenticacion = true
        res.render("index", { autenticacion, nombre })
    } else {
        autenticacion = false
        res.render("registro")
    }
})

router.post("/formregistro", body("correo").isEmail().notEmpty(),
    body("nombre").isString().notEmpty(),
    body("apellido").isString().notEmpty(),
    body("password").isString().notEmpty(),
    (req, res, next) => {
        if (req.isAuthenticated()) {
            res.render("index")
        } else {
            return next()
        }
    },
    async (request, res) => {
        request.body.password = encriptarPassword(request.body.password)
        try {
            let respuestaCreacion = await nuevoUsuario(request.body)
            res.render("registro", { respuestaCreacion })
        } catch (error) {
            res.render("registro", { mensaje: "Error al ingresar usuario" })
            console.log(error)
        }

    }
)

//---------------------------------------------------------------- Login ------------------------------------------------------------------------- 
router.get("/login", (req, res) => {
    res.render("login", { mensajeError })
})
/*Comprobación de login, usando passport.authenticate mediante la estrategia "local" creada anteriormente,
en caso de éxito dirige  a "index", en caso de fallo al autenticar dirige a "login" */
router.post("/ingreso", passport.authenticate("local", { failureRedirect: "/login" }),
    async (req, res) => {
        nombre = req.session.passport.user.name
        let admin = req.session.passport.user.admin
        if (admin) {
            autenticacion = true
            mensajeError = false
            res.render("index", { autenticacion, nombre, admin })
        } else {
            autenticacion = true
            mensajeError = false
            res.render("index", { autenticacion, nombre })
        }


    }
)

//-------------------------------------------------------------- Subir oferta -------------------------------------------------------------------

/*A esta ruta solo pueden acceder los usuarios logeados, 
esto se logra usando  isAuthenticated() de passport como parámetro del router.get()*/
router.get("/subir-oferta", (req, res, next) => {

    if (req.isAuthenticated()) { //Si ya está autenticado seguira al siguiente parámetro que ingresemos a router.get()
        autenticacion = true
        return next()
    } else {
        res.redirect("/login") //Si aún no está autenticado, redirigirá a "login"
    }
},
    async (req, res) => { //Con las comprobaciones anteriores exitosas pasa a renderizar la vista "subir-oferta"
        try {
            let data = await obtenerCategorias()
            //Uso de sentencias repetitivas
            let categorias = data.map(element => element.nombre)
            res.render("subir-oferta", { autenticacion, nombre, categorias })
        } catch (error) {
            console.log(error)
            res.render("subir-oferta")
        }



    }
)

/*Recepción del formulario con action="oferta-nueva", validado mediante el uso de body de express-validator,
body recibe como parámetro el name del input que enviamos al servidor y
se encadenan funciones en virtud de la comprobación*/
router.post("/oferta-nueva", body("precio").isNumeric().notEmpty(), //Ejemplo: comprueba que "precio" sea un número y no esté vacío
    body("imagen").isString(),
    body("descripcion").isString().notEmpty(),
    body("lugar").notEmpty().isString(),
    body("latitud").notEmpty(),
    body("longitud").notEmpty(),
    body("categoria").isString().notEmpty(),
    async (req, res) => {
        let error = validationResult(req)
        if (!error.isEmpty()) {
            console.log(error.array());
            return res.send({ mensaje: "ERROR: Oferta no se ha guardado" })
        } else {
            req.body.id = req.session.passport.user.id
            try {
                let resultado = await ingresarOferta(req.body)

                res.send({ mensaje: "Oferta ingresada con éxito" })

            } catch (error) {
                console.log(error)
                res.send("subir-oferta", { mensaje: "ERROR: Oferta no se ha guardado" })
            }
        }
    }
)



//-------------------------------------------------------------- Buscar oferta -------------------------------------------------------------------

router.get("/busqueda", async (req, res, next) => {
    if (req.isAuthenticated()) {
        autenticacion = true
        let data = await ofertasSugeridas()
        let respuesta = await data.json()
        let admin = req.session.passport.user.admin
        //Uso de sentencias repetitivas
        respuesta.forEach(oferta => {
            if (oferta.imagen == null) {
                oferta.imagen = "/img/logo.jpg"
            }
            oferta.precio = formatoPrecio(oferta.precio)
        });

        if (admin) {
            res.render("busqueda", { respuesta, autenticacion, admin, nombre })
        } else {
            res.render("busqueda", { respuesta, autenticacion, nombre })
        }
    } else {
        autenticacion = false
        let data = await ofertasSugeridas()
        let respuesta = await data.json()

        respuesta.forEach(oferta => {
            if (oferta.imagen == null) {
                oferta.imagen = "/img/logo.jpg"
            }
            oferta.precio = formatoPrecio(oferta.precio)
        });

        res.render("busqueda", { respuesta, autenticacion, nombre })
    }
})

router.get("/buscar", async (req, res, next) => {
    let {busqueda} = req.query
    if (req.isAuthenticated()) { //Si ya está autenticado seguira al siguiente parámetro que ingresemos a router.get()
        autenticacion = true
        try {
            let respuesta = await busquedaOfertas(busqueda)
            let admin = req.session.passport.user.admin
            respuesta.forEach(oferta => {
                if (oferta.imagen == null) {
                    oferta.imagen = "/img/logo.jpg"
                }

                oferta.precio = formatoPrecio(oferta.precio)
            });
            res.render("resultados", { autenticacion, respuesta, nombre, admin })

        } catch (error) {
            console.log(error)
            res.render("resultados", { autenticacion, nombre })
        }
    } else {
        autenticacion = false
        try {
            let respuesta = await busquedaOfertas(busqueda)
            respuesta.forEach(oferta => {
                if (oferta.imagen == null) {
                    oferta.imagen = "/img/logo.jpg"
                }

                oferta.precio = formatoPrecio(oferta.precio)
            });
            res.render("resultados", { autenticacion, respuesta, nombre })
        } catch (error) {
            console.log(error)

        }

    }
})



//-------------------------------------------------------- Página de información -------------------------------------------------------------
router.get("/que-es-ofertapp", (req, res, next) => {
    if (req.isAuthenticated()) {
        autenticacion = true
        let admin = req.session.passport.user.admin
        if (admin) {
            res.render("que-es-ofertapp", { autenticacion, nombre, admin })
        } else {
            res.render("que-es-ofertapp", { autenticacion, nombre })
        }
    } else {
        autenticacion = false
        res.render("que-es-ofertapp", { autenticacion })
    }
}

)


//-------------------------------------------------------- Página de contacto -------------------------------------------------------------

router.get("/contacto", (req, res, next) => {
    if (req.isAuthenticated()) {
        autenticacion = true
        let apellido = req.session.passport.user.apellido
        let correo = req.session.passport.user.correo
        let admin = req.session.passport.user.admin
        res.render("contacto", { autenticacion, nombre, apellido, correo, admin })
    } else {
        autenticacion = false
        res.render("contacto", { autenticacion, nombre })
    }
}
)


router.post("/contacto", body("correo").isString().notEmpty(),
    body("nombre").isString().notEmpty(),
    body("mensaje").isString().notEmpty(),
    (req, res) => {
        let error = validationResult(req)
        if (!error.isEmpty()) {
            console.log(error.array());
            return res.json({ error: error.array() });

        } else {
            res.send("<script>alert('Mensaje enviado!'); window.location.href = 'http://localhost:3000/index'</script>")
        }
    }
)

//-------------------------------------------------------- Ingreso Administrador -------------------------------------------------------------

router.get("/admin", async (req, res, next) => {
    if (req.isAuthenticated()) {
        autenticacion = true
        let admin = req.session.passport.user.admin
        if (admin) {
            let usuarios = await infoUsuariosConOfertas()
            let info = await usuarios.json()

            let infoOfertas = await obtenerOfertasAdmin()
            let ofertas = await infoOfertas.json()
            ofertas.forEach(oferta => {
                if (oferta.imagen == null) {
                    oferta.imagen = "Sin Imagen"
                }
            })
            res.render("admin", { autenticacion, nombre, info, ofertas, admin })
        } else {
            res.render("index", { autenticacion, nombre })
        }

    } else {
        autenticacion = false
        res.render("index", { autenticacion })
    }
})


router.post("/borrar-oferta-admin", async (req, res, next) => {
    if (req.isAuthenticated()) {
        let { id } = req.body
        let respuesta = await borrarOferta(id)
        res.send(respuesta)
    } else {
        autenticacion = false
        res.render("index", { autenticacion })
    }
});

//-------------------------------------------------------- Terminar sesión de usuario -------------------------------------------------------------
router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.render('index');
    });

});

//------------------------------------------------------------ Dirección Erronea ----------------------------------------------------------------
router.get("*", (req, res, next) => {
    if (req.isAuthenticated()) {
        let admin = req.session.passport.user.admin
        autenticacion = true
        res.render("error", { autenticacion, nombre, admin })
    } else {
        res.render("error")
    }
})

export default router //Exportar el contenido de este archivo


