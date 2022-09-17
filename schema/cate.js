const joi = require("joi")


//定义验证规则，只做一个字段的验证，名称的验证
const pc_name = joi.string().required()

exports.cate_schema = {
  body: {
    pc_name
  }
}