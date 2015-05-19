'use strict';

/**
 * Module dependencies.
 */
var errorHandler = require('./errors.server.controller'),
	//	Article = mongoose.model('Article'),
	db = require('../../config/mysql'),
	Article = db.Article,
	_ = require('lodash');

/**
 * Create a article
 */
exports.create = function (req, res) {
	var article = Article.build(req.body);
	article.UserId = req.user.id;

	article.save().then(function () {
		res.json(article);
	}).catch(function (err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
	});
};

/**
 * Show the current article
 */
exports.read = function (req, res) {
	res.json(req.article);
};

/**
 * Update a article
 */
exports.update = function (req, res) {
	var article = req.article;

	article = _.extend(article, req.body);

	article.save().then(function () {
		res.json(article);
	}).catch(function (err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
	});
};

/**
 * Delete an article
 */
exports.delete = function (req, res) {
	var article = req.article;

	article.destroy().then(function () {
		res.json(article);
	}).catch(function (err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
	});
};

/**
 * List of Articles
 */
exports.list = function (req, res) {
	Article.findAll({
		include: [{ model: db.User, attributes: ['displayName'] }],
		order: [['createdAt', 'DESC']]
	}).then(function (articles) {
		res.json(articles);
	}).catch(function (err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
	});
};

/**
 * Article middleware
 */
exports.articleByID = function (req, res, next, id) {
	Article.find({
		where: { id: id },
		include: [{ model: db.User, attributes: ['displayName'] }]
	}).then(function (article) {
		if (!article) {
			return res.status(404).send({
				message: 'Article not found'
			});
		}
		req.article = article;
		next();
	}).catch(function (err) {
		return next(err);
	});
};

/**
 * Article authorization middleware
 */
exports.hasAuthorization = function (req, res, next) {
	if (req.article.UserId !== req.user.id) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};
