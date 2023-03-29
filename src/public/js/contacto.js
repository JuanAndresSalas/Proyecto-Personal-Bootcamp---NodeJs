let nombre = document.getElementById("nombre")
let correo = document.getElementById("correo")
let mensaje = document.getElementById("mensaje")
let formulario = document.getElementById("form-contacto")

formulario.addEventListener("submit",(evento) =>{
    evento.preventDefault()

    let info = {
        nombre: nombre.value,
        correo: correo.value,
        mensaje: mensaje.value,
    }
    fetch("http://localhost:3000/contacto",{
        method: 'POST',  
        headers: { 
        'Content-type' : 'application/json' 
        }, 
        body: JSON.stringify(info)
    }).then(alert("Mensaje Enviado"),window.location.href = "http://localhost:3000/index").catch(error => alert(error))
})