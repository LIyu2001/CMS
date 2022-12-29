const express = require('express')
const router = express.Router()
const db = require("../../db/index")
const setPassword = require("../../lib/tools")



//后端数据验证   导入表单数据验证的中间件
const exportsJoi = require("@escook/express-joi")
//导入验证规则 ，解构赋值
const { login_schema } = require("../../schema/login")


//渲染登陆页面
router.get("/", (req, res) => {
  res.render("admin/login")
})

router.get("/a", (req, res) => {
  res.render("admin/login_ajax")
})


// 登陆功能  给自己的页面写的路由
router.post("/a", exportsJoi(login_schema), (req, res) => {
  //1. 解构赋值，拿取到值
  const { username, password } = req.body
  // console.log(req.body);
  //2.查询数据库
  const sql = "select username,password from admin where username = ? ;"
  db.query(sql, username, (err, results) => {
    //1. 检查数据库是否有问题
    if (err) {
      res.send({
        code: 0,
        msg: err.message
      })
    }
    //2. 检查用户是否存在，使用results.length的长度来进行判断
    if (results.length !== 1) {
      res.send({
        code: 1,
        msg: "用户名不存在，先注册再登陆"
      })
    }
    //3. 判断密码是否正确，由于表中的密码都是加密过的，所以需要提前解密
    if (password == setPassword(results[0].password)) {
      res.redirect("/admin/index")
    } else {
      res.send({
        code: 0,
        msg: "密码错误"
      })
    }
  })

})

//登陆功能
router.post("/", exportsJoi(login_schema), (req, res) => {
  const { username, password } = req.body;
  //查询数据库
  /***
   * 先检查sql语句是否正确
   * 查，有没有用户名，没有：返回登陆失败，用户名不存在 results.length
   *                   有：用户存在，密码是否正确： 错误：密码有误  
   *                                              正确：登陆成功 
   */
  const sql = "select username,password from admin where username = ? ;"
  db.query(sql, username, (err, results) => {
    //1. 检查sql进行检查
    if (err) {
      return res.send({
        code: 0,
        msg: err.message
      })
    }
    //2. 用户名检查
    if (results.length !== 1) {

      return res.send({
        code: 0,
        msg: "用户名不存在"
      })

    }
    //3. 检查密码是否正确
    if (password == setPassword(results[0].password)) {
      // console.log(req.body);
      req.session.userInfo = req.body

      // console.log(req.session);
      return res.send({
        code: 1,
        msg: "登陆成功"
      })
    } else {
      return res.send({
        code: 0,
        msg: "密码错误"
      })
    }
  })

})


//退出登陆
/**
 * 点击 退出登录  /admin/login/logout
 * 跳转登陆页面   /admin/login
 */

router.get("/logout", (req, res) => {
  req.session.destroy()
  res.redirect("/admin/login/")
})

module.exports = router