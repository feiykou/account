const Koa = require('koa')
const parser = require('koa-bodyparser')
const Initmanager = require('./core/init')
const catchError = require('./middlewares/exception')

// 创建数据库
// require('./app/models/user')
// require('./app/models/account')
// require('./app/models/record')
// require('./app/models/code')
const app = new Koa()
// 处理跨域
app.use(async (ctx, next) => {
    ctx.set("Access-Control-Allow-Origin", "*")
    await next()
})
// const Router = require('koa-router')
// const book = require('./api/v1/book')
// 要写在路由注入app之前
app.use(parser())
app.use(catchError)
// process.cwd()
Initmanager.initCore(app)

// 应用程序对象 中间件

// 发送HTTP KOA 接收HTTP

// 中间件就是函数

// 前端发送的http请求过来
// 注册函数到应用程序上
// app.use((ctx, next) => {
//     // ctx:上下文
//     // next：下一个中间件函数
//     const add = 211
//     console.log(222);
//     next()
// })

// app.use(() => {
//     console.log(333);
// })

// router.get('/v1/books', (ctx, next) => {
//     ctx.body = {
//         name: 'feiy'
//     }
// })


app.listen(3006)
