const multer = require('multer')
const path = require("path")

// 文件上传参数设置
const storage = multer.diskStorage({
  //文件的存储路径
  destination: path.join(__dirname, '../static/upload'),
  filename: function (req, file, cb) {
    var type = file.originalname.split(".")[1]//取得文件后缀
    cb(null, `${file.fieldname}-${Date.now().toString()}.${type}`)
  }

})

//文件限制
const limits = {
  fields: 10, //非文件字段数量
  fieldSize: 3000 * 1024,//文件的大小，（3000kb*1024）字节 b
  files: 1//文件上传
}

//文件上传的实例
const upload = multer({ storage, limits })


module.exports = upload
