const Router = require('koa-router')

const { Auth } = require('../../../middlewares/auth')
const { LikeValidator } = require('../../validators/validator')
const { Favo } = require('../../models/favo')
const { success } = require('../../lib/helper')

// 注意prefix，v1前面要加上/
const router = new Router({
    prefix:'/v1/like'
})

router.post('/', new Auth(Auth.USER).m, async ctx => {
    const v = await new LikeValidator().validate(ctx, {
        id: 'art_id'
    })
    await Favo.like(v.get('body.art_id'), v.get('body.type'), ctx.auth.uid)
    success()
})

router.post('/cancel', new Auth(Auth.USER).m, async ctx => {
    const v = await new LikeValidator().validate(ctx, {
        id: 'art_id'
    })
    await Favo.dislike(v.get('body.art_id'), v.get('body.type'), ctx.auth.uid)
    success()
})



module.exports = router