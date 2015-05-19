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
	if (this.provider == 'local' && (!password || password.length < 6))
		throw new Error('Password should be longer');;
};

/**
 * A Validation function for roles
 */
var validateRoles = function (roles) {
	if (!Array.isArray(roles))
		throw new Error('Invalid roles');;

	var allowedRoles = ['user', 'admin'];
	for (var i in roles)
		if (!~allowedRoles.indexOf(roles[i]))
			throw new Error('Invalid roles');
};

/**
 *	Use TEXT columns as JSON
 */
var jsonGet = function (property) {
	return function () {
		console.log(this);
		var val = this.getDataValue(property);
		if (val !== "" && val !== undefined)
			return JSON.parse(this.getDataValue(property));
		else return undefined;
	};
};

var jsonSet = function (property) {
	return function (val) {
		if (val != undefined)
			this.setDataValue(property, JSON.stringify(val));
		else
			this.setDataValue(property, 'null');
	};
};

/**
 * Hook
 */

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
			unique: { msg: 'This email is already in use' },
			validation: { notEmpty: true }
		},
		password: {
			type: DataTypes.STRING,
			defaultValue: '',
			validate: { local: validateLocalStrategyPassword }
		},
		salt: DataTypes.STRING,
		provider: {
			type: DataTypes.STRING,
			validate: { notEmpty: { msg: 'Provider is required' } }
		},
		providerData: {
			type: DataTypes.TEXT,
			get: jsonGet('providerData'),
			set: jsonSet('providerData')
		},
		additionalProvidersData: {
			type: DataTypes.TEXT,
			get: jsonGet('additionalProvidersData'),
			set: jsonSet('additionalProvidersData')
		},
		roles: {
			type: DataTypes.TEXT,
			get: jsonGet('roles'),
			set: jsonSet('roles'),
			validate: { enum: validateRoles }
		},
		/* For reset password */
		resetPasswordToken: DataTypes.STRING,
		resetPasswordExpires: DataTypes.DATE
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
					}).then(function (user) {
						if (!user) {
							callback(possibleUsername);
						} else {
							return User.findUniqueUsername(username,(suffix || 0) + 1, callback);
						}
					}).catch(function (err) {
						callback(null);
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