const express = require('express')
const router = express.Router()
const db = require('../../db/index')

//引入数据验证规则
const { nc_schema } = require("../../schema/subjectCate")
//引入表单数据的中间件
const expressJoi = require("@escook/express-joi")

// 专题分类查看
router.get('/',(req,res)=>{
  res.render('admin/subject_cate_list')
})

// 查看专题分类数据
router.get('/query',(req,res)=>{
  // 搜索功能
  let isSearch = req.query.search? req.query.search : ''
  const {page,limit} = req.query
  const offSet = (page-1)*limit
  var count
  const sqlStr = `select count(*) as count from news_cate where nc_name like '%${isSearch}%'`
  db.query(sqlStr,(err,results)=>{
    if(err) return err
    count = results[0].count
  })

  const sql = `select * from news_cate where nc_name like '%${isSearch}%' limit ${offSet},${limit}`
  db.query(sql,(err,results)=>{
    if(err) return res.send({code:0,msg:err.message})
    if(results.length){
      return res.send({code:0,msg:'查询成功',data:results,count:count})
    }else{
      return res.send({code:1,msg:'查询失败'})
    }
  })
})

// 修改是否删除 软删除
router.get('/update',(req,res)=>{
  let isDelete = req.query.isDelete?req.query.isDelete:''
  const id = req.query.id
  const sql = `update news_cate set nc_is_delete=${isDelete} where nc_id=${id}`
  db.query(sql,(err,results)=>{
    if(err) return res.send({code:0,msg:err.msg})
    if(results.affectedRows == 1){
      return res.send({code:1,msg:'修改成功'})
    }else{
      return res.send({code:0,msg:'修改失败'})
    }
  })
})

// 删除专题分类  硬删除
router.get('/delete2',(req,res)=>{
  const id = req.query.id
  const sql = `delete from news_cate where nc_id=${id}`
  db.query(sql,(err,results)=>{
    if(err) return res.send({code:0,msg:err.message})
    if(results.affectedRows == 1){
      return res.send({code:1,msg:'永久删除成功'})
    }else{
      return res.send({code:0,msg:'永久删除失败'})
    }
  })
})

// 添加专题分类
router.post('/insert',expressJoi(nc_schema),(req,res)=>{
  const nc_name = req.body.nc_name
  // 查重
  const sqlStr = 'select nc_name from news_cate where nc_name=?'
  db.query(sqlStr,nc_name,(err,results)=>{
    if(err) return res.send({code:0,msg:message})
    if(results.length !=0 && results[0].nc_name == nc_name){
      return res.send({code:0,msg:'专题分类名称重复，请重新输入'})
    }

    const sql = `insert into news_cate(nc_name) values('${nc_name}')`
    db.query(sql,(err,results)=>{
      if(err) return res.send({code:0,msg:message})
      if(results.affectedRows == 1){
        return res.send({code:1,msg:'专题分类添加成功'})
      }else{
        return res.send({code:0,msg:'专题分类添加失败'})
      }
    })
  })
})
module.exports = router