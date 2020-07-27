
const Router = require('koa-router')
const {HttpException, ParameterException} = require('../../../core/http-exception')
const {PositiveIntegerValidator} = require('../../validators/validator')
const router = new Router()


router.post('/v1/:id/books', (ctx, next) => {
    const path = ctx.params
    const query = ctx.query
    const header = ctx.request.header
    const body = ctx.request.body

    const v = new PositiveIntegerValidator().validate(ctx)
    // 如果是header，则是header.
    /**
     * 使用validate获取参数的好处：
     * 1、自己转换类型
     * 2、获取更复杂的参数
     */
    // const c = {
    //     a: 1,
    //     b: {
    //         f: 2,
    //         e: {}
    //     }
    // }
    // v.get('body.b.f')

    const id = v.get('path.id')
    const ids = v.get('path.id', parsed = false)
    ctx.body = 111


    // validate参数是ctx，帮助寻找参数
    // if(query.id != 2) {
    //     // const error = new global.errs.ParameterException()
    //     // // 动态 面向对象方式 一个类
    //     // const error = new Error('为什么错误')
    //     // error.errorCode = 10001
    //     // error.status = 400
    //     error.requestUrl = `${ctx.method} ${ctx.path}`
    //     throw error
    // }
    // 面向AOP切面编程
    // 监听错误
    // 输出一段错误消息 

    ctx.body = body
})


module.exports = router