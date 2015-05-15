var crypto = require('crypto');

/** 
 * A Validation function for local strategy properties
 */

var validateLocalStrategyProperty = function (msg) {
	return function (property) {
		if (this.provider == 'local' && !property.length)
			throw new Error(msg);
	};
};

/**
 * A Validation function for local strategy password
 */
var validateLocalStrategyPassword = function (password) {
	return (this.provider !== 'local' || (password && password.length > 6));
};

var preSave = function (user, options, fn) {
	if (user.password && user.password.length > 6) {
		user.salt = crypto.randomBytes(16).toString('base64');
		user.password = user.hashPassword(user.password);
	}
	fn(null, user);
};


module.exports = function (sequelize, DataTypes) {
	var User = sequelize.define('User', {
		firstName: {
			type: DataTypes.STRING,
			defaultValue: '',
			validate: { local: validateLocalStrategyProperty('Please fill in your first name') }
		},
		lastName: {
			type: DataTypes.STRING,
			defaultValue: '',
			validate: { local: validateLocalStrategyProperty('Please fill in your last name') }
		},
		displayName: DataTypes.STRING,
		email: {
			type: DataTypes.STRING,
			defaultValue: '',
			validate: {
				local: validateLocalStrategyProperty('Please fill in your Email'),
				isEmail: { msg: 'Please fill a valid email address' }
			}
		},
		username: {
			type: DataTypes.STRING,
			unique: {msg: 'This email is already in use'},
			validation: { notEmpty: true }
		},
		password: DataTypes.TEXT,
		salt: DataTypes.TEXT,
		provider: DataTypes.TEXT,
		providerData: DataTypes.TEXT,
		additionalProvidersData: DataTypes.TEXT,
		roles: DataTypes.TEXT,
		/* For reset password */
		resetPasswordToken: DataTypes.TEXT,
		resetPasswordExpires: DataTypes.TEXT
	}, {
			instanceMethods: {
				hashPassword: function (password) {
					if (this.salt && password) {
						return crypto.pbkdf2Sync(password, new Buffer(this.salt, 'base64'), 10000, 64).toString('base64');
					} else {
						return password;
					}
				},
				authenticate: function (password) {
					return this.password === this.hashPassword(password);
				}
			},
			classMethodds: {
				findUniqueUsername: function (username, suffix, callback) {
					var possibleUsername = username + (suffix || '');

					User.find({
						username: possibleUsername
					}).then(function (user, err) {

						//						console.log('check err nao existe');
						if (!err) {
							if (!user) {
								callback(possibleUsername);
							} else {
								return User.findUniqueUsername(username,(suffix || 0) + 1, callback);
							}
						} else {
							callback(null);
						}
					});
				}
			},
			hooks: {
				beforeUpdate: preSave,
				beforeCreate: preSave
			}
		});

	return User;
};