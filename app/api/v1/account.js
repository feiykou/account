
const Router = require('koa-router')
const {HttpException, ParameterException} = require('../../../core/http-exception')
const {AccountTypeValidator, AccountValidator} = require('../../validators/validator')
const {Account} = require("../../models/account")
const {UserCode} = require("../../models/code")
const { Auth } = require('../../../middlewares/auth')
const redis = require('../../../config/redis')
const { AccountType } = require('../../lib/enum')

// 注意prefix，v1前面要加上/
const router = new Router({
    prefix:'/v1/account'
})

/**
 * 获取账号  --- 通过code码获取账号
 * 1、检测参数
 * 2、获取缓存所有账号
 * 3、获取账号
 * 4、重新设置缓存账号和获取账号时间
 */
router.get('/', new Auth(Auth.USER).m, async ctx => {
    const t = await new AccountValidator().validate(ctx)
    const res = await Account.getAccount(t.get('query.code'), t.get('query.type'), ctx.auth.uid, redis)
    const accountData = await setAccount(ctx.auth.uid, t.get('query.type'), res[0])
    ctx.body = accountData
})

/**
 * 设置账号
 * @param {*} uid 
 * @param {*} type 
 * @param {*} data 
 */
async function setAccount(uid, type, data) {
    let accountData = await redis.get(`account:${uid}`)
    accountData = JSON.parse(accountData)
    if(!accountData) accountData = {}
    accountData[type] = data
    redis.set(`account:${uid}`, JSON.stringify(accountData))
    redis.set(`account:${uid}:time`, new Date().getTime())
    return accountData
}


/**
 * 点击对应按钮获取账号
 */
router.get('/:type', new Auth(Auth.USER).m, async ctx => {
    const t = await new AccountTypeValidator().validate(ctx)
    // 判断是否到时间更新，并且如果是类型是all，那么则返回缓存数据（bug：存在redis过期的可能）
    const cacheRes = await Account.getCacheData(ctx.auth.uid, t.get('path.type'), redis)
    if(t.get('path.type') == AccountType.ALL) {
        if(!cacheRes[AccountType.QICAHCHA] && UserCode.isExistCode(AccountType.QICAHCHA, ctx.auth.uid)) {
            cacheRes[AccountType.QICAHCHA] = {}
        }
        if(!cacheRes[AccountType.TIANYAN] && UserCode.isExistCode(AccountType.TIANYAN, ctx.auth.uid)) {
            cacheRes[AccountType.TIANYAN] = {}
        }
        ctx.body = cacheRes
        return
    }

    const res = await Account.getRepeatAccount(t.get('path.type'), ctx.auth.uid, redis)
    ctx.body = res
})

module.exports = router