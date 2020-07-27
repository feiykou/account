
const Router = require('koa-router')
const {HttpException, ParameterException} = require('../../../core/http-exception')
const {AccountTypeValidator, AccountValidator} = require('../../validators/validator')
const {Account} = require("../../models/account")
const { Auth } = require('../../../middlewares/auth')
const redis = require('../../../config/redis')

// 注意prefix，v1前面要加上/
const router = new Router({
    prefix:'/v1/account'
})

/**
 * 获取账号
 */
router.get('/', new Auth(Auth.USER).m, async ctx => {
    const t = await new AccountValidator().validate(ctx)
    let accountData = await redis.get(`account:${ctx.auth.uid}`)
    accountData = JSON.parse(accountData)
    if(!accountData) accountData = {}
    const res = await Account.getAccount(t.get('query.code'), t.get('query.type'), ctx.auth.uid, redis)
    accountData[t.get('query.type')] = res[0]
    redis.set(`account:${ctx.auth.uid}`, JSON.stringify(accountData))
    redis.set(`account:${ctx.auth.uid}:time`, new Date().getTime())
    ctx.body = accountData
})

router.get('/:type', new Auth(Auth.USER).m, async ctx => {
    const t = await new AccountTypeValidator().validate(ctx)
    const cacheRes = await Account.getCacheData(ctx.auth.uid, t.get('path.type'), redis)
    if(cacheRes && cacheRes[t.get('path.type')]) {
        ctx.body = cacheRes
        return;
    }
    const res = await Account.getRepeatAccount(t.get('path.type'), ctx.auth.uid, redis)
    ctx.body = res
})

module.exports = router