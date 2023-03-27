 import * as fs from "fs"

 
 export async function leerArchivo(url) {
    let data = await fs.promises.readFile(url, (err, data) => {
        if (err) throw err 
        return data
    });
    return await JSON.parse(data);
}


