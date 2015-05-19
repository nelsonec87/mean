var Sequelize = require('sequelize'),
	fs = require('fs'),
	path = require('path'),
	config = require('./config');


var db = {};

var sequelize = new Sequelize(config.db.db, config.db.user, config.db.pass, {host: config.db.host, "dialect": "mysql" });

fs
	.readdirSync(__dirname + '/../app/models')
	.filter(function (file) {
	return (file.indexOf(".") !== 0) && (file !== "index.js");
})
	.forEach(function (file) {
	var model = sequelize["import"](path.join(__dirname + '/../app/models', file));
	db[model.name] = model;
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