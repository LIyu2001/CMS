const express = require('express')
const router = express.Router()


router.get("/", (req, res) => {
  //渲染登陆页面
  res.render("admin/index", { username: req.session.userInfo.username })
})



module.exports = router