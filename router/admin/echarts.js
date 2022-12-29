const express = require("express")
const router = express.Router()
const db = require("../../db/index")

router.get("/", (req, res) => {
  let procat, project, news, newC;
  const sql = `SELECT COUNT(*) AS pcat  FROM project_cate`
  db.query(sql, (err, results) => {
    if (err) return res.send({ msg: 0, msg: err.message })
    procat = results[0].pcat
  })
  const sql1 = `SELECT COUNT(*) AS proj FROM project`
  db.query(sql1, (err, result) => {
    if (err) return res.send({ msg: 0, msg: err.message })
    project = result[0].proj
  })
  const sql2 = `SELECT COUNT(*) AS news FROM news`
  db.query(sql2, (err, result) => {
    if (err) return res.send({ msg: 0, msg: err.message })
    news = result[0].news
  })
  const sql3 = `SELECT COUNT(*) AS newC FROM news_cate`
  db.query(sql3, (err, result) => {
    if (err) return res.send({ msg: 0, msg: err.message })
    newC = result[0].newC
  })

  setTimeout(function () {
    res.render("admin/echarts", { procat, project, newC, news })
  }, 500)

})


router.get("/bar", (req, res) => {
  const sql = `SELECT COUNT(*) AS count, pc_name FROM project,project_cate WHERE project.pc_id  = project_cate.pc_id AND project.is_delete = '1'  GROUP BY project.pc_id `
  db.query(sql, (err, results) => {
    if (err) return res.send({ code: 0, msg: err.message })
    if (results !== 0) {
      // console.log(results);
      res.send({
        code: 1,
        data: results
      })
    }
  })
})

router.get("/bars", (req, res) => {
  const sql = `SELECT COUNT(*) AS count, nc_name FROM news,news_cate WHERE news.nc_id = news_cate.nc_id AND news.news_is_delete = '0' GROUP BY news.nc_id`
  db.query(sql, (err, results) => {
    if (err) return res.send({ code: 0, msg: err.message })
    if (results !== 0) {
      // console.log(results);
      res.send({
        code: 1,
        data: results
      })
    }
  })
})

router.get("/view", (req, res) => {
  const sql = `SELECT news_title,news_visit FROM news WHERE news_is_delete = 0 ORDER BY news_id DESC LIMIT 0,5`
  db.query(sql, (err, results) => {
    if (err) return res.send({ code: 0, msg: err.message })
    if (results !== 0) {
      // console.log(results);
      res.send({
        code: 1,
        data: results
      })
      // console.log(results);
    }
  })
})




// SELECT COUNT(*) AS count, nc_name FROM news,news_cate WHERE news.nc_id = news_cate.nc_id AND news.news_is_delete = '1' GROUP BY news.nc_id
module.exports = router