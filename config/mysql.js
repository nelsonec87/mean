var Sequelize = require('sequelize'),
	fs = require('fs'),
	path = require('path');


var db = {};

var sequelize = new Sequelize("mean", "root", "senha", { "dialect": "mysql" });

fs
	.readdirSync(__dirname + '/../app/models')
	.filter(function (file) {
	return (file.indexOf(".") !== 0) && (file !== "index.js");
})
	.forEach(function (file) {
	console.log('antes', file);
	var model = sequelize["import"](path.join(__dirname + '/../app/models', file));
	db[model.name] = model;
	console.log('depois', file);
});

Object.keys(db).forEach(function (modelName) {
	if ("associate" in db[modelName]) {
		db[modelName].associate(db);
	}
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

sequelize.sync({force: true});

module.exports = db;