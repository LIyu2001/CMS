const express = require('express')
const router = express.Router()
const db = require("../../db/index")
const upload = require("../../lib/upload")
const path = require("path")
const fs = require("fs")

// const times = new Date()
// console.log(times);
// times.toLocaleString
// console.log('times.toLocaleString: ', times.toLocaleString());   //日期时间部分
// times.toLocaleDateString   //日期部分
// times.toLocaleTimeString   //时间部分

//项目管理的路由模块
//项目添加
router.get("/insert", (req, res) => {
  //渲染登陆页面
  const sql = `SELECT * FROM project_cate WHERE is_delete = 1;`
  db.query(sql, (err, result) => {
    if (err) throw err.message
    res.render("admin/project_add", { category: result })
  })

})

//图片上穿
router.post("/upload", upload.single("file"), (req, res) => {
  res.send({
    code: 1,
    url: "/upload/" + req.file.filename
  })
})

//添加数据
router.post("/insert", (req, res) => {
  const times = new Date()
  // console.log(times); 

  const { pc_id, project_title, project_thumb, project_banner, project_content } = req.body
  const sql = `INSERT INTO project (project_title,pc_id,project_thumb,project_banner,project_content,ctime) VALUES ('${project_title}','${pc_id}','${project_thumb}','${project_banner}','${project_content}','${times.toLocaleString()}')`
  db.query(sql, (err, result) => {
    if (err) throw err.message
    if (result.affectedRows == 1) {
      res.send({
        code: 1,
        msg: "添加成功"
      })
    } else {
      res.send({
        code: 0,
        msg: "添加失败"
      })
    }
  })

})


//项目列表页面渲染
router.get("/", (req, res) => {
  res.render("admin/project_list")

})



router.get("/query", (req, res) => {
  //进行判断，有值就取出，没值置空
  let issearch = req.query.project_title ? req.query.project_title : ''
  const { page, limit } = req.query
  let count;
  //设置分页
  /***
   * page:1  limit:5     0~4     (1-1)*5  5
   * page:2  limit:5     5~9     (2-1)*5  5
   */
  let offset = (page - 1) * limit;
  //查询数据总条数
  const sqlcount = `SELECT COUNT(*) AS  count FROM project WHERE project_title LIKE  '%${issearch}%'`;
  db.query(sqlcount, (err, results) => {
    if (err) return res.send({ code: 0, msg: err.message })
    // console.log(results);
    count = results[0].count
  })


  const sql = `select project_id,project_title,project_thumb, project.is_delete , pc_name, project.ctime FROM project, project_cate WHERE project_title LIKE '%${issearch}%' AND project_cate.pc_id = project.pc_id LIMIT ${offset},${limit};`

  db.query(sql, (err, results) => {
    if (err) return res.send({ code: 0, msg: err.message })
    if (results.length !== 0) {
      results.forEach((item) => {
        // console.log(item.ctime);
        item.ctime = item.ctime.toLocaleString();
      })
      res.send({
        code: 0,
        msg: "数据查询成功",
        count,
        data: results
      })
      // console.log(results);
    } else {
      res.send({
        code: 1,
        msg: "数据查询失败"
      })
    }
  })
})


