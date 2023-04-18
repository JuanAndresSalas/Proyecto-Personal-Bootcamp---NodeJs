import Sequelize from "sequelize"
import dotenv from "dotenv"

dotenv.config()

const sequelize = new Sequelize(process.env.DATABASE, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'mysql'
});
  
// Verificar la conexión
sequelize.authenticate()
.then(() => {
    console.log('Conexión exitosa a la base de datos.');
})
.catch(err => {
    console.error('No se pudo conectar a la base de datos:', err);
});


//Creación tablas
const categoria = sequelize.define('categoria',{
    idcategoria: {type:Sequelize.INTEGER, primaryKey: true, autoIncrement: 10},
    nombre: {type:Sequelize.STRING, allowNull: false}
},{timestamp: false, createdAt: false,updatedAt: false})

const usuario = sequelize.define('usuario',{
    idusuario: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: 1000},
    nombre: {type: Sequelize.STRING, allowNull: false},
    apellido: {type: Sequelize.STRING, allowNull: false},
    correo: {type: Sequelize.STRING, allowNull: false},
    contrasena: {type: Sequelize.STRING, allowNull: false},
},{timestamp: false, createdAt: false,updatedAt: false})

const subcategoria = sequelize.define('subcategoria',{
    idsubcategoria:{type: Sequelize.INTEGER, primaryKey: true, autoIncrement: 100},
    nombre: {type: Sequelize.STRING, allowNull: false}
},{timestamp: false, createdAt: false,updatedAt: false})

const oferta = sequelize.define('oferta',{
    idoferta: {type:Sequelize.INTEGER, primaryKey: true, autoIncrement: 2000},
    precio: {type: Sequelize.INTEGER, allowNull: false},
    lugar: {type: Sequelize.STRING, allowNull: false},
    longitud: {type: Sequelize.STRING, allowNull: false},
    latitud: {type: Sequelize.STRING, allowNull: false},
    descripcion: {type: Sequelize.STRING, allowNull: false},
    imagen: {type: Sequelize.BLOB, allowNull: true}
},{timestamp: false, createdAt: false,updatedAt: false})

//Relaciones entre tablas
subcategoria.belongsTo(categoria, { foreignKey: 'idcategoria_categoria' })
categoria.hasMany(subcategoria,{ foreignKey: 'idcategoria_categoria' })

oferta.belongsTo(usuario, {foreignKey: 'idusuario_usuario'})
usuario.hasMany(oferta, {foreignKey: 'idusuario_usuario'})

oferta.belongsTo(subcategoria, {foreignKey: 'idsubcategoria_subcategoria'})
subcategoria.hasMany(oferta,  {foreignKey: 'idsubcategoria_subcategoria'})

//Sincronización
sequelize.sync({force: true})