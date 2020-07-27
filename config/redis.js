const Redis = require('ioredis')
const redis = {
    port: 6379,          // Redis port
    password: 'mgoiredis',
    host: '47.107.151.126',   // Redis host
    prefix: 'account:', //存诸前缀
    ttl: 60 * 60 * 24,  //过期时间   
    family: 4,
    db: 0
}
const newRedis = new Redis(redis)
module.exports = newRedis