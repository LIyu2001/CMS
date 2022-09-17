window.onload = function () {
  layui.use(["form", "jquery", "layer"], function () {
    var form = layui.form, $ = layui.$, layer = layui.layer;


    //表单验证
    form.verify({
      username: function (value, item) { //value：表单的值、item：表单的DOM对象
        if (!new RegExp("^[a-zA-Z0-9_\u4e00-\u9fa5\\s·]+$").test(value)) {
          return '用户名不能有特殊字符';
        }
        if (/(^\_)|(\__)|(\_+$)/.test(value)) {
          return '用户名首尾不能出现下划线\'_\'';
        }
        if (/^\d+\d+\d$/.test(value)) {
          return '用户名不能全为数字';
        }

        //如果不想自动弹出默认提示框，可以直接返回 true，这时你可以通过其他任意方式提示（v2.5.7 新增）
        if (value === '死人') {
          alert('用户名不能为敏感词');
          return true;
        }
      }

      //我们既支持上述函数式的方式，也支持下述数组的形式
      //数组的两个值分别代表：[正则匹配、匹配不符时的提示文字]
      , password: [
        /^[\S]{6,12}$/
        , '密码必须6到12位，且不能出现空格'
      ]
    });

    form.on("submit(formSubmit)", function (data) {
      //向后台发送请求 原生ajax ,jquery, ajax
      //阻止页面跳转
      $.ajax({
        url: "/admin/login",
        type: "post",
        data: data.field,
        success: function (res) {
          //code码为1 成功 跳转index
          if (res.code == 1) {
            location.href = "/admin/index"
          } else {
            layer.open({
              title: '登陆信息提示',
              content: res.msg,
              icon: 2,
            })
          }
          console.log(res);
          //code码为0 提示

        }
      })
      return false;
    })
  })
}