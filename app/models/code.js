const { Sequelize, Model, DataTypes } = require("sequelize");
// 引入连接数据库的sequelize对象
const { db } = require('../../core/db')

class Code extends Model { 
    static async getCode(code, type) {
        const result = await Code.findOne({
            where: {
                code,
                type
            }
        })
        return result
    }
}

class UserCode extends Model {
    static async getUserCode(code, type, uid) {
        const result = UserCode.findOne({
            where: {
                code,
                type,
                uid
            }
        })
        return result
    }

    // 判断是否存在激活码
    static async isExistCode(type, uid) {
        const result = UserCode.findOne({
            where: {
                type,
                uid
            }
        })
        return result
    }

    static async createCode(code, type, uid) {
        // 判断userCode是否有该code，判断是否有人已领取code
        const userCodeData = await UserCode.findOne({
            where: {
                type,
                code
            }
        })
        
        if(userCodeData) {
            throw new global.errs.NotFound('激活码已被使用')
        }
        // 判断是否有code
        const codeData = await Code.getCode(code, type)
        
        if(!codeData) {
            throw new global.errs.NotFound('该激活码不存在')
        }
        const res = await UserCode.create({
            code,
            uid,
            codes_id: codeData['id'],
            type: codeData.type,
            time: codeData.time
        })
        return res
    }

    static async delCode(code, uid) {
        const result = await UserCode.destroy({
            where: {
                code,
                uid
            }
        })
        return result
    }
}

UserCode.init({
    uid: DataTypes.INTEGER,
    code: DataTypes.STRING,
    type: DataTypes.INTEGER,
    time: DataTypes.INTEGER,
    codes_id: DataTypes.INTEGER
}, {
    sequelize: db,
    paranoid: true
})

Code.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    code: DataTypes.STRING(32),
    time: DataTypes.BOOLEAN,
    type: DataTypes.BOOLEAN
}, {
    sequelize: db
})

// UserCode.sync({
//     force: true
// });

// Code.sync({
//     force: true
// });

module.exports = {
    Code,
    UserCode
}