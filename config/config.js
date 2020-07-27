module.exports = {
    environment: 'dev',
    database: {
        dbName: 'account',
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'root'
    },
    security: {
        secretKey: 'dasdasdasfg',
        expiresIn: 60*60*24
    },
    wx: {
        appID: 'wxec99ce1d7b61c46b',
        appSecret: '3d50d71ebc7e07c36018ae6134fafc69',
        loginUrl: 'https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code'
    }
}