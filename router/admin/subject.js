const express = require('express')
const router = express.Router()
const db = require('../../db/index')
const upload = require('../../lib/upload')

//专题添加
router.get("/insert", (req, res) => {
    const sql = `select * from news_cate where nc_is_delete=0`
    db.query(sql, (err, results) => {
        if (err) return res.send({ code: 0, msg: err.message })
        res.render('admin/subject_add', { category: results })
    })
})
router.post('/insert', (req, res) => {
    const { news_title, news_thumb, news_desc, news_content, nc_id } = req.body
    console.log(news_content);
    let { news_ctime } = req.body.news_ctime
    var myDate = new Date()
    news_ctime = myDate.toLocaleDateString() + ' ' + myDate.getHours() + ':' + myDate.getMinutes() + ':' + myDate.getSeconds()
    // 查重
    const sqlStr = `select news_title from news where news_title='${news_title}'`
    db.query(sqlStr, (err, results) => {
        if (err) return res.send({ code: 0, msg: err.message })
        if (results.length != 0 && results[0].news_title == news_title) {
            return res.send({ code: 0, msg: '专题名称重复，请重新输入' })
        }
        // 添加专题
        const sql = `insert into news(news_title,news_thumb,news_desc,news_content,news_ctime,nc_id) values('${news_title}','${news_thumb}','${news_desc}','${news_content}','${news_ctime}','${nc_id}')`
        db.query(sql, (err, results) => {
            if (err) return res.send({ code: 0, msg: err.message })
            if (results.affectedRows == 1) {
                return res.send({ code: 0, msg: '添加成功' })
            } else {
                return res.send({ code: 0, msg: '添加失败' })
            }
        })
    })

})
// 图片上传
router.post('/upload', upload.single('file'), (req, res) => {
    res.send({
        code: 1,
        url: '/upload/' + req.file.filename
    })
})

//专题查看列表
router.get("/", (req, res) => {
    res.render("admin/subject_list")
})



//表格数据渲染
router.get("/query", (req, res) => {
    // console.log(req.query);
    var { page, limit } = req.query
    const offset = (page - 1) * limit
    let count
    const sqlnum = `select COUNT(*) AS count FROM news `
    db.query(sqlnum, (err, result) => {
        if (err) return res.send({ code: 1, msg: err.message })
        // console.log(result);
        count = result[0].count
    })


    const sql = `SELECT
    news.news_thumb,
    news.news_title,
    news.news_ctime,
    news.news_visit,
    news.news_is_delete,
    news.news_id,
    news_cate.nc_name,
    news.news_is_delete
    FROM
    news ,
    news_cate
    WHERE
    news.nc_id = news_cate.nc_id
    LIMIT ${offset}, ${limit}
    `

    db.query(sql, (err, results) => {
        if (err) return res.send({ code: 1, msg: err.message })
        if (results.length != 0) {
            res.send({
                code: 0,
                msg: "查询成功",
                data: results,
                count: count
            })
        } else {
            res.send({
                code: 1,
                msg: "查询失败"
            })
        }
    })
})

//新闻观察量的修改
router.get("/update", (req, res) => {
    var { news_id, news_visit } = req.query
    const sql = `UPDATE news SET news_visit = '${news_visit}' WHERE news_id = '${news_id}';`
    db.query(sql, (err, result) => {
        if (err) return err.msg
        if (result.affectedRows == 1) {
            return res.send({
                code: 1,
                msg: "修改成功"
            })
        } else {
            return res.send({
                code: 0,
                msg: "修改失败"
            })
        }
    })
})

//状态修改
router.get("/isdelete", (req, res) => {
    var { news_id, news_is_delete } = req.query
    const sql = `UPDATE news SET news_is_delete = '${news_is_delete}' WHERE news_id = '${news_id}';`
    db.query(sql, (err, result) => {
        if (err) return err.msg
        if (result.affectedRows == 1) {
            return res.send({
                code: 1,
                msg: "修改成功"
            })
        } else {
            return res.send({
                code: 0,
                msg: "修改失败"
            })
        }
    })
})



module.exports = router