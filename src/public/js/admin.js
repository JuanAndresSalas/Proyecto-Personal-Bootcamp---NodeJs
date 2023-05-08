

let tablaUsuarios = document.getElementById("tabla-usuarios")
let tablaOfertas = document.getElementById("tabla-ofertas")
let btnEliminar = document.querySelectorAll(".btn-eliminar")
let btnEliminarModal = document.getElementById("confirmar-eliminacion")
let btnMostrarUsuarios = document.getElementById("btn-mostrar-usuarios")
let btnMostrarOfertas = document.getElementById("btn-mostrar-ofertas")

function mostrarUsuarios() {
    if (tablaUsuarios.style.display == "table") {
        tablaUsuarios.style.display = "none"
        btnMostrarUsuarios.innerText = "Mostrar Usuarios"
    } else {
        btnMostrarUsuarios.innerText = "Ocultar Usuarios"
        tablaUsuarios.style.display = "table"
    }
}



function mostrarOfertas() {
    if (tablaOfertas.style.display == "table") {
        tablaOfertas.style.display = "none"
        btnMostrarOfertas.innerText = "Mostrar Ofertas"
        
    } else {
        tablaOfertas.style.display = "table"
        btnMostrarOfertas.innerText = "Ocultar Ofertas"
    }
}



btnEliminar.forEach(function (boton) {
    boton.addEventListener("click", (event) => {
        let id = event.target.value
        let textoModal = document.getElementById("id-oferta-modal")

        textoModal.innerText = id
        btnEliminarModal.value = id
    })
})

btnEliminarModal.addEventListener("click", async () => {
    try {
      const response = await fetch("http://localhost:3000/borrar-oferta-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: btnEliminarModal.value
        })
      });
  
      if (!response.ok) {
        throw new Error("No se pudo borrar el registro");
      }
  
      // Esperar a que la respuesta sea resuelta antes de actualizar la página
      const respuesta = await response.json();
      console.log(respuesta);
  
      // Actualizar la lista de registros o recargar la página
      location.reload();
  
    } catch (error) {
      console.log(error);
    }
  });

  document.rea