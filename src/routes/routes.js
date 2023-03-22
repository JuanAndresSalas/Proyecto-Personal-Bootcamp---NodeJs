import { Router } from "express";
import bodyParser from "body-parser";
import { body, validationResult } from 'express-validator';
const router = Router()
import fs from "fs"

router.use(bodyParser.json({limit: "50mb"}));
router.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}))

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

export default router //Exportar el contenido de este archivo