
function isThisType(val) {
    for(let key in this) {
        if(this[key] == val) {
            return true
        }
    }
    return false
}

const LoginType = {
    isThisType,
    USER_MINI_PROGRAM: 100,
    USER_MEAIL: 101,
    USER_MOBILE: 102,
    ADMIN_EMAIL: 200
}

const AccountType = {
    isThisType,
    TIANYAN: 1,
    QICAHCHA: 2,
    ALL: 3
}

const ClassicType = {
    isThisType,
    MOVE: 100,
    MUSIC: 200,
    SENTENCE: 300
}

module.exports = {
    LoginType,
    AccountType
}