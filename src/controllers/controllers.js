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
            fetch(`http://localhost:4000/v1/crear-oferta/?lugar=${lugar}&descripcion=${descripcion}&latitud=${latitud}&longitud=${longitud}&id=${id}&categoria=${categoria}&precio=${precio}&imagen=${imagen}`,
            {method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            }})
        }catch(error){
            console.log(error)
        }
    
}