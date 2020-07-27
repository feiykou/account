const util = require('util')
const axios = require('axios')
const { User } = require('../models/user')
const { generateToken } = require('../../core/util')
const { Auth } = require('../../middlewares/auth')

class WXManager {

    /**
     * 生成令牌
     * @param {*} code 
     */
    static async codeToToken(code) {
        const wx = global.config.wx
        const reqUrl = util.format(wx.loginUrl, wx.appID, wx.appSecret, code)
        const result = await axios.get(reqUrl)
        if(result.status != 200) {
            throw new global.errs.AuthFailed('openid获取失败')
        }
        // 没有错误的时候，errcode是undefined，官网文档是0
        if(result.data.errcode) {
            throw new global.errs.AuthFailed('openid获取失败：' + result.data.errmsg)
        }
        let user = await User.getUserByOpenid(result.data.openid)
        if(!user) {
            user = await User.registerByOpenid(result.data.openid)
        }
        return generateToken(user.id, Auth.USER)
    }
}

module.exports = {
    WXManager
}
