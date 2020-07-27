const { Sequelize, Model, DataTypes } = require("sequelize");
// 引入连接数据库的sequelize对象
const { db } = require('../../core/db')

class Classic extends Model {
    /**
     * 获取最新一期
     */
    static async getLatest() {
        const classic = await Classic.findOne({
            order: [
                ['index', 'DESC']
            ]
        })
        return classic
    }

    /**
     * 获取当前一期的下一期
     * @param {*} index 
     */
    static async getNext(index = -1, next=false) {
        !next ? --index : ++index
        const classic = await Classic.findOne({
            where: {
                index
            }
        })
        return classic
    }

    /**
     * 获取当前期刊详情
     * @param {*} id 
     * @param {*} type 
     */
    static async getDetail({id, type}, fields="") {
        if(fields) fields = fields.split(',')
        const attributes = fields === '' ? {exclude: ['']} : fields
        const classic = await Classic.findOne({
            where: {
                id,
                type
            },
            attributes
        })
        return classic
    }

    static async getFavors({offset = 0, limit = 10}) {
        // const classics = await Classic
        const { count, rows } = await Classic.findAndCountAll({
            where: {
                like_status: 1
            },
            offset,
            limit
        })
        return {
            rows,
            totalNum: count
        }
    }

}

Classic.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: DataTypes.STRING,
    content:  DataTypes.STRING,
    fav_nums: DataTypes.INTEGER,
    image: DataTypes.STRING,
    index: DataTypes.INTEGER,
    like_status: DataTypes.BOOLEAN,
    type: DataTypes.INTEGER
}, {
    sequelize: db,
    modelName: 'classic',
    timestamps: true,
    createdAt: 'pubdate'
})

// Classic.sync()

module.exports = {
    Classic
}
