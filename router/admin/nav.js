const express = require('express')
const router = express.Router()
const db = require("../../db/index")

//引入数据验证规则
const { nav_schema } = require("../../schema/nav")
//引入表单数据的中间件
const expressJoi = require("@escook/express-joi")

// console.log(nav_schema);

//导航添加
router.get("/insert", (req, res) => {
  //渲染登陆页面
  res.render("admin/nav_add")
})


//导航列表
router.get("/", (req, res) => {
  res.render("admin/nav_list")
})

//导航数据添加的操作
/**
 * 1. 页面渲染
 * 2. 前台数据验证
 * 3. 发起请求
 * 4. 接受数据
 * 5. 数据验证
 * 6. 根据数据验证来操作数据库
 * 7. 响应
 * 
 */
router.post("/insert", expressJoi(nav_schema), (req, res) => {
  const { nav_name, nav_alias, nav_sort } = req.body

  //查重 :查询名称与别名
  /** 
   * 名称与别名都重复   1. 项目案例，XMAL  2.项目案例 SYZT
   * 名称或别名重复     2. 首席团队，XMAL  2.项目案例 XXTD
   */
  const sqlcc = "SELECT nav_name, nav_alias FROM nav WHERE nav_name= ? OR nav_alias= ? ;"
  db.query(sqlcc, [nav_name, nav_alias], (err, results) => {
    // console.log(nav_name);
    // console.log(nav_alias);
    // console.log(results);
    //执行sql错误
    if (err) {
      return res.send({
        code: 0,
        msg: err.message
      })
    }
    //
    if (results.length >= 1 && results[0].nav_name == nav_name && results[0].nav_alias == nav_alias) {
      return res.send({
        code: 0,
        msg: "导航名称和别名都重复，请重新输入"
      })
    }
    if (res.length >= 2) {
      return res.send({
        code: 0,
        msg: "导航名称和别名都重复，请重新输入"
      })
    }
    if (res.length >= 1 && results[0].nav_alias == nav_alias) {
      return res.send({
        code: 0,
        msg: "导航别名重复，请重新输入"
      })
    }
    if (res.length >= 1 && results[0].nav_name == nav_name) {
      return res.send({
        code: 0,
        msg: "导航名称重复，请重新输入"
      })
    } else {
      //第二种拼接字符串的方法,将sql语句拼出
      var str = `insert into nav(`
      for (var i in req.body) {
        //i 属性
        //ogj[1]属性值
        str += i + ","
      }
      str = str.slice(0, -1) + ") value("
      for (var i in req.body) {
        str += `' ${req.body[i]} ',`
      }
      str = str.slice(0, -1) + ")"
      // console.log(str);
      db.query(str, (err, results) => {

        if (err) {
          return res.send(err)
        }
        if (results.affectedRows !== 1) {
          return res.send({
            code: 0,
            msg: "导航添加失败"
          })
        } else {
          return res.send({
            code: 1,
            msg: "导航添加成功"
          })
        }
      })

    }

    //插入数据
    // const sql = "INSERT INTO nav (nav_name,nav_alias,nav_sort) VALUES ( ? , ? , ?);"

    // db.query(sql, [nav_name, nav_alias, nav_sort], (err, results) => {

    //   if (err) {
    //     return res.send(err)
    //   }
    //   if (results.affectedRows != 1) {
    //     return res.send({
    //       code: 0,
    //       msg: "导航添加失败"
    //     })
    //   } else {
    //     return res.send({
    //       code: 1,
    //       msg: "导航添加成功"
    //     })
    //   }
    // })


  })
})


//查看导航页面数据
router.get("/query", (req, res) => {
  //先进行了判断，如果有值，那就取出，没值就置空
  let isSearch = req.query.search ? req.query.search : '';
  // console.log(isSearch);
  const { page, limit } = req.query
  // console.log(req.query);
  const offset = (page - 1) * limit
  //查询数据总条数
  var counts;
  //SELECT * FROM nav WHERE nav_name LIKE '%${isSearch}%'
  const sqlcount = `SELECT count(*) AS counts FROM nav  WHERE nav_name LIKE '%${isSearch}%';`
  db.query(sqlcount, (err, results) => {
    if (err) {
      return err;
    }
    counts = results[0].counts
  })
  //查询数据
  /**
   * SELECT * FROM nav limit 5
   * SELECT * FROM nav LIMIT 2,5 （数据开始的下标，截取的长度）
   * page = 1 ,limit = 5          下标0   (1-1)，  长度为5(0,1,2,3,4)
   * page = 2 ,limit = 5          下标5， (2-1)*5  长度为5(5,6,7,8,9)
   * page = 3 ,limit = 5          下标10，(3-1)*5 长度为(10,11,12,13,14)nav_name LIKE '%${search}%'
   */

  //查询导航名称
  /**
   * nav_name
   * selsect * from navlimit = search limit 0,5;
   */
  const sql = `SELECT * FROM nav WHERE nav_name LIKE '%${isSearch}%' LIMIT ${offset},${limit} ;`
  db.query(sql, (err, results) => {
    if (err) {
      return res.send({
        code: 1,
        msg: err.msg
      })
    }
    if (results.length) {

      return res.send({

        code: 0,
        msg: "数据查询成功",
        data: results,
        count: counts,
      })
    } else {
      return res.send({
        code: 1,
        msg: "数据信息查询失败"
      })
    }
  })
})


