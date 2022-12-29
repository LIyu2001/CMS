const express = require("express")
const router = express.Router()
const db = require("../db/index")
const getTime = require("../lib/gettime")

//中间件
router.use((req, res, next) => {
  //导航
  const sqlNav = "select * from nav where nav_is_show = 1 order by nav_sort asc"
  db.query(sqlNav, (err, results) => {
    if (err) return res.send({ code: 0, msg: err.message })
    if (results.length !== 0) {
      nav = results
    }
  })
  // 轮播图
  const sqlBan = 'SELECT banner_name ,banner_img from  banner order by banner_id asc'
  db.query(sqlBan, (err, results) => {
    if (err) return res.send({ code: 0, msg: err.message })
    if (results.length !== 0) {
      banner = results
    }
  })

  //项目分类
  const sqlpcate = "SELECT * FROM project_cate WHERE is_delete=1"
  db.query(sqlpcate, (err, results) => {
    if (err) return res.send({ code: 0, msg: err.message })
    if (results.length !== 0) {
      pcate = results
    }
  })
  //新闻分类
  const sqlscate = "SELECT * FROM news_cate WHERE nc_is_delete = 0"
  db.query(sqlscate, (err, results) => {
    if (err) return res.send({ code: 0, msg: err.message })
    if (results.length !== 0) {
      scate = results
    }
  })
  // 新闻
  const sql = `select news_id,news_title,news_thumb,news_desc,news_ctime from news where news_is_delete=0 order by news_id asc limit 0,8`
  db.query(sql, (err, results) => {
    if (err) return res.send({ code: 0, msg: err.message })
    if (results.length !== 0) {
      let item
      for (item of results) {
        item.news_ctime = item.news_ctime.getFullYear() + '-' + item.news_ctime.getMonth() + '-' + item.news_ctime.getDate()
      }
      newsList = results
    }
  })
  //团队成员
  const sqlteam = "SELECT * FROM team WHERE is_delete=1"
  db.query(sqlteam, (err, results) => {
    if (err) return res.send({ code: 0, msg: err.message })
    if (results.length !== 0) {
      tmber = results
    }
  })

  // 项目分类
  const sqlProat = 'SELECT project_cate.pc_name,pc_id FROM project_cate ORDER BY project_cate.pc_id DESC LIMIT 0,3'
  db.query(sqlProat, (err, results) => {
    if (err) return res.send({ code: 0, msg: err.message })
    if (results.length !== 0) {
      procat = results
    }
  })

  // 成员姓名
  const sqlTene = 'SELECT  * FROM team ORDER BY team.id ASC LIMIT 0,6'
  db.query(sqlTene, (err, results) => {
    if (err) return res.send({ code: 0, msg: err.msg })
    if (results.length !== 0) {
      tenam = results
    }
  })

  setTimeout(() => {
    res.state = nav
    res.state = banner
    res.state = pcate
    res.state = scate
    res.state = tmber
    res.state = procat
    res.state = tenam
    res.state = newsList
  }, 500)
  next()
})


//首页
router.get("/", (req, res) => {
  let project
  //项目案例
  const sqlProjet = 'SELECT project.project_title, project.project_thumb, project.pc_id FROM project WHERE is_delete = 1 ORDER BY project_id ASC LIMIT 0 ,12'
  db.query(sqlProjet, (err, results) => {
    if (err) return res.send({ code: 0, msg: err.message })
    if (results.length !== 0) {
      project = results
    }
  })
  // 新闻
  let news
  const sql = `select news_id,news_title,news_thumb,news_desc,news_ctime from news where news_is_delete=0 order by news_id asc limit 0,8`
  db.query(sql, (err, results) => {
    if (err) return res.send({ code: 0, msg: err.message })
    if (results.length !== 0) {
      news = results
    }
  })
  setTimeout(function () {
    res.render("index/index", { project, news })
  }, 500)
})


