const express = require('express')
const path = require("path")
const db = require("../../db/index")
const fs = require("fs")
const router = express.Router()
const upload = require("../../lib/upload")







//banner列表页面渲染
router.get("/", (req, res) => {
  res.render("admin/banner_list")
})


//banner添加页面渲染
router.get("/insert", (req, res) => {
  //渲染登陆页面
  res.render("admin/banner_add")
})



//banner添加接口
router.post("/insert", (req, res) => {
  const { banner_name, banner_sort, banner_img } = req.body
  //判断重复
  const sqlsame = `SELECT * FROM banner WHERE banner_name = '${banner_name}';`
  db.query(sqlsame, (err, results) => {
    if (err) { return res.send({ code: 0, msg: err.message }) }
    if (results.length) {
      return res.send({
        code: 0,
        msg: "该名称已经存在，请修改后提交"
      })
    }
    //执行插入操作
    const sql = `INSERT INTO banner (banner_name,banner_sort,banner_img) VALUES ('${banner_name}','${banner_sort}','${banner_img}');`
    db.query(sql, (err, results) => {
      if (err) return err.message
      if (results.affectedRows) {
        return res.send({
          code: 1,
          msg: "添加成功"
        })
      } else {
        return res.send({
          code: 0,
          msg: "添加失败"
        })
      }
    })
  })
})


// banner上传接口：
router.post("/upload", upload.single("file"), (req, res) => {
  // console.log(req.file.filename);
  res.send({
    code: 1,
    url: `/upload/${req.file.filename}`
    // url: "/upload/" + req.file.filename
  })
})




//表格数据渲染
router.get("/query", (req, res) => {
  const {banner_id} = req.query;
  let sql = "";
  if (banner_id) {
    //查询数据
    sql = `SELECT * FROM banner WHERE banner_id = '${banner_id}';`
    db.query(sql, (err, result) => {
      if (err) return err.message
      if (result.length) {
        res.send({
          code: 1,
          msg: "查询成功",
          data: result[0]
        })
      } else {
        res.send({
          code: 0,
          msg: "查询失败"

        })
      }
    })
  } else {
    sql = "SELECT * FROM banner ORDER BY banner_id DESC;"
    db.query(sql, (err, results) => {
      if (err) return res.send({ code: 0, msg: err.message })
      if (results.length != 0) {
        res.send({
          code: 0,
          msg: "查询成功",
          data: results,
          count: 100
        })
      } else {
        res.send({
          code: 1,
          msg: "查询失败"
        })
      }
    })
  }

})

//图片排序的修改
router.get("/update", (req, res) => {
  const {banner_id, banner_sort} = req.query;
  const sql = `UPDATE banner SET banner_sort = '${banner_sort}' WHERE banner_id = '${banner_id}';`
  db.query(sql, (err, result) => {
    if (err) return err.msg
    if (result.affectedRows === 1) {
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


router.post("/updateAll", (req, res) => {
  var { banner_id, banner_name, banner_delete } = req.body
  if (req.body.banner_img) {
    //修改图片，字符串存在则为真,""为假
    const sql = `UPDATE banner SET banner_name='${banner_name}',banner_img='${req.body.banner_img}' WHERE banner_id = ${banner_id};`
    db.query(sql, (err, result) => {
      if (err) return res.send({ code: 0, msg: err.message })
      if (result.affectedRows === 1) {
        //设置删除路径
        const url = path.join(__dirname + "../../../static", banner_delete)
        // console.log(url);
        fs.unlink(url, (error) => {
          if (error) {
            return res.send({
              code: 0,
              msg: `图片删除失败:${error.message}`
            })
          }

        })
        res.send({
          code: 1,
          msg: "修改成功"
        })
      } else {
        res.send({
          code: 0,
          msg: "修改失败"
        })
      }
    })
  } else {
    //不修改图片
    const sql = `UPDATE banner SET banner_name='${banner_name}' WHERE banner_id = ${banner_id};`
    db.query(sql, (err, result) => {
      if (err) return res.send({ code: 0, msg: err.message })
      if (result.affectedRows === 1) {
        res.send({
          code: 1,
          msg: "修改成功"
        })
      } else {
        res.send({
          code: 0,
          msg: "修改失败"
        })
      }
    })

  }

})



//图片的删除接口
router.get("/delete", (req, res) => {
  // console.log(req.query);
  const { id, img } = req.query
  const sql = `DELETE FROM banner WHERE banner_id = '${id}' ;`
  db.query(sql, (err, result) => {

    if (err) res.send({ code: 0, msg: err.message })
    if (result.affectedRows === 1) {
      const url = path.join(__dirname, "../../static", img)
      //成功，图片删除
      fs.unlink(url, (error) => {
        if (error) return res.send({
          code: 0,
          msg: `图片删除失败;${error.message}`
        })
      })
      res.send({
        code: 1,
        msg: "删除成功"
      })
    } else {
      res.send({
        code: 0,
        msg: "删除失败"
      })
    }
  })

})







module.exports = router

/**
 * 添加： /insert  get
 *        /insert post
 * 展示： /        get
 *        /query  get（分页）
 *
 * 删除：/delete  get（删除数据库中的文件，删除服务器图片）
 *
 * 思路查询数据库中对应图片的存储数据
 * 1. banner_img 从客户端携带 id,img
 * 2. 只传id查询数据库，找到banner_img的值
 */


/**
 * 图片上传的思路
 * 思路；客户端--点击上传--服务器上（物理位置）
 * banner_img:存放的是图片在服务器上的路径
 *
 * 添加数据：
 * 1. 上传图片：上传到服务器
 */



//文件上传的参数设置(文件在服务器上的存储位置)
//文件的命名：2022-07-04/文件，时间戳+随机数0-1000.jpg



