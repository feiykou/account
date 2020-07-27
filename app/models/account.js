const { Sequelize, Op, Model, DataTypes } = require("sequelize");
// 引入连接数据库的sequelize对象
const { db } = require('../../core/db')

const { UserCode } = require('../models/code') 
const { AccountType } = require('../lib/enum')


class Account extends Model { 

    static async getAccount(code, type, uid, redis) {
        const result = await UserCode.getUserCode(code, type, uid)
        if(!result) {
            throw new global.errs.Forbbiden()
        }
        const cacheAccount  = await Account.getAccountCache(redis, uid)
        let where = {}
        
        if(cacheAccount && cacheAccount[type]) {
            where['account'] = {
                [Op.ne]: cacheAccount[type]['account']
            }
        }
        console.log(where);
        
        const res = await Account.findAll({
            attributes: ['account', 'password'],
            where,
            limit: 1,
            order: db.random()
        })
        if(!res) {
            throw new global.errs.NotFound()
        }
        return res
    }

    static async getRepeatAccount(type, uid, redis) {
        if(type == AccountType.ALL) {
            return await Account.getAccountCache(redis, uid)
        }
        
        let redisAccount = {}
        redisAccount = await Account.getCacheData(uid, type, redis)
        if(redisAccount[type]) {
            return redisAccount
        }
        
        const userCodeData = await UserCode.findOne({
            where: {
                type,
                uid
            }
        })
        if(!userCodeData) {
            throw new global.errs.NotFound('激活码不存在')
        }
        const newsAccountData = await Account.getAccount(userCodeData['code'], type, uid, redis)
        redisAccount[type] = newsAccountData[0]
        redis.set(`account:${uid}:time`, new Date().getTime())
        redis.set(`account:${uid}`, JSON.stringify(redisAccount))
        return redisAccount
    }

    static async getCacheData(uid, type, redis) {
        const accountData = await Account.getAccountCache(redis, uid)
        if(type != AccountType.ALL) {
            const markTime = await Account.getCurrentTime(redis, uid)
            if(markTime) {
                accountData[type] = null
            }
        }
        return accountData
    }

    static async getAccountCache(redis, uid) {
        let redisAccount = await redis.get(`account:${uid}`)
        if (redisAccount) {
            redisAccount = JSON.parse(redisAccount)
            return redisAccount;
        }
        return {}
    }
    
    // 11点半更新
    static async getCurrentTime(redis, uid) {
        // 开始时间不存在，更新
        // 大于11点半更新
        const startTime = await redis.get(`account:${uid}:time`)
        console.log(startTime);
        
        if(!startTime) return true
        let oldDate = new Date(Number(startTime))
        let oldYear = oldDate.getFullYear()  // 年
        let oldMonth = oldDate.getMonth()  // 月
        let oldDay = oldDate.getDate()  // 日
        let totalDays = new Date(oldYear, oldMonth + 1, 0)
        if(oldDay === totalDays.getDate()) {
            oldDay = 1
            if(oldMonth === 11) {
                oldYear = oldYear + 1
                oldMonth = 0
            } else {
                oldMonth = oldMonth + 1
            }
        } else {
         oldDay += 1
        }
        
        const nextDate = new Date(oldYear, oldMonth, oldDay)
        const nowDate = new Date()
        
        if(nextDate.getTime() > Number(startTime) && nextDate.getTime() < nowDate.getTime()) {
            return true
        } else {
            throw new global.errs.NotFound('晚上11点半之后更新')
        }
        
        // const hours = date.getHours()
        // const minutes = date.getMinutes()
        // if(hours === 23 && minutes === 30) {
        //     redis.del(`account:${uid}`)
        //     return false
        // }
        
    }
}


Account.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    account: DataTypes.STRING,
    password:  DataTypes.STRING,
    fav_nums: DataTypes.INTEGER,
    type: DataTypes.BOOLEAN
}, {
    sequelize: db
})
// Account.sync({
//     force: true
// });

module.exports = {
    Account
}