//项目案例  /project
router.get("/project", (req, res) => {
  const pc_id = req.query.id ? req.query.id : ""
  let { limit = 3, page = 1 } = req.query
  let project, totalPage
  var sql = ''
  var sqlTotal = 0
  //计算分页
  var offset = (page - 1) * limit
  if (pc_id !== 0) {

    sql = `SELECT  project.project_id ,project.project_title, project.project_thumb  FROM project WHERE is_delete = 1 AND pc_id = ${pc_id} ORDER BY project_id ASC LIMIT ${offset} ,${limit}`
    sqlTotal = `SELECT COUNT(*) AS count  FROM project WHERE is_delete = 1 AND pc_id = ${pc_id} `
  } else {
    sqlTotal = `SELECT COUNT(*) AS count  FROM project WHERE is_delete = 1  `
    sql = `SELECT  project.project_id ,project.project_title, project.project_thumb  FROM project WHERE is_delete = 1  ORDER BY project_id ASC LIMIT ${offset} ,${limit}`
  }
  //查询总数
  db.query(sqlTotal, (err, results) => {
    if (err) return res.send({ code: 0, msg: err.message })
    if (results.length !== 0) {
      totalPage = Math.ceil(results[0].count / limit)
    }
  })

  //查询项目
  db.query(sql, (err, results) => {
    // console.log(results);
    if (err) return res.send({ code: 0, msg: err.message })
    if (results.length !== 0) {
      project = results
    }
  })
  setTimeout(() => {
    res.render("index/project", { project, totalPage, pc_id, page })
  }, 500)
})



// 所有专题
// 中间件
router.use((req, res, next) => {
  // 专题分类
  const sqlSubCate = `select * from news_cate where nc_is_delete=0 `
  db.query(sqlSubCate, (err, results) => {
    if (err) return res.send({ code: 0, msg: err.message })
    if (results.length !== 0) {
      subCate = results
    }
  })
  setTimeout(function () {
    res.state = subCate
  }, 500)
  next()
})


router.get('/subject', (req, res) => {
  let sql, sqlTotal
  let id = req.query.id
  let { limit = 3, page = 1 } = req.query
  var offset = (page - 1) * limit

  // 分页
  if (id === 0) {
    sql = `select news_id,news_title,news_thumb,news_desc from news where news_is_delete=0 limit ${offset},${limit}`
    sqlTotal = `select count(*) from news where news_is_delete=0`
  } else {
    sql = `select news_id,news_title,news_thumb,news_desc from news where nc_id=${id} and news_is_delete=0 limit ${offset},${limit}`
    sqlTotal = `select count(*) from news where nc_id=${id} and news_is_delete=0`
  }

  // 查询总数
  db.query(sqlTotal, (err, results) => {
    if (err) return res.send({ code: 0, msg: err.message })
    if (results.length !== 0) {
      totalPage = Math.ceil(results[0]['count(*)'] / limit)
    }
  })
  // 查询专题
  db.query(sql, (err, results) => {
    if (err) return res.send({ code: 0, msg: err.message })
    if (results.length !== 0) {
      news = results
    }
  })
  setTimeout(function () {
    res.render('index/subject', { id, limit, page, offset, totalPage, news })
  }, 500)
})


// 专题简介
router.get('/subjectAbout', (req, res) => {
  let subAbout
  let { id } = req.query
  const sql = `select * from news where news_id=${id}`
  db.query(sql, (err, results) => {
    if (err) return res.send({ code: 0, msg: err.message })
    if (results.length !== 0) {
      results[0].news_ctime = results[0].news_ctime.getFullYear() + '-' + results[0].news_ctime.getMonth() + '-' + results[0].news_ctime.getDate()
      // 浏览量
      const sqlnum = `update news set news_visit=${results[0].news_visit + 1} where news_id=${id}`
      db.query(sqlnum, (err, results) => {
        if (err) return res.send({ code: 0, msg: err.message })
      })
      subAbout = results
    }
  })
  setTimeout(function () {
    res.render('index/subject_nav1', { subAbout })
  }, 500)
})
// 专题详情
router.get('/subjectDetails', (req, res) => {
  let subDetails
  let { id } = req.query
  const sql = `select * from news where news_id=${id}`
  db.query(sql, (err, results) => {
    if (err) return res.send({ code: 0, msg: err.message })
    if (results.length !== 0) {
      results[0].news_ctime = results[0].news_ctime.toLocaleString()
      subDetails = results
    }
  })
  // 上一篇
  const sqlPrev = `select news_id,news_title from news where news_id<${id} and news_is_delete=0 order by news_id desc limit 1`
  db.query(sqlPrev, (err, results) => {
    if (err) return res.send({ code: 0, msg: err.message })
    prev = results.length === 0 ? '没有了' : results[0]
  })
  // 下一篇
  const sqlNext = `select news_id,news_title from news where news_id>${id} and news_is_delete=0 order by news_id asc limit 1`
  db.query(sqlNext, (err, results) => {
    if (err) return res.send({ code: 0, msg: err.message })
    next = results.length === 0 ? '没有了' : results[0]
  })
  setTimeout(function () {
    res.render('index/subject_item1', { subDetails, prev, next })
  }, 500)
})



