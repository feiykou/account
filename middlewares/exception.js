
const {HttpException} = require('../core/http-exception')

// next要使用await，才能监听到异常
const catchError = async function(ctx, next) {
    try {
        await next()
    } catch(error) {
        const isHttpException = error instanceof HttpException,
            isDev = global.config.environment === 'dev'
        if(isDev && !isHttpException) {
            throw error
        }
        if(error instanceof HttpException) {
            ctx.body = {
                error_code: error.errorCode,
                msg: error.msg,
                data: error.data || {},
                request: `${ctx.method} ${JSON.stringify(ctx.url)}`
            }
            ctx.status = error.code
        } else {
            ctx.body = {
                msg: '未知错误',
                error_code: 9999,
                request: `${ctx.method} ${ctx.path}`
            }
            ctx.status = 500
        }
    }
}

module.exports = catchError