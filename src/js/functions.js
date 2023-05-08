export function formatoPrecio(precio){
    const options = { style: 'currency', currency: 'CLP' };
    const formattedNum = precio.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }).replace('CLP', '$')
    return formattedNum
}

