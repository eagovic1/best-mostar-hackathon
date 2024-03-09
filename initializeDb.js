const db = require('./db.js');

module.exports = async function initialize(){
    await db.sequelize.sync({force:false});
    console.log("Database is initialized.")
}