const Router = require('koa-router')
const { RegisterValidator } = require('../../validators/user')
const { User } = require('../../models/user')
const { handleResult } = require('../../lib/helper')

const router = new Router({
    prefix: '/v1/user'
})

/**
 * session：考虑状态，webservice 有状态
 * 无状态：REST
 * 有状态：操作资源，客户端发送请求，open资源，再次请求取数据，最后close
 * 
 * 用户登录流程：
 * email,password
 * token jwt
 * token有两种：一种是随机字符串，一种携带数据，一般会把uid，scope放在token中
 */
router.post('/register', async (ctx) => {
    const v = await new RegisterValidator().validate(ctx)
    const user = {
        email: v.get('body.email'),
        password: v.get('body.password2'),
        nickname: v.get('body.nickname')
    }
    const r = await User.create(user)
    handleResult('注册成功')
})

module.exports = router