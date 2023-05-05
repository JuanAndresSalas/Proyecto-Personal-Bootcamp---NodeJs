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



import { busquedaOfertas, infoUsuariosConOfertas, ingresarOferta, nuevoUsuario, obtenerCategorias, obtenerUsuario, ofertasSugeridas } from "../controllers/controllers.js";
import { encriptarPassword } from "../controllers/encriptacion.js";
import { __dirname } from "../index.js";
//-------------------------------------------------------------- Constantes -------------------------------------------------------------------------------
const router = Router()
const PassPortLocal = PassportLocal.Strategy

//-------------------------------------------------------------- Variables --------------------------------------------------------------------------------
let nombre;
let autenticacion = false;
let subidaOferta
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
        return done(null, false, { message: 'Credenciales incorrectas' })
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
        return next()
    } else {
        autenticacion = false
        return next()
    }
},
    (req, res) => {
        
        res.render("index", { autenticacion, nombre })
        
    }
)


//-------------------------------------------------------------- Registro -----------------------------------------------------------------------
router.get("/registro", (req, res, next) => {
    if (req.isAuthenticated()) {
        autenticacion = true
        return next()
    } else {
        autenticacion = false

        res.render("registro")
    }
},
    (req, res) => {
        res.render("index", { autenticacion, nombre })

    }
)

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
            res.render("registro", { error })
            console.log(error)
        }

    }
)

//---------------------------------------------------------------- Login ------------------------------------------------------------------------- 
router.get("/login", (req, res) => {
    res.render("login")
})
/*Comprobación de login, usando passport.authenticate mediante la estrategia "local" creada anteriormente,
en caso de éxito dirige  a "index", en caso de fallo al autenticar dirige a "login" */
router.post("/ingreso", passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }),
    async (req, res) => {
        nombre = req.session.passport.user.name
        if (req.session.passport.user.admin) {
            autenticacion = true
            let data = await infoUsuariosConOfertas()
            let info = await data.json()
            res.render("admin", { autenticacion, nombre, info })
        } else {
            autenticacion = true

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
            res.render("subir-oferta", { autenticacion, nombre, categorias, subidaOferta })
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
            return res.json({ error: error.array() });
        } else {
            req.body.id = req.session.passport.user.id
            try {

                let resultado = await ingresarOferta(req.body)
                res.send(resultado)
                subidaOferta = true
            } catch (error) {
                console.log(error)
            }
        }
    }
)


//-------------------------------------------------------------- Buscar oferta -------------------------------------------------------------------

router.get("/busqueda", (req, res, next) => {
    if (req.isAuthenticated()) { //Si ya está autenticado seguira al siguiente parámetro que ingresemos a router.get()
        autenticacion = true
        return next()
    } else {
        autenticacion = false
        return next()
    }
}, async (req, res) => {
    let data = await ofertasSugeridas()
    let respuesta = await data.json()
    respuesta.forEach(oferta => {
        if (oferta.imagen == null) {
            oferta.imagen = "/img/logo.jpg"
        }
    });
    res.render("busqueda", { respuesta, autenticacion })
})

router.get("/buscar", (req, res, next) => {

    if (req.isAuthenticated()) { //Si ya está autenticado seguira al siguiente parámetro que ingresemos a router.get()
        autenticacion = true
        return next()
    } else {
        autenticacion = false
        return next()
    }
}, async (req, res) => {
    let busqueda = req.query.busqueda

    try {
        let respuesta = await busquedaOfertas(busqueda)
        respuesta.forEach(oferta => {
            if (oferta.imagen == null) {
                oferta.imagen = "https://cdnx.jumpseller.com/mundovape/image/8300958/estrella-ofertas.png.png?1587356263"
            }
        });
        res.render("resultados", { autenticacion, respuesta, nombre })
    } catch (error) {
        console.log(error)
        res.render("resultados", { autenticacion, nombre })
    }



})



//-------------------------------------------------------- Página de información -------------------------------------------------------------
router.get("/que-es-ofertapp", (req, res, next) => {
    if (req.isAuthenticated()) {
        autenticacion = true
        return next()
    } else {
        autenticacion = false
        next()
    }
}, (req, res) => {
    res.render("que-es-ofertapp", { autenticacion, nombre })
}

)


//-------------------------------------------------------- Página de contacto -------------------------------------------------------------

router.get("/contacto", (req, res, next) => {
    if (req.isAuthenticated()) {
        autenticacion = true
        let apellido = req.session.passport.user.apellido
        let correo = req.session.passport.user.correo
        res.render("contacto", { autenticacion, nombre, apellido, correo })
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

//-------------------------------------------------------- Perfil -------------------------------------------------------------

router.get("/admin", (req, res, next) => {
    if (req.isAuthenticated()) {
        autenticacion = true
        let apellido = req.session.passport.user.apellido
        let correo = req.session.passport.user.correo
        res.render("contacto", { autenticacion, nombre, apellido, correo })
    } else {
        autenticacion = false
        res.render("ind", { autenticacion, nombre })
    }
})

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
        autenticacion = true
        res.render("error", { autenticacion, nombre })
    } else {
        res.render("error")
    }
})

export default router //Exportar el contenido de este archivo


