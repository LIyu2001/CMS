window.onload = function () {

  // $(".log").click((event) => {
  //   // event.preventDefault()
  //   $.ajax({
  //     url: "/admin/login",
  //     type: "post",
  //     data: data.field,
  //     success: function (res) {
  //       console.log(res);
  //     }
  //   })
  // })
  // console.log();

  // console.log(res);
  // if (res.code == 1) {
  //   location.href = "/admin/index"
  // } else {
  //   alert(`
  //   title:登陆信息提示
  //   状态：${res.msg}
  //   `)
  // }


  //1. 先对值进行获取，然后通过get方式向服务器端提交数据，对象方式提交，根据返回结果进行判断  跳转到首页，还是不跳转，并重置表格
  //2. 服务器端使用接受过来的参数，进行用户登陆的判断，如果成功就创建session,否则就回到登录页面。
  let username = document.querySelector('input[name="username"]')
  let password = document.querySelector('input[name="password"]')
  let form = document.querySelector("form")
  let btn = document.querySelector('input[type="submit"]');
  // console.log(btn);


  btn.onclick = e => {
    //兼容性设置
    e = e || window.event
    e.preventDefault()  //阻止默认行为
    var data = {
      username: username.value,
      password: password.value
    }
    // console.log(data);


    // 发起post请求
    $.post("/admin/login", data, (res) => {
      if (res.code == 1) {
        location.href = "/admin/index"
      } else {
        alert("登陆失败")
        //重置表单
        form.reset()
      }
      // console.log(res);
    })
  }
}