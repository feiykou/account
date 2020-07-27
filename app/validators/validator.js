const { BaseValidator } = require('./base')
const { Rule } = require('../../core/lin-validator')

const { LoginType, AccountType } = require('../lib/enum')


class PositiveIntegerValidator extends BaseValidator {
    constructor() {
        super()
        // 调用this，需要先super()
        this.id = [
            // 定义多个条件，是且关系
            // Rule第一个参数是字符串
            // isInt是从validate.js中获取的
            new Rule('isInt', '需要是正整数', {min: 1})
        ]
    }
}
function checkType(vals) {
    if(!vals.body.type) {
        throw new Error('type是必须参数')
    }
    
    if(!LoginType.isThisType(vals.body.type)) {
        throw new Error('type参数不合法')
    }
}

function checkAccountType(vals) {
    if(!vals.body.type) {
        throw new Error('type是必须参数')
    }
    
    if(!AccountType.isThisType(vals.body.type)) {
        throw new Error('type参数不合法')
    }
}

class AccountTypeValidator extends BaseValidator {
    constructor() {
        super()
    }
    validateType(vals) {
        if(!vals.path.type) {
            throw new Error('type是必须参数')
        }
        if(!AccountType.isThisType(vals.path.type)) {
            throw new Error('type参数不合法')
        }
    }
}

class AccountValidator extends BaseValidator {
    constructor() {
        super()
        this.code = [
            new Rule('isLength', '长度在4-32位', {
                min: 4,
                max: 32
            })
        ]
    }
    validateType(vals) {
        if(!vals.query.type) {
            throw new Error('type是必须参数')
        }
        
        if(!AccountType.isThisType(vals.query.type)) {
            throw new Error('type参数不合法')
        }
    }
}

class UserCodeValidator extends BaseValidator {
    constructor() {
        super()
        this.code = [
            new Rule('isLength', 'code长度在4-32位', {
                min: 4,
                max: 32
            })
        ]
    }
    // validateType = checkAccountType
}

class TokenValidator extends BaseValidator {
    constructor() {
        super()
        this.account = [
            new Rule('isLength', '不符合账号规则', {
                min: 4,
                max: 32
            })
        ]
        this.secret = [
            // 登录方式有很多种，所以要添加一个类型type，来判断是哪种登录
            // web 账号 + 密码
            // 小程序 code
            // 手机号

            // 1、该参数可以为空，可以不传
            // 2、不为空，则判断
            // isOptional 标记为isOptional，该参数可以不传，传则进行下面的验证
            new Rule('isOptional'),
            new Rule('isLength', '至少6个字符', {
                min: 6,
                max: 128
            })
        ]
    }
    validateLoginType = checkType
}

class ClassicValidator extends BaseValidator {
    constructor() {
        super()

        this.id = [
            new Rule('isInt', '必须是正整数', {min: 1})
        ]
    }

    validateClassicType(vals) {
        if(!vals.path.type) {
            throw new Error('type是必须参数')
        }

        if(!ClassicType.isThisType(vals.path.type)) {
            throw new Error('type参数不合法')
        }
    }
}

class NotEmptyValidator extends BaseValidator {
    constructor() {
        super()
        this.token = [
            new Rule('isLength','不允许为空', {min: 1})
        ]
    }
}

class PagingValidator extends BaseValidator {
    constructor() {
        super()
        this.offset = [
            new Rule('isInt', '需要是正整数', {min: 0})
        ]
        this.limit = [
            new Rule('isInt', '需要是正整数', {min: 1})
        ]
    }
}

class LikeValidator extends PositiveIntegerValidator {
    constructor() {
        super()
        this.validateType = checkType
    }
}


module.exports = {
    PositiveIntegerValidator,
    AccountValidator,
    AccountTypeValidator,
    UserCodeValidator,
    TokenValidator,
    NotEmptyValidator,
    ClassicValidator,
    PagingValidator,
    LikeValidator
}