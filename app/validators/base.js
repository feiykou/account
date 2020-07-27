const { Rule, LinValidator } = require('../../core/lin-validator')

class BaseValidator extends LinValidator {
    constructor() {
        super()
        this.handleError = [
            new Rule('isOptional'),
            new Rule('isBoolean','需要是布尔值')
        ]
    }
}

module.exports = {
    BaseValidator
}