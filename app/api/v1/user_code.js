
const Router = require('koa-router')
const { UserCodeValidator} = require('../../validators/validator')
const { UserCode } = require('../../models/code')
const { Auth } = require('../../../middlewares/auth')
const { success } = require('../../lib/helper')

// 注意prefix，v1前面要加上/
const router = new Router({
    prefix:'/v1/user_code'
})

/**
 * 创建code
 */
router.post('/', new Auth(Auth.USER).m, async ctx => {
    const t = await new UserCodeValidator().validate(ctx)
    const res = await UserCode.createCode(t.get('body.code'), t.get('body.type'), ctx.auth.uid)
    if(!res) {
        throw new global.errs.NotFound('创建失败')
    }
    success()
})

module.exports = router