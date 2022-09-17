const express = require("express")
const app = express()
const ejs = require("ejs")
const path = require("path")
const Joi = require("joi")
const session = require("express-session")

//配制静态资源
app.use(express.static("static"))

//解析post数据
app.use(express.json())
app.use(express.urlencoded({ extended: false }))




// 配置session
app.use(session({
  name: "CMS",
  cookie: {
    maxAge: 1000 * 60 * 60
  },
  secret: "keyboard cat",
  resave: false,              //以最后一次操作开始计时
  saveUninitialized: true     //刷新页面就会产生cookie
}))

//配置模板引擎
app.set('views', path.join(__dirname, 'views')); //设置模板存贮位置
app.set('view engine', 'html');
app.engine('html', ejs.renderFile) //使用ejs模板引擎解析html

//管理端路由模块
const adminRouter = require("./router/admin")
const { MulterError } = require("multer")
app.use("/admin", adminRouter)



//用户端路由
const indexRouter = require("./router/index")
app.use("/", indexRouter)



//404页面
app.use((req, res, next) => {
  res.render("404.html")
  next()
})




//错误级别的中间件
app.use(function (err, req, res, next) {
  //insttanceof 对象是否由构造函数实例化的,表单校验错误
  if (err instanceof Joi.ValidationError) {
    return res.send({
      code: 0,
      msg: err.message
    })
  }

  //文件上传校验
  if (err instanceof MulterError) {
    return res.send({
      code: 0,
      msg: err.message
    })
  }

  res.send({
    code: 0,
    msg: err.message
  })

})


app.listen('80', () => {
  console.log('express is running at http://127.0.0.1/');
})