const joi = require("joi")

//定义验证规则
const nav_name = joi.string().required()
const nav_alias = joi.string().required()
const nav_sort = joi.number().required()



exports.nav_schema = {
  body: {
    nav_name,
    nav_sort,
    nav_alias
  }
}

