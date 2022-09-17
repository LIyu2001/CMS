window.onload = function () {
  layui.use(['element', 'form', 'jquery', 'layer'], function () {
    //属性解构赋值，方便，简单
    var { element, form, $, layer } = layui

    //表单提交
    form.on("submit(navForm)", (data) => {
      //发送请求
      // console.log(data);
      //data.field
      $.ajax({
        type: "POST",
        url: "/admin/nav/insert",
        data: data.field,
        dataType: "json",
        success: res => {
          // layer.open({
          //   type: 1,
          //   content: res //注意，如果str是object，那么需要字符拼接。
          // });
          var { code, msg } = res
          if (code == 1) {
            layer.open({
              title: '提示',
              content: msg,
              icon: 1
            });
          }
          if (code == 0) {
            layer.open({
              title: '提示',
              content: msg,
              icon: 2
            });

          }



          console.log(res)
        }
      })
      //阻止表单提交跳转
      return false
    })
  })
}