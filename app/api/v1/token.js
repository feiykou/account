const Router = require('koa-router')

const { TokenValidator, NotEmptyValidator } = require('../../validators/validator')
const { LoginType } = require('../../lib/enum')
const { User } = require('../../models/user')
const { Auth } = require('../../../middlewares/auth')
const { WXManager } = require('../../services/wx')

const { generateToken } = require('../../../core/util')

// 注意prefix，v1前面要加上/
const router = new Router({
    prefix:'/v1/token'
})

router.post('/', async (ctx) => {
    const v = await new TokenValidator().validate(ctx)
    let token;
    switch(v.get('body.type')) {
        case LoginType.USER_MEAIL: 
            token = await emailLogin(v.get('body.account'),v.get('body.secret'))
            break;
        case LoginType.USER_MINI_PROGRAM: 
            token = await WXManager.codeToToken(v.get('body.account'))
            break;
        default: 
            throw new global.errs.ParameterException('没有对应的处理函数');
    }

    ctx.body = {
        token
    }
})

router.post('/verify', async ctx => {
    // token
    const v = await new NotEmptyValidator().validate(ctx)
    const result = Auth.verifyToken(v.get('body.token'))
    ctx.body = {
        isVerify: result
    }
})

async function emailLogin(account, secret) {
    const user = await User.verifyEmailPassword(account, secret)
    // 令牌有权限数字，API也要控制权限数字，每个API赋予一个数字，怎么给API赋予权限数字呢？ 函数的扩展性是比较差的
    return token = generateToken(user.id, Auth.USER)
}

module.exports = router