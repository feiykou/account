const Router = require('koa-router')

const { Auth } = require('../../../middlewares/auth')
const { Classic } = require('../../models/classic')
const { PositiveIntegerValidator, ClassicValidator, PagingValidator } = require('../../validators/validator')


// 注意prefix，v1前面要加上/
const router = new Router({
    prefix:'/v1/classic'
})

// 中间件的顺序是，从左到右依次执行，前面的会阻塞后面执行
router.get('/latest', new Auth(Auth.USER).m, async (ctx, next) => {
    /**
     * 权限：限制角色访问
     * 角色：普通用户，管理员
     * 分级：scope
     * 8 16
     * 
     * API接口不是用来写业务逻辑的，业务逻辑一般写在model中，比较复杂的业务，可以在抽象到service中
     * 如果业务逻辑不复杂，则可以写在API接口中
     */
    const res = await Classic.getLatest()
    if(!res) {
        throw new global.errs.NotFound('期刊未找到')
    }
    ctx.body = res
})

/**
 * 获取当前一期的下一期
 */
router.get('/:index/next', async (ctx, next) => {
    const v = await new PositiveIntegerValidator('index').validate(ctx)
    const res = await Classic.getNext(v.get('path.index'))
    if(!res) {
        throw new global.errs.NotFound('期刊未找到')
    }
    ctx.body = res
})

/**
 * 获取当前一期的上一期
 */
router.get('/:index/previous', async (ctx, next) => {
    const v = await new PositiveIntegerValidator('index').validate(ctx)
    const res = await Classic.getNext(v.get('path.index'), false)
    if(!res) {
        throw new global.errs.NotFound('期刊未找到')
    }
    ctx.body = res
})

/**
 * 获取当前期刊详情
 */
router.get('/:type/:id', async ctx => {
    const v = await new ClassicValidator().validate(ctx)
    const res = await Classic.getDetail(v.get('path'))
    if(!res) {
        throw new global.errs.NotFound('期刊未找到')
    }
    ctx.body = res
})

/**
 * 获取点赞信息
 */
router.get('/:type/:id/favor', async ctx => {
    const v = await new ClassicValidator().validate(ctx)
    const res = await Classic.getDetail(v.get('path'), 'fav_nums,id,like_status')
    if(!res) {
        throw new global.errs.NotFound('期刊未找到')
    }
    ctx.body = res
})

/**
 * 获取我喜欢的期刊
 */
router.get('/favor', async ctx => {
    const v = await new PagingValidator().validate(ctx)
    const res = await Classic.getFavors(v.get('query'))
    ctx.body = res
})

module.exports = router