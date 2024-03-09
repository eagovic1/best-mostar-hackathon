const Sequelize = require("sequelize");

module.exports = function(sequelize,DataTypes){
    const History = sequelize.define("History",{
       
        status:Sequelize.STRING,
        date:Sequelize.DATE,
        bookId:Sequelize.STRING,
        graded:Sequelize.BOOLEAN,
    })
    return History;
};