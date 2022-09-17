const crypto = require("crypto-js")

//负责密码加密
function setPassword(password) {
  // 加密
  // var a = crypto.AES.encrypt("123456", "architec").toString();

  // 解密
  // var b = crypto.AES.decrypt(a, "architec").toString(crypto.enc.Utf8)

  return crypto.AES.decrypt(password, "architec").toString(crypto.enc.Utf8)
}


module.exports = setPassword


