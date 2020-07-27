const { Sequelize, Model, DataTypes } = require("sequelize");
// 引入连接数据库的sequelize对象
const { db } = require('../../core/db')

const { Classic } = require('./classic')

class Favo extends Model {
    // 数据库事务
    // 数据库一致性
    // ACID 原子性，隔离性，一致性，持久性
    static async like(art_id, type, uid) {
        // 数据库是否存在
        const favoData = await Favo.findOne({
            where: {
                art_id,
                type,
                uid
            }
        })
        
        if(favoData) {
            throw new global.errs.LikeError()
        }
        try {
            // 插入数据
            // 更改classic表自增数据
            return await db.transaction(async t => {
                Favo.create({
                    art_id,
                    type,
                    uid
                }, { transaction: t })
                const classic = await Classic.getDetail({id: art_id, type})
                await classic.increment('fav_nums', {by: 1, transaction: t })
            })
        } catch(e) {

        }
        
    }

    static async dislike(art_id, type, uid) {
        const favor = await Favo.findOne({
            where: {
                art_id,
                type,
                uid
            }
        })
        if(!favor) {
            throw new global.errs.DislikeError()
        }
        try{
            // 插入数据
            // 更改classic表自增数据
            return await db.transaction(async t => {
                favor.destroy({
                    transaction: t
                })
                const classic = await Classic.getDetail({id: art_id, type})
                await classic.decrement('fav_nums', {by: 1, transaction: t }) 
            })
        } catch(e) {

        }
    }


}

Favo.init({
    uid: DataTypes.INTEGER,
    art_id: DataTypes.INTEGER,
    type: DataTypes.INTEGER
}, {
    sequelize: db,
    paranoid: false,
    modelName: 'favorite'
})


module.exports = {
    Favo
}