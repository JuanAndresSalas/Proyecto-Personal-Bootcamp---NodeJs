import bcrypt from "bcrypt"

export function encriptarPassword(contraseña) {
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(contraseña, salt);
    return hash;
  }