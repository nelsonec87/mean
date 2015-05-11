'use strict';

/**
 * Module dependencies.
 */
console.log('core.server.controller');
exports.index = function (req, res) {
	console.log('user', req.user);
	res.render('index', {
		user: req.user || null,
		request: req
	});
};
