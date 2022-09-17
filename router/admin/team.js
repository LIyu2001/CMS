const express = require("express");
const router = express.Router();
const db = require("../../db/index");
const upload = require("../../lib/upload");
const fs = require("fs");
const path = require("path");

//查看团队信息
router.get("/", (req, res) => {
    res.render("admin/team_read");
})


router.get("/add", (req, res) => {
    res.render("admin/team_add")
})

router.post("/add", (req, res) => {
    const { team_name, team_thumb, team_content } = req.body;
    //console.log(req.body);
    const sql = `select * from team where team_name='${team_name}'`;
    //console.log(sql);
    db.query(sql, (err, results) => {
        if (err) return res.send({ code: 0, msg: err.message });
        if (results.length != 0) return res.send({ code: 0, msg: ("团队名称重复") });

        const sql = `insert into team(team_name,team_thumb,team_content) value(?,?,?)`;
        //console.log(sql);
        db.query(sql, [team_name, team_thumb, team_content], (err, results) => {
            if (err) return res.send({ code: 0, msg: err.message });
            if (results.affectedRows == 1) {
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
})
//图片上传
router.post("/upload", upload.single("file"), (req, res) => {
    res.send({
        code: 1,
        url: "/upload/" + req.file.filename
    })
})


//团队列表
router.get("/list", (req, res) => {
    res.render("admin/team_list");
})


//数据库查询数据
router.get("/query", (req, res) => {
    let isSearch = req.query.search ? req.query.search : "";
    const { page, limit } = req.query;
    const offset = (page - 1) * limit;
    var count;
    const sqlstr = `select count(*) as count from team where team_name like '%${isSearch}%'`;
    db.query(sqlstr, (err, results) => {
        if (err) return err;
        count = results[0].count;
    })

    //查询数据
    const sql = `select * from team where team_name like '%${isSearch}%' limit ${offset},${limit}`;
    db.query(sql, (err, results) => {
        //console.log(results);
        //sql执行失败
        if (err) return res.send({ code: 1, msg: err.message });
        if (results.length) {
            return res.send({
                code: 0,
                msg: "数据查询成功",
                data: results,
                count: count
            });
        } else {
            return res.send({ code: 1, msg: "数据查询失败" });
        }
    })
})
//修改-删除信息
router.get("/update", (req, res) => {
    const { id, flag } = req.query;
    // console.log(id, flag);
    const sql = `UPDATE team SET is_delete = '${flag}' WHERE id = '${id}'`;
    //console.log(sql);
    db.query(sql, (err, results) => {
        //执行sql失败
        if (err) return res.send({ code: 0, msg: err.message });
        if (results.affectedRows == 1) {
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
//修改All-get
router.get("/updateAll", (req, res) => {
    const sql = `select * from team where id=${req.query.id}`;
    db.query(sql, (err, results) => {
        if (err) return res.send({ code: 0, msg: err.message });
        if (results.length == 1) {
            res.send({
                code: 1,
                msg: "查询成功",
                data: results[0]
            })
        } else {
            res.send({ code: 0, msg: "查询失败" });
        }
    })
})
////修改All-post
router.post("/updateAll", (req, res) => {
    const { id, team_name, oldteam_thumb } = req.body;
    if (req.body.team_thumb) {
        //修改图片
        const sql = `update team set team_name=?,team_thumb=? where id=?`;
        //console.log(sql);
        db.query(sql, [team_name, req.body.team_thumb, id], (err, results) => {
            //console.log(results);
            if (err) return res.send({ code: 0, msg: err.message });
            if (results.affectedRows == 1) {
                const url = path.join(__dirname, "../../static", oldteam_thumb);
                //删除旧图片
                fs.unlink(url, (error) => {
                    if (error) {
                        return res.send({ code: 0, msg: error.message });
                    }
                })
                res.send({ code: 1, msg: "修改成功" })
            } else {
                res.send({ code: 0, msg: "修改失败" })
            }
        })
    } else {
        //不修改图片
        const sql = `update team set team_name=? where id=?`;
        db.query(sql, [team_name, id], (err, results) => {
            if (err) return res.send({ code: 0, msg: err.message });
            if (results.affectedRows == 1) {
                res.send({ code: 1, msg: "修改成功" })
            } else {
                res.send({ code: 0, msg: "修改失败" })
            }
        })
    }

})
//删除
router.get("/delete", (req, res) => {
    0
    const { id, thumb } = req.query;
    const sql = "delete from team where id=?";
    db.query(sql, id, (err, results) => {
        if (err) return res.send({ code: 0, msg: err.message });
        if (results.affectedRows == 1) {
            //成功,删除图片
            const url = path.join(__dirname, "../../static", thumb);
            fs.unlink(url, (error) => {
                if (error) res.send({
                    code: 0,
                    msg: `图片删除失败:${error.message}`
                })
            })
            res.send({ code: 1, msg: "删除成功" });
        } else {
            res.send({ code: 0, msg: "删除失败" });
        }
    })
})
//查看单个团队
router.get("/read", (req, res) => {
    const sql = `select team_name,team_thumb,team_content,is_delete from team where id=${req.query.id}`;
    db.query(sql, (err, results) => {
        if (err) return res.send({ code: 0, msg: err.message });
        if (results.length != 0) {
            res.render("admin/team_read", { data: results[0] });
        }
    })
})


module.exports = router;