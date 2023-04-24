
// Variables
const inputFile = document.querySelector('#imagen');
const image = document.querySelector('#vistaPrevia');
let base64URL= ""
let latitud, longitud
const formularioSubida = document.getElementById("formSubir")
const lugar = document.getElementById("lugar")
const precio = document.getElementById("precio")
const descripcion = document.getElementById("descripcion")
const categoria = document.getElementById("categoria")


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

formularioSubida.addEventListener("submit", evento =>{
    evento.preventDefault()
    

    let info =  {
                    imagen: base64URL,
                    lugar: lugar.value,
                    precio: precio.value,
                    descripcion: descripcion.value,
                    latitud: latitud,
                    longitud: longitud,
                    categoria: categoria.value


                }
                
    fetch("http://localhost:3000/oferta-nueva",{
        method: 'POST',  
        headers: { 
        'Content-type' : 'application/json' 
        }, 
        body: JSON.stringify(info)
    })
    .then(response => response.json())
    .then(data => { 
        if(data == true){
            alert("Oferta ingresada con éxito")
            location.reload()
        }else{
            alert("ERROR - Oferta no Ingresada")
            
        }
    })
  
})