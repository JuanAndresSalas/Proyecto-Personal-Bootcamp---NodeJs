import dotenv from "dotenv"


dotenv.config()

export async function obtenerUsuario(username,password){
    try{
        const response = await fetch(`http://localhost:4000/v1/ingreso/?username=${username}&password=${password}`)
        const data = await response.json()
        return data

    }catch(error){
        console.log(error)
    }
    
}

export async function ingresarOferta(body){
   
    let {imagen,lugar,precio,descripcion,latitud,longitud,categoria,id} = body
        try{
            let respuesta = await fetch(`http://localhost:4000/v1/crear-oferta/?lugar=${lugar}&descripcion=${descripcion}&latitud=${latitud}&longitud=${longitud}&id=${id}&categoria=${categoria}&precio=${precio}&imagen=${imagen}`,
            {method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': process.env.TOKEN
            }})
            if(respuesta.status == 200){
                let data = await respuesta.json()
                return {mensaje: "Oferta ingresada con éxito"}
            }else{
                return {mensaje: "Error: Oferta no ingresada, intenta nuevamente"}
            }
        }catch(error){
            console.log(error)
            return {mensaje: "Error: Oferta no ingresada, intenta nuevamente"}
        }
    
}

export async function nuevoUsuario(body){
    try {
        let respuesta = await fetch("http://localhost:4000/v1/registrarse", {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                                    nombre: body.nombre,
                                    apellido: body.apellido,
                                    correo: body.correo,
                                    password: body.password
                                })
        })
        
        if(respuesta.status == 200){
            let data = await respuesta.json()
            return {mensaje: "Usuario Ingresado correctamente"}
        }else{
            return {mensaje: "Error al ingresar usuario"}
        }
        
    } catch (error){
        
        console.log(error)
        return {mensaje: "Error al ingresar usuario"}
    }
}

export async function busquedaOfertas(busqueda){
    try{
        let respuesta = await fetch(`http://localhost:4000/v1/buscar-oferta?busqueda=${busqueda}`)
        let data = await respuesta.json()
         
        return data
    }catch(error){
        console.log(error)
        return []
    }
}

export async function ofertasSugeridas(){
    try{
        let ofertas = await fetch(`http://localhost:4000/v1/ofertas-sugeridas`)
        return ofertas
    }catch(error){
        console.log(error)
        return []
    }

}

export async function infoUsuariosConOfertas(){
    try{
        let info = await fetch(`http://localhost:4000/v1/datos-ofertapp`)
        return info
    }catch(error){
        console.log(error)
        return []
    }

}


export async function obtenerCategorias(){
    try{
        let respuesta = await fetch(`http://localhost:4000/v1/buscar-categorias`)
        let data = await respuesta.json()
        return data
    }catch(error){
        console.log(error)
        return []
    }
}

export async function obtenerOfertasAdmin(){
    try{
        let respuesta = await fetch(`http://localhost:4000/v1/obtener-ofertas-admin`)
        return respuesta
        
    }catch(error){
        console.log(error)
        return []
    }
}

export async function borrarOferta(id){
    try {
      let respuesta = await fetch("http://localhost:4000/v1/borrar-oferta-admin", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: id
        })
      });
      return respuesta.json();
    } catch (error) {
      console.log(error)
      return {error: "Error al eliminar oferta"}
    }
  }