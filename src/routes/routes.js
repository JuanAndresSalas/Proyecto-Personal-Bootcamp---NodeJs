//Importación
import { Router } from "express";
import bodyParser from "body-parser";
import { body, validationResult } from 'express-validator';
import passport from "passport";
import PassportLocal from "passport-local"
import session from "express-session"
import cookieParser from "cookie-parser";
import fs from "fs"

import {leerArchivo} from "../functions/functions.js"

//Constantes
const router = Router()
const PassPortLocal = PassportLocal.Strategy
const rutaUsuarios = "data/usuarios.json"


//Middleware

router.use(bodyParser.json({limit: "50mb"}));
router.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}))
router.use(cookieParser("secreto"))
router.use(session({
    secret:"secreto",
    saveUninitialized: true, 
    resave:true
}))
router.use(passport.initialize())
router.use(passport.session())

passport.use("local",new PassPortLocal(function(username,password,done){
    if(username == "juan.salass@outlook.com" && password == "1234"){
               
        return done(null,{id:1, name:"juan"})
    
    }
    done(null,false)
    
}))

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {

    done(null,{id:1, name:"juan"})

});


 
//Rutas
router.get("/", (req, res) =>{
    res.render("index")
})

router.get("/index", (req,res) => {
    res.render("index")
})

router.get("/subir-oferta",(req, res) =>{
    res.render("subir-oferta")
})

router.get("/login", (req, res) =>{
    res.render("login")
})

router.post("/oferta-nueva",
                            body("precio").isNumeric().notEmpty(),
                            body("imagen").isString(),
                            body("descripcion").isString().notEmpty(),
                            body("lugar").notEmpty().isString(),
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
})

router.post("/ingreso",passport.authenticate("local",{
                            successRedirect: "/",
                            failureRedirect: "login"
                        }))
export default router //Exportar el contenido de este archivo