const Sequelize = require("sequelize");

module.exports = function(sequelize,DataTypes){
    const User = sequelize.define("User",{
       
        name:Sequelize.STRING,
        surname:Sequelize.STRING,
        password:Sequelize.STRING,
        role:Sequelize.STRING,
        email:Sequelize.STRING
    })
    return User;
};