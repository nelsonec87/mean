module.exports = function (sequelize, DataTypes) {
	return sequelize.define('Article', {
		title: {
			type: DataTypes.STRING,
			defaultValue: '',
			validate: { notEmpty: { msg: 'Title cannot be blank' } }
		},
		content: {
			type: DataTypes.STRING,
			defaultValue: '',
		}
	}, {
			classMethods: {
				associate: function (models) {
					models.Article.belongsTo(models.User, {
						onDelete: 'CASCADE',
					});
				}
			}
		});
};