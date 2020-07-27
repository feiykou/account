const Sequelize = require('sequelize')
const {
    dbName,
    host,
    port,
    user,
    password
} = require('../config/config').database

const sequelize = new Sequelize(dbName, user, password, {
    dialect: 'mysql', // 和具体的数据库没关系  mysql要安装驱动mysql2
    host,
    port,
    logging: true, // 显示sql语句
    timezone: '+08:00',
    define: {
        // timestamps:false不要添加时间戳属性 (updatedAt, createdAt)
        timestamps: true,
        paranoid: true, // 软删除，并自动创建deleteAt
        createdAt: 'create_at',
        // 不使用驼峰式命令规则，这样会在使用下划线分隔
        // 这样 updatedAt 的字段名会是 updated_at
        underscored: true,
        // 禁止修改表名. 默认情况下
        // sequelize会自动使用传入的模型名（define的第一个参数）做为表名
        // 如果你不想使用这种方式你需要进行以下设置
        freezeTableName: false,

        // 定义表名
        // tableName: 'my_very_custom_table_name'
    }
})

// 通过 sync 方法同步数据结构
// 即,创建表
// 通过设置 force 属性会首先删除表并重新创建
// 用于给数据表添加新字段
// Project.sync({force: true})
// sequelize.sync({force: true})

module.exports = {
    db: sequelize
}