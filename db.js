const Sequelize = require('sequelize')
const sequelize = new Sequelize("db_aa63b7_mostar","aa63b7_mostar","mostar123",{host:"MYSQL6008.site4now.net",dialect:"mysql",logging:false});
const db={};
const path = require('path');

db.Sequelize = Sequelize;  
db.sequelize = sequelize;

db.user = require('./models/User.js')(sequelize,Sequelize); 
db.history = require('./models/History.js')(sequelize,Sequelize);   

db.user.hasMany(db.history);    
db.history.belongsTo(db.user);  

module.exports = db;