//项目详情
router.get("/detail", (req, res) => {
  let proDet, prev, next
  const sql = `SELECT project.*,project_cate.pc_name FROM project,project_cate WHERE  project.is_delete =1 AND project.pc_id = project_cate.pc_id  and project_id =${req.query.id} `
  db.query(sql, (err, result) => {
    if (err) return res.send({ code: 0, msg: err.msg })
    if (result.length) {
      result[0].project_banner = result[0].project_banner.split(",")
      // result[0].ctime = result[0].ctime.toLocaleDateString()  //只有年月日
      // result[0].ctime = result[0].ctime.toLocaleString()  //有年月日，时分秒
      result[0].ctime = getTime(result[0].ctime) + " " + result[0].ctime.toLocaleTimeString()
      proDet = result[0]

      //浏览量添加
      const sqlnum = `UPDATE project SET num = ${result[0].num + 1} WHERE project_id =  ${req.query.id}`
      // console.log(sqlnum);
      db.query(sqlnum, (err, results) => {
        if (err) return res.send({ code: 0, msg: err.msg })
        if (results.affectedRows === 1) {

        } else {

        }
      })
    }
  })




  //上一篇的内容
  const sqlPrev = `SELECT * FROM project WHERE  project.is_delete=1 AND project_id < ${req.query.id} ORDER BY project_id DESC LIMIT 0,1`
  db.query(sqlPrev, (err, results) => {
    if (err) return res.send({ code: 0, msg: err.msg })
    prev = results.length === 0 ? "没有了" : results[0]
  })

  //下一篇
  const sqlNext = `SELECT * FROM project WHERE  project.is_delete=1 AND project_id > ${req.query.id} ORDER BY project_id ASC LIMIT 0,1`
  db.query(sqlNext, (err, results) => {
    if (err) return res.send({ code: 0, msg: err.msg })
    next = results.length === 0 ? "没有了" : results[0]
  })




  setTimeout(() => {
    res.render("index/perojectDetal", { proDet, prev, next })
  }, 500)
})


//首席团队
// 关于我们
router.get('/about', (req, res) => {
  let teamifo
  const id = req.query.id ? req.query.id : ""
  let sqlteam = ''
  if (id !== 0) {
    //查询某个人的信息
    sqlteam = `SELECT  * FROM team WHERE id = ${id}`
  } else {
    //查询全部的信息
    sqlteam = `SELECT  * FROM team ORDER BY team.id ASC LIMIT 0,6`
  }

  db.query(sqlteam, (err, results) => {
    if (err) return res.send({ code: 0, msg: err.msg })
    if (results.length !== 0) {
      teamifo = results
    }
  })

  setTimeout(() => {
    res.render('index/teams', { teamifo })
  }, 500)

})

//查看团队详情页面
router.get("/teamDet", (req, res) => {
  // console.log(req.query);
  const sql = `SELECT * FROM team WHERE id= ${req.query.id}`
  db.query(sql, (err, result) => {
    if (err) return res.send({ code: 0, msg: err.msg })
    if (result.length !== 0) {
      team = result[0]
      // console.log(team);
    }
  })

  setTimeout(() => {
    res.render('index/tesms_item', { team })
  }, 500)
})

//联系我们 /connect
router.get("/connect", (req, res) => {
  res.render("index/connect")
})


//招聘信息  /hr
router.get("/hr", (req, res) => {
  res.render("index/hr")
})






module.exports = router