CMS

### npm包安装
```bash
npm i
```

### 项目运行
```bash
node .\index.js
nodemon .\index.js
```

### 登陆页面
一共写了两个登陆界面，一个是自己写的，一个是跟着文档用Layui中自带的jquery.ajax写的,用的后端接口一致。
自己写的是表单提交，不需要返回值，layui写的是有一个success函数接受参数的，目前弃用Layui搭建的登陆界面，采用自己写的登陆页面。
```bash
http://127.0.0.1/admin/login/a
http://127.0.0.1/admin/login/
```
### 后端管理首页
```bash
http://127.0.0.1/admin/index/
```

### 开发日志
#### 2022/6/29
> 1. 完成管理端登陆功能

##### 技术注意点
1. layui的使用，后台登陆页面一个是自己写的，一个是使用layui搭建的出来的，在使用Post方式向后台传送数据时，各有不同。

自己写的页面提交数据方式是post请求，后来由于要使用cookie登陆校验，防止越权访问，采用了自己写的页面。
> layui
> 在管理静态资源的文件夹static里，`login_ajax.js`就是控制layui登陆页的js文件，它负责post数据（使用layui内置的ajax）前端表单的校验(用户名不能有特殊字符等),接受后台传过来的数据，并进行判断，并将content用layer展示出来。（一般是登陆失败）
> ```js
> form.on("submit(formSubmit)", function (data) {
>      //向后台发送请求 原生ajax ,jquery, ajax
>      //阻止页面跳转
>      $.ajax({
>        url: "/admin/login",
>        type: "post",
>        data: data.field,
>        success: function (res) {
>          //code码为1 成功 跳转index
>          if (res.code == 1) {
>            location.href = "/admin/index"
>          } else {
>            layer.open({
>              title: '登陆信息提示',
>              content: res.msg,
>              icon: 2,
>            })
>          }
>          console.log(res);
>          //code码为0 提示
>
>        }
>      })
>      return false;
>    })
> ```

> post表单提交
> 直接在后台判断，通过拿到数据库的值，并进行比对，如果一致，就使用`res.redirect("/admin/index")`，完成页面的跳转。
>
> ```js
> router.post("/a", exportsJoi(login_schema), (req, res) => {
> //1. 解构赋值，拿取到值
> const { username, password } = req.body
> console.log(req.body);
> //2.查询数据库
> const sql = "select username,password from admin where username = ? ;"
> db.query(sql, username, (err, results) => {
> //1. 检查数据库是否有问题
> if (err) {
>   res.send({
>     code: 0,
>     msg: err.message
>   })
> }
> //2. 检查用户是否存在，使用results.length的长度来进行判断
> if (results.length != 1) {
>   res.send({
>     code: 1,
>     msg: "用户名不存在，先注册再登陆"
>   })
> }
> //3. 判断密码是否正确，由于表中的密码都是加密过的，所以需要提前解密
> if (password == setPassword(results[0].password)) {
>   res.redirect("/admin/index")
> } else {
>   res.send({
>     code: 0,
>     msg: "密码错误"
>   })
> }
> })
> 
> })
> ```

1. layui内置的表单校验

