const joi = require("joi")

//定义验证规则
const nc_name = joi.string().required()



exports.nc_schema = {
  body: {
    nc_name,
  }
}

