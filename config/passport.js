'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
//	User = require('mongoose').model('User'),
	path = require('path'),
	config = require('./config'),
	db = require('./mysql'),
	User = db.User;

/**
 * Module init function.
 */
module.exports = function() {
	// Serialize sessions
	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	// Deserialize sessions
	passport.deserializeUser(function(id, done) {
		console.log('oi1');
		User.find(id).then(function(user) {
			
			done(null, user);
		});
	});

	// Initialize strategies
	config.getGlobbedFiles('./config/strategies/**/*.js').forEach(function(strategy) {
		require(path.resolve(strategy))();
	});
};
