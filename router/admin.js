const express = require("express")
const router = express.Router()

// 在访问所有页面之前进行登陆验证，路由中间件
router.use((req, res, next) => {
  if (req.url.includes("login")) {
    next()
    return
  }
  if (req.session.userInfo) {
    //重新设置session
    req.session.date = Date.now()
    next()
  } else {
    res.redirect("/admin/login")
  }
})

//登陆路由模块
const loginRouter = require("../router/admin/login")
router.use("/login", loginRouter)


//首页路由模块
const indexRouter = require("../router/admin/index")
router.use("/index", indexRouter)

//导航路由模块
const nav = require("../router/admin/nav")
router.use("/nav", nav)


//轮播图路由模块
const banner = require("../router/admin/banner")
router.use("/banner", banner)


//专题路由模块
const subject = require("../router/admin/subject")
router.use("/subject", subject)

// 专题分类模块
const subjectcateRouter = require('../router/admin/subjectCate')
router.use('/subjectcate', subjectcateRouter)

//项目管理路由模块
const project = require("../router/admin/project")
router.use("/project", project)


//项目分类模块
const procat = require("../router/admin/procat")
router.use("/procat", procat)

//团队路由模块
const teamRouter = require("./admin/team");
router.use("/team", teamRouter);

//数据可视化路由模块
const echartsRouter = require("./admin/echarts")
router.use("/echarts", echartsRouter)



module.exports = router