// function counts() {
//   const sqlcount = "SELECT count(*) AS count FROM nav;"
//   var count;
//   db.query(sqlcount, (err, results) => {
//     count = results[0].count
//   })
//   return count
// }
// console.log(counts());

//修改数据
/**
 * 前台： is,is_show,sort
 * 该is_show：id is_show取反值  sort
 * 该sort： is is_show,新sort
 * 
 * 
 * 后台： /admin/nav/update get
 * show： update nav set is_show = show where nav_id = id
 * sort:  update nav set nav_sort = sort where nav_id = id
 *
 * 
 * 后台：
 * 修改show:/admin/nav/updateShow
 * 修改排序：/adimn/nav/updateSort 
 */

router.get("/update", (req, res) => {
  const id = req.query.id
  const show = req.query.show ? req.query.show : ""
  const sort = req.query.sort ? req.query.sort : ""
  const url = req.query.url ? req.query.url : ""
  console.log(url);

  let sql = ""
  if (url) {
    sql = `UPDATE nav SET nav_url= '${url}' WHERE nav_id = ${id};`
    console.log(sql);
    db.query(sql, (err, results) => {
      if (err) {
        return res.send({
          code: 0,
          msg: err.message
        })
      }
      if (results.affectedRows == 1) {
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
  }
  if (show) {
    sql = `UPDATE nav SET nav_is_show= ${show} WHERE nav_id = ${id};`
    db.query(sql, (err, results) => {
      if (err) {
        return res.send({
          code: 0,
          msg: err.message
        })
      }
      if (results.affectedRows == 1) {
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
  }
  if (sort) {
    sql = `UPDATE nav SET nav_sort= ${sort} WHERE nav_id = ${id};`
    db.query(sql, (err, results) => {
      if (err) {
        return res.send({
          code: 0,
          msg: err.message
        })
      }
      if (results.affectedRows == 1) {
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
  }




})

//删除数据
//DELETE FROM nav WHERE nav_id = 4
router.get("/delete", (req, res) => {
  const sql = `DELETE FROM nav WHERE nav_id = ${req.query.id}`
  db.query(sql, (err, results) => {
    if (err) {
      return res.send({
        code: 0,
        msg: err
      })
    }
    if (results.affectedRows) {
      return res.send({
        code: 1,
        msg: "删除成功！"
      })
    } else {
      return res.send({
        code: 0,
        msg: "删除失败！"
      })
    }
  })
  // console.log('req.query: ', req.query);
})

//修改数据-获取
router.get("/updateAll", (req, res) => {
  // console.log(req.query);
  const sql = `SELECT * FROM nav WHERE nav_id = ${req.query.id};`
  db.query(sql, (err, results) => {
    if (err) return res.send({ code: 0, msg: err.message })
    if (results.length != 0) {
      res.send({
        code: 1,
        msg: "查询成功",
        data: results[0]
      })
    } else {
      res.send({
        code: 0,
        msg: "查询失败",
      })
    }
  })
  // res.send("ok")
})

//修改的更新
router.post("/updateAll", (req, res) => {
  var { nav_name, nav_alias, nav_id } = req.body
  const sql = `UPDATE nav SET nav_name = '${nav_name}' ,nav_alias='${nav_alias}' WHERE nav_id = '${nav_id}';`
  db.query(sql, (err, results) => {
    if (err) return res.send({ code: 0, msg: err.message })
    if (results.affectedRows == 1) {
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
  // console.log('nav_alias: ', nav_alias);
  // console.log('nav_name: ', nav_name);


  // res.send("post-update")
})

module.exports = router


/**
 * 1. 退出登陆  /admin/login/logout
 * 2. 展示首页  /admin/index  样式
 * 3. /admin/nav/insert  添加导航的工作   get  添加导航  渲染页面   样式 
 * 4. /admin/nav/ 展示导航                get 展示导航   渲染页面  样式
 * 
 */