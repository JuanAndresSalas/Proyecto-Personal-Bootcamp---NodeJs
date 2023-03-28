// Variables
const inputFile = document.querySelector('#imagen');
const image = document.querySelector('#vistaPrevia');
let base64URL= ""
let localizacion = {latitud:0, longitud:0}
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
if(navigator.geolocation in navigator){
    navigator.geolocation.getCurrentPosition(position => {
        console.log(position);
    }, e => {
        console.log(e);
    });
}




//Envio de formulario

formularioSubida.addEventListener("submit", evento =>{
    evento.preventDefault()
    
    console.log(localizacion)
    let info =  {
                    imagen: base64URL,
                    lugar: lugar.value,
                    precio: precio.value,
                    descripcion: descripcion.value,
                    latitud: 0,
                    longitud: 0,
                    categoria: categoria.value


                }
                
    fetch("http://localhost:3000/oferta-nueva",{
        method: 'POST',  
        headers: { 
        'Content-type' : 'application/json' 
        }, 
        body: JSON.stringify(info)
    }).then(
            alert("Oferta Guardada"),
            location.reload()
            )
  
})