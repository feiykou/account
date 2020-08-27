const { Sequelize, Op, Model, DataTypes } = require("sequelize");
// 引入连接数据库的sequelize对象
const { db } = require('../../core/db')

const { UserCode } = require('../models/code') 
const { AccountRecord } = require('../models/record') 
const { AccountType } = require('../lib/enum')

const {getNextMonth, getNextDay} = require('../../core/util')


class Account extends Model { 

    static async getAccount(code, type, uid, redis) {
        const result = await UserCode.getUserCode(code, type, uid)
        if(!result) {
            throw new global.errs.Forbbiden()
        }
        const isTime = await Account.isNoTime(result['create_at'], result['time'])
        if(!isTime) {
            await UserCode.delCode(code,uid)
            await Account.delCache(redis, uid, type)
            throw new global.errs.codeError('激活码已过期，请重新激活')
        }
        const cacheAccount  = await Account.getAccountCache(redis, uid)
        // 获取对应类型的账号
        let where = { 'type': type, 'status': 1 }
        where['fav_nums'] = {
            [Op.lte]: 9
        }
        if(cacheAccount && cacheAccount[type]) {
            where['account'] = {
                [Op.ne]: cacheAccount[type]['account']
            }
        }
        const t = await db.transaction();
        try {
            const res = await Account.findAll({
                attributes: ['account', 'password', 'id'],
                where,
                limit: 1,
                order: db.random(),
                transaction: t
            })
            
            if(!res || res.length <= 0) {
                throw new global.errs.NotFound()
            }
            
            AccountRecord.create({
                account_id: res[0]['id'],
                'user_id': uid,
                type,
                transaction: t 
            })
            await this.incrementFavoNums(res[0]['id'])
            await t.commit();
            return res
        } catch (error) {
            await t.rollback();
            // 如果执行到此,则发生错误.
            // 该事务已由 Sequelize 自动回滚！
            console.log(error);
            throw new global.errs.NotFound()
        }
        
    }

    // 判断是否过期
    static async isNoTime(createTime, time) {
        const date = new Date(createTime)
        const nowDate = new Date()
        let nextTime = 0
        switch (time) {
            case 1:
                nextTime = getNextDay(date).getTime()
                // 1天
                break;
            case 2:
                // 7天
                nextTime = getNextDay(date, 7).getTime()
                break;
            case 3:
                // 1个月
                const time = getNextMonth(date)
                nextTime = new Date(time).getTime()
                break;
            case 4:
                // 1年
                date.setFullYear(date.getFullYear+1)
                date.setDate(date.getDate()-1)
                nextTime = date.getTime()
                break;
        }
        if(nowDate.getTime() < nextTime) {
            return true
        }
        return false
    }

    static async incrementFavoNums(id) {
        Account.increment({
            fav_nums: 1,
        }, {
            where: {
                id
            }
        })
    }

    /**
     * 重新获取账号
     * 以下条件不能获取：
     * 1、激活码不存在（用户未注册）
     * 2、激活码已失效（用户激活码到期）
     * @param {*} type 
     * @param {*} uid 
     * @param {*} redis 
     */
    static async getRepeatAccount(type, uid, redis) {
        // redis.del(`account:${uid}:time`)
        // redis.del(`account:${uid}`)
        let redisAccount = await Account.getAccountCache(redis, uid)
        if(!redisAccount) redisAccount = {}
        // redisAccount = await Account.getAccountCache(uid, type, redis)
        // if(redisAccount[type]) {
        //     return redisAccount
        // }
        console.log(1);
        
        const userCodeData = await UserCode.findOne({
            where: {
                type,
                uid
            }
        })
        console.log(2);
        if(!userCodeData) {
            const redisAccount = await Account.delCache(redis, uid, type)
            console.log(3);
            // 在客户端设置该账号不存在，重新激活
            throw new global.errs.codeError('激活码失效', 10010, {data: redisAccount})
        }
        const newsAccountData = await Account.getAccount(userCodeData['code'], type, uid, redis)
        console.log(4);
        redisAccount[type] = newsAccountData[0]
        redis.set(`account:${uid}:time`, new Date().getTime())
        redis.set(`account:${uid}`, JSON.stringify(redisAccount))
        return redisAccount
    }

    /**
     * 删除缓存
     * @param {*} uid 
     * @param {*} type 
     */
    static async delCache(redis, uid, type) {
        // 激活码不存在，则删除缓存，让用户重新激活
        let redisAccount = await redis.get(`account:${uid}`)
        if(redisAccount) {
            redisAccount = JSON.parse(redisAccount)
            if(redisAccount[type]) {
                delete redisAccount[type]
                redis.set(`account:${uid}`, JSON.stringify(redisAccount))
            }
        }
        if(Object.keys(redisAccount).length === 0) {
            redisAccount = null
        }
        return redisAccount
    }

    /**
     * 获取缓存，并判断时间点更新
     * @param {*} uid 
     * @param {*} type 
     * @param {*} redis 
     */
    static async getCacheData(uid, type, redis) {
        const accountData = await Account.getAccountCache(redis, uid)
        if(type != AccountType.ALL) { // all 获取全部缓存的数据
            // 一天一更新，true代表更新
            const markTime = await Account.getCurrentTime(redis, uid)
            if(markTime) {
                accountData[type] = null
            }
        }
        return accountData
    }

    /**
     * 获取全部缓存数据
     * @param {*} redis 
     * @param {*} uid 
     */
    static async getAccountCache(redis, uid) {
        // 有问题：当长时间不登录，缓存会失效，那么就会返回空，导致出现重新输入激活码的情况
        let redisAccount = await redis.get(`account:${uid}`)
        if (redisAccount) {
            redisAccount = JSON.parse(redisAccount)
            return redisAccount
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

        if(nextDate.getTime() > Number(startTime) && nextDate.getTime() < nowDate.getTime()) {
            return true
        } else {
            throw new global.errs.NotFound('晚上12点之后更新')
        }
        
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
    password: DataTypes.STRING,
    fav_nums: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
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