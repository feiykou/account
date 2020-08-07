const { Sequelize, Model, DataTypes } = require("sequelize");
// 引入连接数据库的sequelize对象
const { db } = require('../../core/db')

class AccountRecord extends Model {
    static async createRecord(account_id, uid, type)
    {
        $result = AccountRecord.create({
            account_id,
            'user_id': uid,
            type
        })
        return result
    }
}

AccountRecord.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    account_id: DataTypes.INTEGER,
    user_id:  DataTypes.INTEGER,
    type: DataTypes.BOOLEAN
}, {
    sequelize: db
})
AccountRecord.sync({
    force: true
});

module.exports = {
    AccountRecord
}