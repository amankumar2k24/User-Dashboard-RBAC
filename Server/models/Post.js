module.exports = (sequelize, DataTypes) => {
    const Post = sequelize.define('Post', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        tags: {
            type: DataTypes.JSON, 
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('draft', 'published', 'archived'),
            defaultValue: 'draft'
        },
        featured: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        readingTime: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        excerpt: {
            type: DataTypes.STRING,
            allowNull: true
        },
        authorId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    }, {
        tableName: 'posts',
        timestamps: true
    });

    return Post;
};
