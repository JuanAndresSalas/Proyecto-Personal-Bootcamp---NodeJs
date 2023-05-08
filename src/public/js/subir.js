


// Variables
const inputFile = document.querySelector('#imagen');
const image = document.querySelector('#vistaPrevia');
let base64URL= ""
let latitud, longitud
const formularioSubida = document.getElementById("formSubir")
const lugar = document.getElementById("lugar")
const precio = document.getElementById("precio")
const descripcion = document.getElementById("descripcion")
const categoria = document.getElementById("categorias")


//Mostrar imagen subida y tranformacion a base64
/**
 * Returns a file in Base64URL format.
 * @param {File} file
 * @return {Promise<string>}
 */
async function encodeFileAsBase64URL(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.addEventListener('loadend', () => {
            resolve(reader.result);
        });
        reader.readAsDataURL(file);
    });
};



// Eventos
inputFile.addEventListener('input', async (event) => {
    // Imagen a base64
    
    base64URL = await encodeFileAsBase64URL(inputFile.files[0]);
    // Mostrar imagen 
    image.setAttribute('src', base64URL);
    
});

//Captura de geolocalización
if ("geolocation" in navigator) {
    // El navegador soporta geolocalización
    navigator.geolocation.getCurrentPosition(function(position) {
      // Obtenemos la latitud y longitud
      latitud = position.coords.latitude;
      longitud = position.coords.longitude;
    }, function(error) {
      // Manejo de errores
      console.log("Error al obtener la posición: " + error.message);
    }, { 
      enableHighAccuracy: true, 
      timeout: 5000, 
      maximumAge: 0 
    });
} else {
    // El navegador no soporta geolocalización
    console.log("Geolocalización no soportada por este navegador.");
}
  


//Envio de formulario

formularioSubida.addEventListener("submit", async evento =>{
    evento.preventDefault()
    function extractBase64Data(base64String) {
        const regex = /^data:(.+);base64,(.*)$/;
        const matches = base64String.match(regex);
        if (matches == null) {
          throw new Error('Invalid base64 string');
        }
        return matches[2];
    }

   
  
    let  info =  {
        
        lugar: lugar.value,
        precio: precio.value,
        descripcion: descripcion.value,
        latitud: latitud,
        longitud: longitud,
        categoria: categoria.value
    }
    if(base64URL != ""){
        const formData = new FormData();
        formData.append('key', '9f4ad2843bbdfd452c919c02abdd34ad');
        formData.append('image', extractBase64Data(base64URL));
        let hora = new Date
        let horaString = hora.toString().replace(/\s/g, '');
        formData.append('name',horaString)

        
        let respuesta = await fetch('https://api.imgbb.com/1/upload',{
            method: 'POST',
            body: formData
        })
        let url = await respuesta.json()
        info.imagen = url.data.display_url
    }else{
        info.imagen = ""
    }
    
    let respuesta = await fetch("http://localhost:3000/oferta-nueva",{
        method: 'POST',  
        headers: { 
        'Content-type' : 'application/json' 
        }, 
        body: JSON.stringify(info)
    }) 
    
    let mensaje = await respuesta.json()

    var modal = document.getElementById('myModal');
    var modalInstance = new bootstrap.Modal(modal);
    let mensajeModal = document.getElementById("mensajeModal")
    mensajeModal.innerText = mensaje.mensaje
    modalInstance.show();

 
})

//Función recargar pagina

function recargarPagina(){
    location.reload()
}