//是否删除后台接口
router.get("/is_delete", (req, res) => {
  var { project_id, is_delete } = req.query
  const sql = `UPDATE project SET is_delete = '${is_delete}' WHERE project_id = '${project_id}';`
  db.query(sql, (err, results) => {
    if (err) return res.send({ code: 0, msg: err.message })
    if (results.affectedRows === 1) {
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
})



//查看单条数据
router.get("/list", (req, res) => {
  // console.log(req.query);
  //展示数据的操作
  const sql = `select project.*,project_cate.pc_name FROM project ,project_cate WHERE project.pc_id = project_cate.pc_id AND project_id = '${req.query.id}';`
  db.query(sql, (err, results) => {
    // console.log(results);
    if (err) return res.send({ code: 0, msg: err.message })
    if (results.length >= 1) {
      res.render("admin/proLook", { data: results[0] })
    }
  })

})

//查询单条数据
router.get("/update", (req, res) => {
  //查询project_cart表
  var rescat = []
  const sql_cart = `SELECT * FROM project_cate WHERE is_delete = 1`
  db.query(sql_cart, (err, result) => {
    if (err) throw err.message
    rescat = result
  })
  //查询整条数据
  const sql = `select project.*,project_cate.pc_name FROM project ,project_cate WHERE project.pc_id = project_cate.pc_id AND project_id = '${req.query.id}';`
  db.query(sql, (err, results) => {
    // console.log(results);
    if (err) return res.send({ code: 0, msg: err.message })
    if (results.length >= 1) {
      // console.log(results[0]);
      // console.log(rescat);
      res.render("admin/proEdit", { data: results[0], category: rescat })
    }

  })
})



//数据修改接口
router.post("/update", (req, res) => {
  // console.log(req.body);
  var { project_id, pc_id, project_title, delete_project_thumb, project_content, delete_project_banner } = req.body
  //分情况去讨论
  /**
   * 1. 只改文本，没改图片   new_project_thumb false,new_project_banner false
   * 2. 改图片    改缩略图，不改组图     new_project_thumb true, new_project_banner false
   *              改缩略图，改组图       new_project_thumb true, new_project_banner true
   *              不改缩略图，改组图     new_project_thumb  false, new_project_banner  true
   */

  //只改文本
  if (!req.body.new_project_thumb && !req.body.new_project_banner) {
    const sql = `UPDATE project SET project_title = '${project_title}',project_content='${project_content}',pc_id=${pc_id} WHERE project_id='${project_id}';`
    db.query(sql, (err, result) => {
      if (err) return res.send({ code: 0, msg: err.message })
      if (result.affectedRows >= 1) {
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

  //改缩略图，不该组图
  if (req.body.new_project_thumb != '' && req.body.new_project_banner == '') {
    const sql = `UPDATE project SET project_title = '${project_title}',project_content='${project_content}',pc_id=${pc_id} ,project_thumb='${req.body.new_project_thumb}' WHERE project_id='${project_id}';`
    db.query(sql, (err, result) => {
      if (err) return res.send({ code: 0, msg: err.message })
      if (result.affectedRows >= 1) {
        const url = path.join(__dirname, "../../static", delete_project_thumb)
        fs.unlink(url, (err) => {
          if (err) {
            return res.send({ code: 0, msg: "删除失败" })
          }
        })
        //删除图片
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

  //改缩略图，改组图
  if (req.body.new_project_thumb != '' && req.body.new_project_banner != '') {

    const sql = `UPDATE project SET project_title = '${project_title}',project_content='${project_content}',pc_id=${pc_id} ,project_thumb='${req.body.new_project_thumb}' ,project_banner='${req.body.new_project_banner}' WHERE project_id='${project_id}';`
    db.query(sql, (err, result) => {
      if (err) return res.send({ code: 0, msg: err.message })
      if (result.affectedRows >= 1) {
        //删除缩略图
        const url = path.join(__dirname, "../../static", delete_project_thumb)
        fs.unlink(url, (err) => {
          if (err) {
            return res.send({ code: 0, msg: "删除失败" })
          }
        })

        //删除组图
        req.body.new_project_banner.split(",").forEach(index => {
          const url = path.join(__dirname, "../../static", index)
          fs.unlink(url, (err) => {
            if (err) {
              return res.send({ code: 0, msg: "删除失败" })
            }
          })
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



  }
  //不改缩略图，改组图
  if (req.body.new_project_thumb == '' && req.body.new_project_banner != '') {

    // console.log(req.body.new_project_banner);
    // console.log(req.body.new_project_banner.split(",").length);


    const sql = `UPDATE project SET project_title = '${project_title}',project_content='${project_content}',pc_id=${pc_id} ,project_banner='${req.body.new_project_banner}' WHERE project_id='${project_id}';`

    // console.log(req.body.delete_project_banner);




    db.query(sql, (err, result) => {
      if (err) return res.send({ code: 0, msg: err.message })
      if (result.affectedRows >= 1) {

        //删除图片
        req.body.delete_project_banner.split(",").forEach(index => {
          const url = path.join(__dirname, "../../static", index)
          console.log(url);
          fs.unlink(url, (err) => {
            if (err) {
              return res.send({ code: 0, msg: "删除失败" })
            }
          })
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

  }

})



module.exports = router


// results[0]
// {
//   project_id: 13,
//   project_title: '知识分类',
//   project_thumb: '/upload/file-1657070771467.png',
//   project_content: '<p><span>敖厂长制作的《囧的呼唤》系列是国内目前点击率最高的单机游戏讲解类视频，也是以游戏娱乐讲解和游戏文化探讨为主旋律的在线系列视频。</span></p><p><span><br></span></p><p><span>敖厂长最为成功的作品便是从09年7月开始制作的一系列原创剧情的《囧的呼唤》，受到了BAIDU贴吧、各大视频网站网友们的喜爱。</span></p>',
//   project_banner: '/upload/file-1657070800829.png,/upload/file-1657070800829.png',
//   is_delete: 1,
//   pc_id: 4,
//   pc_name: '知识'
// }