[layui表单校验](https://layuion.com/docs/modules/form.html#verify)

在login_ajax.js中自定义表单的规则。
```js
form.verify({
  username: ... ,
  password: ...
})
```
在login_ajax.html中，添加到对应的input标签内
```html
<input type="text" name="username" required lay-verify="required | username" placeholder="请输入用户名" autocomplete="off" class="layui-input">
```
> 注意：lay-verify
> autocomplete:off，去除表单的记忆，下次输入不会有提示

3. layer的使用

[layer弹出层](https://layuion.com/docs/modules/layer.html)

layer也是内置到layui中了，当然也可以单独下载使用。在`login_ajax.js`进行了使用。

```js
layer.open({
  title: '登陆提示',
  content: '配置各种参数，试试效果'
});     
  
```
> 注意：如果不给title值，默认值是”信息“(知道这个没啥用)

4. 数据加密
使用`CryptoJs`加解密，第三方模块，先下载后使用，项目中，对它的解密功能进了封装，未来会对加密功能进行封装。在`lib/tools.js`中。
```
npm install crypto-js
```

```js
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

```

5. 后端数据校验
使用`joi`,使用前必须将安装`joi`和`@escook/express-joi`
并在`schema/login.js`中配置规则

```js
const joi = require('joi')

/**
 * string() 值必须是字符串
 * alphanum() 值只能是包含 a-zA-Z0-9 的字符串
 * min(length) 最小长度
 * max(length) 最大长度
 * required() 值是必填项，不能为 undefined
 * pattern(正则表达式) 值必须符合正则表达式的规则
 */

// 用户名的验证规则
const username = joi.string().required();
// 密码的验证规则
const password = joi.string().pattern(/^[\S]{6,12}$/).required();

// 登录表单的验证规则对象
exports.login_schema = {
  // 表示需要对 req.body 中的数据进行验证
  body: {
    username,
    password,
  },
}
```

在`router/admin/login.js`中
```js
const { login_schema } = require('../../schema/login');
```
> 这里相当于解构赋值

并使用中间件的反式添加到需要的请求上。

```js
router.post("/",expressJoi(login_schema),(req,res)=>{});
```

最后在全局路由中，配置错误中间件，注意要放到最后。
```js
// 错误中间件
app.use(function (err, req, res, next) {
  // 数据验证失败
  if (err instanceof joi.ValidationError) return res.send(err);
  // 未知错误
  res.send(err)
})
```
> instanceof 判断err 对象是否由构造函数实例化的,如果是就输出它的错误

#### 2022/6/30

> 完成了导航栏的添加和查看

##### 项目注意点

1. SQL语句

> 在写SQL语句的时候，不但可以通过直接写好，还有一种就是通过模板字符串+遍历对象

2. layui自带的表格数据渲染

[layui官方文档](https://layuion.com/docs/modules/table.html#async)

> 下面的所有操作的前提是你`必须引入layui`!

一，先写html

```html
<body>
  <div class="layui-card">
    <div class="layui-card-header">
      <span class="layui-breadcrumb">
        <a href="">导航管理</a>
        <a><cite>查看导航</cite></a>
      </span>
    </div>
    <div class="layui-card-body">
      <form class="layui-form" action="">
        <div class="layui-inline">
          <button type="button" class="layui-btn layui-btn-danger" style="margin-right: 20px;"><i
              class="layui-icon layui-icon-delete" style="margin-right:5px;"></i>批量删除</button>
          <div class="layui-input-inline" style="width: 200px;">
            <input type="text" placeholder="请输入搜索内容" autocomplete="off" class="layui-input">
          </div>
          <button type="button" class="layui-btn"><i class="layui-icon layui-icon-search"
              style="margin-right:5px;"></i>搜索</button>
        </div>
      </form>
      <!-- 这里是表格标签 -->
      <table class="layui-table tableRender"></table>
    </div>
  </div>
</body>
```

> 注意：这里表格标签的内容是空的。

二，在页面中引入js文件，内容为：

```js

  layui.use(['element', 'table'], function () {
    var { element, table } = layui

    table.render({
      elem: '.tableRender',
      url: "/admin/nav/query",  //后端传数据的接口
      cols: [[ //表头
        { field: "nav_id", title: 'ID', width: 80, sort: true, fixed: 'left' },
        { field: 'nav_name', title: '导航名称' },
        { field: 'nav_alias', title: '导航别名' },
        { field: 'nav_sort', title: '导航排序' },
        { field: 'nav_is_show', title: '是否展示' },
        { field: '', title: '操作' },

      ]],
      page: true
    });

  });

```

> 引入`table`模块，并解构赋值。

三，写后端数据接口，通过查询数据库，来返回数据

```js
//查看导航页面数据
router.get("/query", (req, res) => {
  const sql = "SELECT * FROM nav;"
  db.query(sql, (err, results) => {
    if (err) {
      return res.send({
        code: 1,
        msg: err.msg
      })
    }
    if (results.length) {

      return res.send({

        code: 0,
        msg: "数据查询成功",
        data: results,
        count: 12,     // 这里是记录总条数
      })
    } else {
      return res.send({
        code: 1,
        msg: "数据信息查询失败"
      })
    }
  })
})
```

> 在对应路由中写接口，返回数据要按照`layui的要求`给，具体还的看官方文档。
>
> 后端数据接口路由使用`express.js`搭建。
>
> 使用了`mysql2`模块，实现数据库的交互。这里的`db`就是封装后的模块，通过引入来使用，就不在这里细说了。

四，页面渲染成功

![Snipaste_2022-06-30_19-58-44](https://super-ly-image.oss-cn-hangzhou.aliyuncs.com/Snipaste_2022-06-30_19-58-44.png)

![Snipaste_2022-06-30_19-58-10](https://super-ly-image.oss-cn-hangzhou.aliyuncs.com/Snipaste_2022-06-30_19-58-10.png)

> 这里只是带大家入个门，想要更高级的用法，可以去官方文档查看。
>


#### 2022/7/1
> 完成表格分页效果，表格动态效果。

##### 相关技术点
1. layui模板

  [表格模板](https://layuion.com/docs/modules/laytpl.html)

  在表格中，使用了layui自带的模板进行了渲染，{{d}}就可以取到这一行的数据，它是一个对象需要用.属性名的方式来取值。
```html
 value="{{d.nav_sort}}"
```



2. 是否展示功能的实现
   可以通过添加属性的方式来添加到class中，同时可以搭配三元运算符实现该功能。nav_list.html.58

```html
<script type="type/html" id="titleTpl3">
  <div>
    <span onclick="upsetShow('{{d.nav_id}}','{{d.nav_is_show?0:1}}')"class="layui-btn layui-btn-sm  {{d.nav_is_show?'':'layui-btn-danger'}}">{{d.nav_is_show?"已启用":"未启用"}}</span>
  </div>
</script>
```
>由于show属性值的特殊性（只能取0或者1），通过三元运算，在前台就将数据进行了处理（取反），并返回给后台接口进行了处理。
>
>```javascript
>  //修改是否展示
>  function upsetShow(id, show) {
>    //is_show
>    // console.log(id, show);
>    $.ajax({
>      type: "GET",
>      url: `/admin/nav/update?id=${id}&show=${show}`,
>      success: (res) => {
>        let { code, msg } = res
>        if (code == 1) {
>          //修改成功后重载表格
>          table.reload('idTest', {});
>
>        } else {
>
>        }
>        layer.msg(msg)
>        // console.log(res);
>      }
>    })
>
>  }
>```
>
>

3. 提升变量作用域
   对于无法访问的变量，但又想使用，怎么办？

> 在外部声明，函数内部赋值，这样该变量就是全局变量。
>
> ```js
> var $
> var layer
> var table
> 
> layui.use(['element', 'table', 'form', 'jquery', 'layer'], function () {
>     var { element, form } = layui
>     table = layui.table
>     $ = layui.$
>     layer = layui.layer
> }
> ```
>
> 这样，所有函数中都可以访问到 $,layer ,table

4. 修改导航排序中的值

因为使用模板渲染，绑定事件就行，可以选择`onchange`事件，只有值被修改，才会触发（向后端发起请求）,修改后的值可以通过`this.value`拿到，（自己写的是d.nav_sort,一直也拿不到！文档yysd!）

```js
onchange="updateSort('{{d.nav_id}}',this)"
function updateSort(id, obj) {
    $.ajax({
      type: "GET",
      url: `/admin/nav/update?id=${id}&sort=${obj.value}`,
      success(res) {
        let { code, msg } = res
        if (code == 1) {
          table.reload('idTest', {});
        }
        layer.msg(msg)

      }
    })
    console.log(id, obj.value);
  }


```

其他表格事件

| 属性     | 说明                                 |
| -------- | ------------------------------------ |
| onfocus  | 获取焦点                             |
| onblur   | 失去焦点                             |
| onchange | 当失去焦点，且表单的值发生改变时触发 |
| onreset  | 表单重置                             |
| onsubmit | 表单提交                             |
| oninput  | 实时获取表单的值                     |

> ### 注意：
>
> 这里修改值用的同一个接口"/admin/nav/update"，但都有共同属性nav_id，所以在`req.query`(前端发送的是get请求)里的属性进行判断。
>
> ```js
> router.get("/update", (req, res) => {
>   const id = req.query.id
>   const show = req.query.show ? req.query.show : ""
>   const sort = req.query.sort ? req.query.sort : ""
> 
>   let sql = ""
>   if (show) {
>     sql = `UPDATE nav SET nav_is_show= ${show} WHERE nav_id = ${id};`
>     db.query(sql, (err, results) => {
>       if (err) {
>         return res.send({
>           code: 0,
>           msg: err.message
>         })
>       }
>       if (results.affectedRows == 1) {
>         return res.send({
>           code: 1,
>           msg: "修改成功"
>         })
>       } else {
>         return res.send({
>           code: 0,
>           msg: "修改失败"
>         })
>       }
>     })
>   }
>   if (sort) {
>     sql = `UPDATE nav SET nav_sort= ${sort} WHERE nav_id = ${id};`
>     db.query(sql, (err, results) => {
>       if (err) {
>         return res.send({
>           code: 0,
>           msg: err.message
>         })
>       }
>       if (results.affectedRows == 1) {
>         return res.send({
>           code: 1,
>           msg: "修改成功"
>         })
>       } else {
>         return res.send({
>           code: 0,
>           msg: "修改失败"
>         })
>       }
>     })
>   }
> 
> })
> ```
>
> 或者你还可以这样做
>
> 
>
>  \* 前台： is,is_show,sort   （get请求发送过来三个值）
>
>  \* is_show：id is_show取反值  sort
>
>  \* sort： is is_show,新sort
>
>  
>
>  
>
>  \* 后台： /admin/nav/update get    （一个接口，通过判断决定采取的sql语句）
>
>  \* show： update nav set is_show = show where nav_id = id
>
>  \* sort:  update nav set nav_sort = sort where nav_id = id
>
> 
>
>  
>
>  \* 后台：（两个接口）
>
>  \* 修改show:/admin/nav/updateShow
>
>  \* 修改排序：/adimn/nav/updateSort 
>
> 

5. 表格重载

案例场景：

nav案例里有，在搜索框中输入查询数据，想要表格重载。

> 在这种情况下你会发现，输入查询内容，点击搜索后，尽管后台查询到那条数据，传给前台表格也不会改变，这时候就需要使用数据表格的重载。

在点击搜索按钮后，会获取搜索内容，并传给后台，执行搜索后，表格进行重载。

[表格重载](https://layuion.com/docs/modules/table.html#reload)

也是非常重要的一部分内容，可以添加请求参数。如果不需要，就可以不加（情况，只刷新页面）。

在绑定的table中绑定属性`id`,table.reload("`id`",{})

```js
	//需要携带参数
	table.reload('idTest', {
        where: { //设定异步数据接口的额外参数，任意设
          search: data.field.search //这里就是输入搜索框的查询内容，它会传给后台进行相关操作
        }
        , page: {
          curr: 1 //重新从第 1 页开始
        }
      });
    //不需要携带参数，只重载
    table.reload('idTest', {});
    
    
    //id绑定的table
       table.render({
      elem: '.tableRender',
      url: "/admin/nav/query",
      cols: [[]]，
      page: true,
      limit: 10,
      limits: [10, 15, 20, 25],
      id: 'idTest' 注意这里<----------------------------------
    }); 
```



6. 数据删除

| 删除   | 说明                                           |
| ------ | ---------------------------------------------- |
| 软删除 | 修改，让值成为未启用的，未启用的就不往前端渲染 |
| 硬删除 | 删除数据库中的内容                             |

> 删除这里就用硬删除了。

8. 导航名称搜索

> 注意SQL语句，以及分页的公式！
>
> Layui只会给后台返回（页数，数据条数）
>
> 所以需要我们自己去算这些。
>
> SELECT * FROM nav limit 5
>
> SELECT * FROM nav LIMIT 2,5 （数据开始的下标，截取的长度）
>
> page = 1 ,limit = 5      下标0  (1-1)，  长度为5(0,1,2,3,4)
>
> page = 2 ,limit = 5      下标5， (2-1)*5  长度为5(5,6,7,8,9)*
>
> page = 3 ,limit = 5      下标10，(3-1)*5 长度为(10,11,12,13,14)nav_name LIKE '%${search}%'

#### 2022/7/2
> 写项目分类管理
> 导航的修改功能

##### 相关技术点
1. 使用了弹出层，这次type是页面层，需要现在页面中写要显示的页面，再用content属性+jquery选择器，完成弹出层的页面显示。
```html
  <div id="addBox">
    模板内容
  </div>
```
> 放置在body最外层,下面进行引入

```js
    var index1 = layer.open({
      type: 1,
      title: '分类添加',
      content: $('#addBox') <---这里进行了绑定
    });
```
2. 在点击修改按钮后，应该先从数据库中查一下数据，得到返回值后，使用原生js也好，jquery也好,或者layui自带的表格渲染，将值添加到输入框中，再传递回更新接口。这里有个小技巧，传回的数据只包含要修改的数据，一般数据库的修改都是有条件的`where id = ?`，这时候，第一步获得id属性我们可以把他放在一个input中，但注意它的`type="hidden"`，我们的目的是将id值传回去，而不是给用户展示。
然后就可以用表单提交数据像后端接口传值。

```js
      form.on('submit(Updateform)', (data) => {
        $.ajax({
          url: "/admin/nav/updateAll",
          type: "POST",
          data: data.field,
          dataType: "json",
          success: (res) => {
            let { code, msg } = res
            if (code == 1) {
              //窗口关闭
              layer.close(index)
            }
            layer.msg(msg)
          }
        })
        //表格重载
        table.reload('idTest', {});


        return false; //阻止页面跳转。如果需要表单跳转，去掉这段即可。
      });

```

```
添加：
/admin/procat/insert  get 渲染添加页面
/admin/procat /inert   post 添加页面提交数据
1. 页面展示  2.表单（根据数据库设计） 3. 验证
2. 发起请求  5.后台接受以及验证  6.判断重复
3. 操作数据库   8. 是否影响一行给返回结果
4. 提示，关闭弹框。

查看：
/admin/procat/    get      渲染查看页面
/admin/procat/query  get    返回所有数据

1. 客户端发起请求：table模块,table.render,
2. 服务器：查询所有的数据，返回（格式）
3. 客户端数据的渲染 cols,模板渲染，分页（page;count,limit）
搜索（表格重载，where条件）

修改：
/admin/procat/update  get 获取单条数据
/admin/procat/update  post 提交修改数据

删除：
软删除  /admin/procat/delete  get

```

#### 2022/7/4
> 轮播图上传

##### 使用技术点

1. 图片上传的思路

客户端--点击上传--服务器上（物理位置）
banner_img:存放的是图片在服务器上的路径

- 添加数据：
1. 上传图片：上传到服务器：生成图片的路径
2. 上传数据到数据库，通过ajax上传表单数据

- 使用multer模块

- 安装multer

```js
npm i multer
```

- 导入multer

```js
const multer  = require('multer')
```

- 配置multer接收到的文件存储的文件夹和，存放的图片的名字

```js
//上传文件存放路径、及文件命名
const storage = multer.diskStorage({
    destination: path.join(__dirname ,'../static/uploads'),  //确定上传文件的物理位置
    filename: function (req, file, cb) { //自定义设置文件的名字，根据上传时间的时间戳来命名
        let type = file.originalname.split('.')[1]
        cb(null, `${file.fieldname}-${Date.now().toString(16)}.${type}`)
    }
})
```


- 应用这个配置到multer实例里面

```js
const upload = multer({storage});
```

- 在需要接收文件的路由里面应用upload.single(‘file’)中间件

```js
(1).这个file是前端提交表单过来的时候表单的字段名称。
(2).upload是用multer这个库里的顶级构造函数生成的实例。
```
------


2. 预览图
   

预览图用到了layui中的引用区块，在引用标签块中放入img标签，再给img标签赋值，实现预览的效果。

3. 文件删除

文件删除用到了fs模块的`ulink`
```js
    fs.unlink(url, (error) => {
      if (error) {
        throw (error)
      }
    })
```
> url：文件名，err:抛出异常

4. 时间戳配置项

用到了Date()

```js
const multer = require('multer')
const path = require("path")
// 文件上传参数设置
const storage = multer.diskStorage({
  //文件的存储路径
  destination: path.join(__dirname, '../../static/upload'),
  filename: function (req, file, cb) {
    var type = file.originalname.split(".")[1]//取得文件后缀
    cb(null, `${file.fieldname}-${Date.now().toString()}.${type}`)
  }

})


//文件上传的实例
const upload = multer({ storage })


// banner上传接口：
router.post("/upload", upload.single("file"), (req, res) => {
  // console.log(req.file.filename);
  res.send({
    code: 1,
    url: `/upload/${req.file.filename}`
    // url: "/upload/" + req.file.filename
  })
})

```
> 这样就完成了文件的上传


#### 2022/7/5
修改：/update get (id) 获取本条数据并返回
      /upload  post 修改内容，不修改图片
                    修改图片：删除图片，旧图片的路径

1. 修改属性的方法

> 原生js
document.querySelector(".imgs").src = banner_img
通过这种方式，就把banner_img赋值给 src
> jquery
$(".imgs").attr("src", banner_img)
使用jquery的attr方法修改src属性。


详细使用方法见[jquery手册](https://www.runoob.com/manual/jquery/)

2. 修改图片，和不修改图片分开写逻辑
> 1. 不修改数据：name ，sort ，img ,id
> 2. 修改图片: name ，sortt ，img(新图) ，id ,oldimg(旧图地址) 


在修改图片后，会调用upload方法，同时将图片进行保存，这样图片就有了路径。在之后的表单提交时，就会有这个值，否则就没有，所以可以根据这个值的有无，进行判断从而达到`只修改值`和`值图都修改`两种情况，分情况选择sql语句，完成该功能的实现。
- 无图片的

```json
  [Object: null prototype] {
    banner_id: '24',
    banner_name: '美女2',
    banner_img: '',
    banner_delete: '/upload/file-1656988531234.png',
    file: ''
  }
```
- 有图片的

```json
[Object: null prototype] {
  banner_id: '24',
  banner_name: '美女2',
  banner_img: '/upload/file-1656989556371.png',
  banner_delete: '/upload/file-1656988531234.png',
  file: ''
}

```
可以看到`banner_img字段`的不同，这样在后台对其进行判断。
> 不足：第一开始做的时候，没有进行区分，导致出现BUG。
> return用来终止函数，比如返回错误什么的，这个时候就需要使用retrun ,负责res.send就可以正常传回值给前端。


3. 下拉菜单的选择

> 下拉菜单不是写死的，是要从数据库中拿值，这里使用了模板语法。
> 先在数据库中进行查询，然后再将值以模板语法传给页面。

```js

  const sql = `SELECT * FROM project_cate WHERE is_delete = 1;`
  db.query(sql, (err, result) => {
    if (err) throw err.message
    res.render("admin/project_add", { category: result })
  })

```
> 向前台传送category

前台可以使用<%=category%>拿到数组，并进行遍历，将选项显示在下拉框中。

```html
<div class="layui-input-block">
  <select name="city" lay-verify="">
    <option value="">请选择项目分类</option>
    <% category.forEach((item)=>{%>
      <option value="<%=item.pc_id%>"> <%=item.pc_name%></option>
    <%}) %>   
  </select>      
</div>
```
数组原数据
```json
[
  { pc_id: 2, pc_name: '生活', is_delete: 1 },
  { pc_id: 4, pc_name: '知识', is_delete: 1 },
  { pc_id: 12, pc_name: '化学', is_delete: 1 },
  { pc_id: 14, pc_name: '体育', is_delete: 1 },
  { pc_id: 31, pc_name: '化妆品', is_delete: 1 },
  { pc_id: 35, pc_name: '健康', is_delete: 1 }
]
```

> 数组.forEach((item)=>{
>   item.属性名
> })

```json
2
生活
4
知识
12
化学
14
体育
31
化妆品
35
健康
```

> 这里是对pc_id，和pc_name进行了提取，这样就完成前台页面的渲染


1. 上传多张图片，组图

连续上传四张图片，但是其实是一张一张的上传的，每传一次，返回一个code和url，我们需要把这些url动态渲染到页面上。
> 节点知识：
> dom文档都是一颗文档书，html(head,body,div):父子关系
> 分类：元素节点，属性节点，文本节点，注释节点，文档节点
> 属性：`对象.parentNode`;`对象.children`;`对象.previousElementSibling`,`对象.nextElementSibling`
> 方法：创建元素节点：document.createElement("标签名")
>       把创建好的节点插入到父节点中：父节点.appendChild(子节点)
>       移除子节点: 父节点.removeChild(子节点)
> 操作节点：
- 代码

这是原生js的操作方法
```js
四张图片进行渲染
创建元素节点
var elem = document.createElement("img")
elem.style.width = "200px"
elem.src = res.url
// elem.setAttribute("src", res.url)  这个是设置属性的class
 imglist.appendChild(elem)

          
```
这是jquery的操作方法
```js
$("<img width='200'>").attr("src", res.url).appendTo($(".imglist"))
```

4. 将图片的路径进行拼接，保存到数据中，并将其转换成字符串，传给后台。

```js
done: (res) => {
        if (res.code == 1) {
          //jquery的方法
          $("<img width='200'>").attr("src", res.url).appendTo($(".imglist"))
          pthumbList.push(res.url)
          $("[name=project_banner]").val(pthumbList.join(","))
        }
      }
```

#### 2022/7/6
> 富文本编辑器的使用
> 数据库多表联合查询
##### 使用技术点
`tinymce应用`,`layedit`
Layui里的数据表格事件

- Layui里的数据表格事件

```js
<!-- 工具栏模板 -->
<script type="text/html" id="titleTpl3">
  <div class="layui-btn-container">
    <button class="layui-btn layui-btn-sm" lay-event="add">添加</button>
    <button class="layui-btn layui-btn-sm" lay-event="delete">删除</button>
    <button class="layui-btn layui-btn-sm" lay-event="update">编辑</button>
  </div>
</script>


// 先在表单中绑定，test
<table class="layui-table projectTable" lay-filter="test"></table>
// 然后使用table.on事件绑定方法

table.on('tool(test)', function (obj) {
      switch (obj.event) {
        case 'add':
          layer.msg('添加');
          break;
        case 'delete':
          layer.msg('删除');
          break;
        case 'update':
          layer.msg('编辑');
          break;
      };
    });

//同时注意也要把模板加上
{ field: '', title: '操作', templet: "#titleTpl3" }

```

> ###注意
> 表单行事件可以获取到该行的数据；数据都在obj.data中
> ```
> {project_id: 13, project_title: '知识分类', project_thumb: '/upload/file-1657070771467.png', is_delete: 1, pc_name: '知识'}
> ```

##### 链接查询

![Snipaste_2022-07-06_11-02-39](https://super-ly-image.oss-cn-hangzhou.aliyuncs.com/Snipaste_2022-07-06_11-02-39.png)

![Snipaste_2022-07-06_11-03-40](https://super-ly-image.oss-cn-hangzhou.aliyuncs.com/Snipaste_2022-07-06_11-03-40.png)


#### 2022/7/7
> 图片上传限制
> layui中upload模块自带上传限制功能
> 完成修改项目功能,同样也得分情况去讨论

##### 相关技术点
###### 前台验证
```js
upload.render({
        elem: "#thumb",
        url: "/admin/banner/upload",
        accept: "images",
        acceptMime: "image/*",
        size: 3000,
        done: (res) => {
          if (res.code == 1) {
            //将路径传给预览图区域
            imgs.src = res.url
            //将路径给隐藏域中的表单，待会方便实现数据的提交
            gthumb.value = res.url

          } else {
            layer.msg("图片上传失败"+res.msg)
          }
        },
      })
```
> `size`限制上传大小(单位kb)，acceptMime

###### 后台校验

> 使用multer

[multer文档](https://github.com/expressjs/multer/blob/master/doc/README-zh-cn.md)

1. 先定义后台校验规则

```js
//文件限制
const limits = {
  fields: 10, //非文件字段数量
  fieldSize: 3000 * 1024,//文件的大小，（3000kb*1024）字节 b
  files: 1//文件上传
}

```
> 注意单位是字节，而前台校验的单位是kb，所以需要X1024

2. 在项目入口中配置错误中间件

```js
//文件上传校验
if (err instanceof MulterError) {
  return res.send({
    code: 0,
    msg: err.message
  })
}

```

```js
app.use(function (err, req, res, next) {
  //insttanceof 对象是否由构造函数实例化的,表单校验错误
  if (err instanceof Joi.ValidationError) {
    return res.send({
      code: 0,
      msg: err.message
    })
  }

  //文件上传校验
  if (err instanceof MulterError) {
    return res.send({
      code: 0,
      msg: err.message
    })
  }

  res.send({
    code: 0,
    msg: err.message
  })

})
```

#### 2022/7/8
> 登陆的身份验证

##### sessio 与 cookie:
基于HTTP协议，HTTP是一种无状态的协议

1. 为什么有session与cookie
web 1.0：资源共享，
web 2.0: 交互，多部操作，依赖数据
session与cookie：来实现状态的记录，解决Http无状态的缺陷。
> cookie是服务器生成的，返回给浏览器的，登陆时客户端将cookie携带到请求头中返回给服务器。

2. session和cookie的区别和特点：
- session与cookie都是由服务器生产的
- session存储在服务器端，而cookie存储在客户端或者浏览器端
- 客户端发送请求时会自动携带,本域名下,未过期的cookie
- 都具有生命周期
3. 如何配置
和multer类似，配置好multer,才能在req,file，同样，配置好express-session,才能req.session

4. 使用express-session进行开发

> 登陆页
> /login 渲染登陆页面
> /api/login 以post方式去访问，提交数据(用户名和密码)
> 通过验证，返回登陆成功，存储session(用户名和密码)

> 前台：失败：返回登陆页
> 成功：跳转到首页

> 首页：渲染首页(验证是否登陆成功)
> /api/username  get  返回当前是否登陆成功  (session取数据)
>                     失败：提示信息
>                     成功：提示信息，返回用户名
> 前台：失败：跳转到登陆页面
>       成功：提示用户信息，展示用户名
> /api/logout      退出登录：摧毁session,返回信息。
> 前台：退出成功：跳转到登陆页面  


##### 项目应用
1. 首先引入`express-session`
2. 在项目入口配置session

```js
const session = require("express-session")
//配置session
app.use(session({
  name: "CMS",
  cookie: {
    maxAge: 1000 * 60 * 30
  },
  secret: "keyboard cat",
  resave: false,              //以最后一次操作开始计时，重新设置session后，才会重新设置cookie，否则不会重新设置
  saveUninitialized: true     //刷新页面就会产生cookie
}))
```

3. 在判断登陆成功后，创建session，并添加属性`userInfo`
```js
req.session.userInfo = req.body
```
> 输出session

```bash
Session {
  cookie: {
    path: '/',
    _expires: 2022-07-08T09:23:10.970Z,
    originalMaxAge: 1800000,
    httpOnly: true
  },
  userInfo: [Object: null prototype] { username: 'xxxxx', password: 'xxxxxxx' }
}
```
4. 在服务器渲染其他页面前，先进行判断，我们要定义一个中间件来做这个事情。

> 在一级路由中对二级路由进行配置，让浏览器渲染页面时都先判断是否有session,如果有就继续向下执行（去走二级路由），否则就重定向到登录页。同时因为该级路由下有登陆路由，为了防止在登录页时，不停重定向，出现`重定向次数过多的错误`,我们再进行判断，如果路径里包含`login`,那么就终止执行（retrun后的代码不会执行）。

```js
//在访问所有页面之前进行登陆验证
router.use((req, res, next) => {
  if (req.url.includes("login")) {
    next()
    return
  }
  if (req.session.userInfo) {
    //重新设置session
    req.session.date = Date.now()
    next()
  } else {
    res.redirect("/admin/login")
  }
})
```
> 注意，在判断有登陆信息后，需要再重新设置session才能使得`resave: false`生效。所以这里使用`req.session.date = Date.now()`重新设置了一次session。
5. 将登陆信息传给管理端主页
渲染页面时，就把session中的值，传给页面，再用模板语法进行渲染(这里使用的是ejs模板引擎)
```js
router.get("/", (req, res) => {
  //渲染登陆页面
  res.render("admin/index", { username: req.session.userInfo.username })
})
```
在页面需要登陆信息的地方使用`<%=username%>`的方式进行渲染


6. 退出登录后，需要销毁session
使用session自带的`session.destroy()`,或者将`session置空`
```js
router.get("/logout", (req, res) => {
  req.session.destroy()
  res.redirect("/admin/login/a")
})
```

#### 2022/7/11
> 项目的日期添加

1. 在数据库中添加字段`ctime`,类型为`datetime`
2. 在创建项目时，自动创建data对象

```js
 const times = new Date()
```
将日期保存到数据库中。
在展示的时候对日期格式进行渲染，使用`toLocaleString()`.

```js
      results.forEach((item) => {
        // console.log(item.ctime);
        item.ctime = item.ctime.toLocaleString();
      })
```

#### 2022/7/12
> 对整个项目进行整理，完善功能，管理端基本完成。
> Echar数据可视化
> [Echarts](https://echarts.apache.org/examples/zh/editor.html?c=pie-simple)

##### Echarts规划

![Snipaste_2022-07-12_14-46-57](https://super-ly-image.oss-cn-hangzhou.aliyuncs.com/Snipaste_2022-07-12_14-46-57.png)

> ###### 路由
>
> /admin/echarts/   展示数据
>
> /admin/echarts/bar   获取数据   

同步和异步怎么解决？

使用setTime计时器函数，将同步转成异步。

#### 2022/7/13
> 开始搭建前台页面
> 数据使用ejs模板渲染

#### 2022/7/14
> 开始搭建project页面
> 给首页导航栏中的导航添加不同的跳转路径。
> 根据点击不同的分类，跳转到/project后，页面显示不同的查询结果，可以在a标签的链接通过

##### 相关技术点
1. 给导航栏中的导航添加不同的跳转路径

```html
 <a href="<%= item.nav_url%>?id = 0"><%=item.nav_name%>
 <span class="glyphicon glyphicon-menu-down"></span>
```
> 这里又在数据库导航表添加了一个字段`nav_url`，并在index.js路由文件里配置了各个页面相对应的路由，从而实现了页面跳转。

> 由于导航，以及轮播图每个页面都要用，所以不适合在`/`路由中进行请求，并渲染到index页面上了，这里我们可以写一个中间件，让每次的页面跳转都去执行中间件，并在中间件中将导航，轮播图的数据进行请求，并返回给下面的路由。

```js
//中间件
router.use((req, res, next) => {
  //导航
  const sqlNav = "select * from nav where nav_is_show = 1 order by nav_sort asc"
  db.query(sqlNav, (err, results) => {
    if (err) return res.send({ code: 0, msg: err.message })
    if (results.length != 0) {
      nav = results
      // console.log(results);
    }
  })
  // 轮播图
  const sqlBan = 'SELECT banner_name ,banner_img from  banner order by banner_id asc'
  db.query(sqlBan, (err, results) => {
    if (err) return res.send({ code: 0, msg: err.message })
    if (results.length != 0) {
      banner = results
      // console.log(results);
    }
  })

  setTimeout(() => {
    res.state = nav       //将值传给后面的路由!!
    res.state = banner
  }, 500)
  next()
})
```
> 因为同步异步的关系（执行顺序不同），这里也是将同步转换成异步。
> 接下来渲染页面的时候就不用给参数了

```js
router.get("/", (req, res) => {
  let nav, banner, procat, project


  // 项目分类
  const sqlProat = 'SELECT project_cate.pc_name,pc_id FROM project_cate ORDER BY project_cate.pc_id DESC LIMIT 0,3'
  db.query(sqlProat, (err, results) => {
    if (err) return res.send({ code: 0, msg: err.message })
    if (results.length != 0) {
      procat = results
      // console.log(results);
    }
  })

  //项目案例
  const sqlProjet = 'SELECT project.project_title, project.project_thumb, project.pc_id FROM project WHERE is_delete = 1 ORDER BY project_id ASC LIMIT 0 ,12'
  db.query(sqlProjet, (err, results) => {
    if (err) return res.send({ code: 0, msg: err.message })
    if (results.length != 0) {
      project = results
      // console.log(results);
    }
  })
  setTimeout(function () {
    res.render("index/index", { procat, project })  //这里就不用把nav和banner的值给页面了，因为已经给了。
  }, 500)

})
```




> 像`联系我们`,`关于我们`等路由由于样式不一样，且页面内容单一，可以直接在`header`部分写死


2. 根据不同分类，跳转`/project`页面，这里可以传一个`id`,在a标签的跳转链接上就给`id赋值`让id的值就等于project里的pc_id的值，传到后台路由后，就可以在project表中进行查询，并返回相应结果，并渲染到页面上。


3. 项目点击：跳转项目详细页，上一篇，下一篇。

```js
res.render("index/project", { project, totalPage, pc_id, page })
```
页面后台已经拿到了page值,并传给页面，所以只需要操作前一页，后一页的值，同样也是给`/project`传值，只不过需要注意边界值。

当已经是第一页时，就需要用三元运算符判断，如果`page-1`<=0那么`pege=0`,反正`page = page-1`,下一页的思路一样。
上一页按钮
```html
<span>
  <button class="bottomup"> 
  <a href="/project?id=<%=pc_id%>&limit=2&page<%=(page*1-1)<=0?1:(page*1-1)%>">上一页</a>                      
  </button>              
</span>
```
下一页按钮

```html
<span>
  <button class="bottomdown">
    <a href="/project?id=<%=pc_id%>&limit=2&page=<%=(page*1+1)>totalPage?totalPage:(page*1+1)%>">下一页</a>
  </button>
</span>                                                     
```

> 这里用了`page*1`是隐式转换，否则程序会判断成字符相连。

内置顶层函数
String() 把任意数据类型转换成字符串
Number() 把任意数据类型转换成数值型 "abc" NAN
Boolean() 把任意数据类型转换成Boolean型， 假: undefined, null,NaN,false,0,'',
parseInt() 把字符类型转换成整型
parseFloat() 把字符串转换成浮点型

#### 2022/7/15
> 实现项目详情的实现。
> 页面中你页面量（浏览量如何添加）
> 下拉导航的渲染

##### 使用的技术点
1. 项目轮播图，带缩略图

使用swiper的模板，进行修改。

2. 实现分页

在页面每次渲染时，都会将该条数据对应的id传给后台，后台再根据穿过来的数据进行处理。但项目详细的id并不是连续的，所以我们需要合理使用SQL语句对`下一条/上一条`数据进行查询。
```js
//上一篇的内容
  const sqlPrev = `SELECT * FROM project WHERE  project.is_delete=1 AND project_id < ${req.query.id} ORDER BY project_id DESC LIMIT 0,1`
  console.log(sqlPrev);
  db.query(sqlPrev, (err, results) => {
    if (err) return res.send({ code: 0, msg: err.msg })
    prev = results.length == 0 ? "没有了" : results[0]
  })

  //下一篇
  const sqlNext = `SELECT * FROM project WHERE  project.is_delete=1 AND project_id > ${req.query.id} ORDER BY project_id ASC LIMIT 0,1`
  db.query(sqlNext, (err, results) => {
    if (err) return res.send({ code: 0, msg: err.msg })
    next = results.length == 0 ? "没有了" : results[0]
  })
```
> 这边注意一下SQL语句，同时也有边界值的判断。要注意当该页为第一条时，`前一页`的按钮应该为`没有了`,所以这里用了三元运算符做了处理，当返回的results为空时(results.length == 0)，就给对应的赋值给`没有了`,否则就赋值为查询到的对象数据。并传给前台。

```html
<button type="button" class="btn btn-default leftBtn">
            <% if(prev=="没有了" ){ %>
              上一篇:<%=prev%>
                <%}else{%>
                  <a href="/detail?id=<%=prev.project_id%>">
                    <%=prev.project_title%>
                  </a>
                  <%}%>
          </button>
          <button type="button" class="btn btn-default rightBtn">
            <% if(next=="没有了" ){%>
              上一篇:<%=prev%>
                <%}else{%>
                  <a href="/detail?id=<%=next.project_id%>">
                    <%=next.project_title%>
                  </a>
                  <%}%>
          </button>
```
> 这里是前一个和后一个按钮，遵守模板引擎的语法，并使用判断渲染出对应的内容。



3. 实现浏览量的增加

```js
//浏览量添加
      const sqlnum = `UPDATE project SET num = ${result[0].num + 1} WHERE project_id =  ${req.query.id}`
      console.log(sqlnum);
      db.query(sqlnum, (err, results) => {
        if (err) return res.send({ code: 0, msg: err.msg })
        if (results.affectedRows == 1) {

        } else {

        }
      })
```
> 将该代码写入页面渲染的路由中，每次页面渲染成功，就会调用一次该代码，对数据库进行操作。

4. 下拉导航的渲染
下拉导航就用到了基本的html+css+js
```js
var xm = document.querySelectorAll(".xm")
var menu = document.querySelectorAll(".menu")
console.log(xm, menu);
for (let i = 0; i < xm.length; i++) {
  xm[i].onmouseenter = function () {
    menu[i].style.display = "block"
  }
  xm[i].onmouseleave = function () {
    menu[i].style.display = "none"
  }
}
```
给每个一列表添加鼠标移入，移除事件。难的是数据的渲染。
> 1. 前端处理数据

在首页可以拿到导航的nav_id,根据数据库中，不同nav对应的分类去选择渲染数据，在前端是这样做的。

```html
<% nav.forEach(item=>{%>
  <li class="xm">
    <a href="<%= item.nav_url%>?id = 0">
      <%=item.nav_name%><span class="glyphicon glyphicon-menu-down"></span>
    </a>
    <div class="menu">
      <% if(item.nav_id==31){%>
        <%pcate.forEach(elem=>{%>
          <div><a href="/project?id=<%=elem.pc_id%>">
              <%=elem.pc_name%>
            </a></div>
          <%}) %>
            <%}else if(item.nav_id==32){%>
              <%scate.forEach(elem=>{%>
                <div><a href="/news?id=<%=elem.nc_id%>">
                    <%=elem.nc_name%>
                  </a></div>
                <%}) %>
                  <%}else if(item.nav_id==33){%>
                    <%tmber.forEach(elem=>{%>
                      <div><a href="/about?id=<%=elem.id%>">
                          <%=elem.team_name%>
                        </a></div>
                      <%}) %>
                        <%}%>
    </div>
  </li>
  <%})%>
```
> 外层的循环是循环列表的，里面是判断并循环所属的数据的，各个数据是如何区分的呢？使用`item.nav_id`进行区分。

> 2. 后端处理数据
在查到导航栏的`nav_id`时，根据不同的`nav_id`给挂载子元素

前端在渲染的时候，就给挂载上子元素，前台在进行遍历。

```js
  const sqlNav = "select * from nav where nav_is_show = 1 order by nav_sort asc"
  db.query(sqlNav, (err, results) => {
    if (err) return res.send({ code: 0, msg: err.message })
    if (results.length != 0) {
      results.forEach(item=>{
        if(item.nav_id == 31){
          item.chirldren = pcate
        }else if(item.nav_id == 32){
          item.chirldren = scate
        }
      })
      nav = results
    }
  })
```


#### 2022/7/16
> 写团队模块，又发现页面渲染不了，老提示传给页面的值是undefine，结果一看是异步和同步的问题，将渲染页面的代码放到异步代码块中解决。


#### 2022/7/17
根据需求对项目进行修改，
1. 先修改了数据可视化，原来标题太长，后台将标题的角度倾斜45度显示。
2. 对部分页面的布局作了一些小幅度修改。

```js
axisLabel: {
          interval: 0,
          rotate: 45,
          textStyle: {
            color: "#a9a9a9", //更改坐标轴文字颜色
            fontSize: 8 //更改坐标轴文字大小
          },

        }
```
3. 完善新闻部分数据太长导致的显示不正确。
```css
  display: block; /* 当前元素本身是inline的，因此需要设置成block模式 */
  white-space: nowrap; /* 因为设置了block，所以需要设置nowrap来确保不换行 */
  overflow: hidden; /* 超出隐藏结合width使用截取采用效果*/
  text-overflow: ellipsis; /* 本功能的主要功臣，超出部分的剪裁方式 */
```

### 目前发现的BUG



1. 添加时nav时，重复的值也可以输入，经过排查发现是数据库的问题，目前没有好的解决办法。(可能是字段钱加空格导致)


### 修复的BUG
1. cart检测输入数据功能。
2. banner输入检测正常。
3. banner图片修改时，如果只修改图片名，而不动图片的话，直接提交会报错。
4. 在修改组图时，原来图片的问题：解决方法: 给模板传过来的图片设置专属的`oldclass`类，在执行上传操作时，对图片进行隐藏。

```js
$(".oldclass").css("display", "none")
```

