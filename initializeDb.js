const db = require('./db.js');

module.exports = async function initialize(){
    await db.sequelize.sync({force:true});
    console.log("Database is initialized.")
}