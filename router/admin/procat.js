const express = require("express")
const router = express.Router()
const db = require("../../db/index")
const { cate_schema } = require("../../schema/cate")
const expressJoi = require("@escook/express-joi")

//先渲染项目分类列表
router.get("/", (req, res) => {
  res.render("admin/project_cate")
})

//添加数据
router.post("/insert", expressJoi(cate_schema), (req, res) => {
  var { pc_name } = req.body
  //这是为了查找重复数据而执行的sql语句
  const sqlsame = `SELECT * FROM project_cate WHERE pc_name = '${pc_name}'`
  db.query(sqlsame, (err, result) => {
    if (err) return res.send({ code: 0, msg: err.message })
    // console.log(result);
    if (result.length >= 1 && result[0].pc_name == pc_name) {
      return res.send({
        code: 0,
        msg: "名称重复，请重新输入"
      })
    } else {
      //插入数据
      const sql = `INSERT INTO project_cate (pc_name) VALUES ('${pc_name}');`
      db.query(sql, (err, results) => {
        if (err) return res.send({ code: 0, msg: err.message })
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
    }
  })
})



//get请求获取表格数据
router.get("/query", (req, res) => {
  const { page, limit } = req.query
  //分页功能
  /**
   * page 1     0,1,2,3,4        0,5  (1-1)*5
   * page 2     5,6,7,8,9        5,5  (2-1)*5  
   * page 3     10,11,12,13,14   10,5  (3-1)*5
   */
  let offset = (page - 1) * limit

  // console.log(req.query);
  let counts;
  //获取数据总条数
  const sqlcount = `SELECT COUNT(*) AS counts FROM project_cate ;`
  db.query(sqlcount, (err, results) => {
    // console.log(results[0]);
    if (err) return res.send({ msg: err.message })
    counts = results[0].counts
  })


  const sql = `SELECT * FROM project_cate LIMIT ${offset},${limit} ;`
  db.query(sql, (err, results) => {
    if (err) return res.send({ code: 1, msg: err })
    if (results.length) {
      return res.send({
        code: 0,
        msg: "查询成功",
        count: counts,
        data: results,
      })
    } else {
      return res.send({
        code: 1,
        msg: "查询失败"
      })
    }
  })
})

//更新功能
router.get("/update", (req, res) => {
  var { id, is_delete } = req.query
  // console.log(is_delete);
  // console.log(id);
  const sql = `UPDATE project_cate  SET  is_delete = '${is_delete}' WHERE pc_id = '${id}';`
  db.query(sql, (err, results) => {
    if (err) return res.send({ code: 0, msg: err.message })
    if (results.affectedRows) {
      return res.send({
        code: 1,
        msg: "修改成功"
      })
    }
    if (!results.affectedRows) {
      return res.send({
        code: 0,
        msg: "修改失败"
      })
    }
  })
})

module.exports = router