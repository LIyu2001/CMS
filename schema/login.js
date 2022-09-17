//定义验证规则
const joi = require("joi")

const username = joi.string().alphanum().required()
const password = joi.string().pattern(/^[\S]{6,12}$/).required()




exports.login_schema = {
  body: {
    //属性名和属性值一致，写一个就可以
    username,
    password
  }
}
