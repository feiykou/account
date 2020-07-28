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
        // 获取对应类型的账号
        let where = { 'type': type }
        if(cacheAccount && cacheAccount[type]) {
            where['account'] = {
                [Op.ne]: cacheAccount[type]['account']
            }
        }
        const res = await Account.findAll({
            attributes: ['account', 'password'],
            where,
            limit: 1,
            order: db.random()
        })
        
        if(!res || res.length <= 0) {
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
            // 激活码不存在，则删除缓存，让用户重新激活
            let redisAccount = await redis.get(`account:${uid}`)
            if(redisAccount && redisAccount[type]) {
                redisAccount = JSON.parse(redisAccount)
                delete redisAccount[type]
                redis.set(`account:${uid}`, JSON.stringify(redisAccount))
            }
            if(Object.keys(redisAccount).length === 0) {
                redisAccount = null
            }
            // 在客户端设置该账号不存在，重新激活
            throw new global.errs.codeError('激活码不存在', 10010, {data: redisAccount})
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
        
        // if(nextDate.getTime() > Number(startTime) && nextDate.getTime() < nowDate.getTime()) {
        //     return true
        // } else {
        //     throw new global.errs.NotFound('晚上11点半之后更新')
        // }
        
        return true
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