const requireDirectory = require('require-directory')
const Router = require('koa-router')
const session = require('koa-session')
class Initmanager {
    static initCore(app) {
        Initmanager.app = app
        // 需要在路由和设置页面之前配置
        // Initmanager.setCors()
        Initmanager.initSession()
        Initmanager.initLoadRouters()
        Initmanager.loadHttpException()
        Initmanager.loadConfig()
    }

    static loadConfig(path = '') {
        const configPath = path || `${process.cwd()}/config/config.js`
        const config = require(configPath)
        global.config = config
    }

    static initLoadRouters() {
        const apiDirectory = `${process.cwd()}/app/api/v1`
        requireDirectory(module, apiDirectory, {
            visit: whenLoadModule
        })

        function whenLoadModule(obj) {
            if(obj instanceof Router) {
                Initmanager.app.use(obj.routes())
            }
        }
    }

    static loadHttpException() {
        const errors = require('./http-exception')
        global.errs = errors
    }

    static initSession() {
        Initmanager.app.keys = ['mgoi3901']
        Initmanager.app.use(session({ 
            maxAge: 1000 * 60 * 60 *24,
        }, Initmanager.app))
    }

}

module.exports = Initmanager