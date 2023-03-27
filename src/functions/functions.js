 import * as fs from "fs"

 
 export async function leerArchivo(url) {
    let data = await fs.promises.readFile(url, (err, data) => {
        if (err) throw err 
        return data
    });
    return await JSON.parse(data);
}

export function obtenerUsuario(username){
    let usuario = conexion.query(`SELECT correo, contrasena,idusuario,nombre from usuario where correo LIKE '${username}'`, (error,res,fields) =>{
        if(error){
            throw error
        }else{
            return res
        }
    })
    
}
