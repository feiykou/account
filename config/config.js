module.exports = {
    environment: 'dev',
    // database: {
    //     dbName: 'account',
    //     host: 'localhost',
    //     port: 3306,
    //     user: 'root',
    //     password: 'root'
    // },
    database: {
        dbName: 'account',
        host: '47.107.151.126',
        port: 3306,
        user: 'mgoi',
        password: 'Mgoi_222'
    },
    security: {
        secretKey: 'dasdasdasfg',
        expiresIn: 60*60*24
    },
    wx: {
        appID: 'wx7e118972d418de54',
        appSecret: '5e04d7b099a4f32e93eafa918f424d96',
        loginUrl: 'https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code'
    }
}