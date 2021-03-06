v.js
====

v.js是一个原生js验证表单的js库，内部实现dom操作、事件绑定、ajax。

无第三方依赖，可以集成到任何项目。

验证机制支持单个验证，ajax验证，表单提交之前回调和表单提交成功之后回调。

支持单个文本域规则验证和函数验证。

内部实现了23种常用的验证规则，基本上可以满足网站正常业务需求。

如果自己添加新的验证规则可以使用.config()添加就可以了。


兼容所有浏览器。

## 更新记录

### V1.0.1

    [!] 第1.0.1个版本 增加单个文本域ajax验证回调和支持表达式验证

### V1.0

    [!] 第一个版本

## 使用文档

```javascript

库里面内置的规则说明:

// required 必填规则
// username 用户名验证规则
// password 密码验证规则
// number   数字验证规则
// date     时间验证规则
// money    金额验证规则
// per      百分比验证规则
// email    邮箱验证规则
// phone    座机电话验证规则
// mobile   手机验证规则
// url      网址验证规则
// ip       ip地址验证规则
// postal   邮编验证规则
// qq       qq验证规则
// english  英文字母验证规则
// chinese  中文字符验证规则
// ce       中英文验证规则
// select   下拉选择验证规则
// integer  整数验证规则
// uint     无符号整数
// idcard   身份证验证规则
// empty    留空验证规则
// anything 匹配\n在内的任意字符

v({});//运行验证实例

v({
    form:'v-form',// 表单id 必须
    beforeSubmit:function(){},// 表单提交之前的回调 不是必须
    afterSubmit:function(){},// 表单提交之后的回调 不是必须
    ajaxSubmit:true// 是否ajax提交 如果没有这个参数那么就是默认提交方式 如果没有特殊情况建议默认提交方式
});

.add({});// 添加需要验证的文本域 支持链式调用
.add([{},{},{}]);// 把验证规则一起添加

.add({
    target:"文本域id",
    // 如 ip||empty 表示验证ip是否正确和不能为空 uint&&(value>0)&&(value<=120) 表达式验证 value代表文本域的值
    ruleType:"指定验证规则和表达式验证 ip||empty或者ip&&empty",
    rule:/\w+?/,// 自己指定规则就不会使用默认的提示消息
    fnRule:"函数验证",// 自定义函数验证 用来处理一些正则做不到的事情 可以替代正则
    afterBlur:"函数验证",// 失去焦点之后库验证之后的 自定义函数验证
    beforeBlur:"函数验证",// 失去焦点之后库验证之前 自定义函数验证
    beforeFocus:"函数验证",//获取焦点自定义函数验证
    tips:'提示消息',
    focusTips:true,// 关闭聚焦提示
    empty:true,// 进行非空验证
    error:'错误提示消息',
    noTips:true,//不提示任何消息
    confirms:'password',// 针对密码验证 因为有时候需要确认密码是否两次都正确
    action:'upload.php',// 对当前单个文本域进行ajax验证 如密码 用户名等
    success:function(opts,data){// 2个参数 opts data服务端传回来的数据 返回flase代表验证失败
        //warnTips代表警告 errorTips代表错误
        if(data.a){
            return true;
        }else{
            this.errorTips(opts);
        }
    },
    warning:'警告提示消息'// 如用户名已被注册 邮箱已被注册等 
});

.reset();// 重置表单

.remove('指定需要移除的文本域');// 移除验证

.config({});// 外部添加新的验证组

.trigger();// 主动验证，进入表单页面主动执行的验证

// 添加新的验证规则
.config({
    'newRules':{
        rules:/^(?:[1-9][0-9]?|100)(?:\.[0-9]{1,2})?$/,
        tips:'请输入百分比!',
        error:'您填写的百分比格式不正确，正确的格式如：“80%”'
    }
});

```