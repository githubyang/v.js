/*
 * 表单验证 验证规则部分收集于互联网 在此表示感谢
 * @author 单骑闯天下
 * @version 0.0.1
 * @date 2014.11.7
*/
var v=({
	win:null,
	doc:null,
	utilsPointer:null,
	handlers:[],
	beTrigger:!1,
	options:[],//存放验证项的所有参数
	items:[],//存放验证项的ID
	ajaxCount:0,
	form:null,
	init:function(win,doc){
		var that=this,
				utils;
		that.win=win;
		that.doc=doc;
		that.utilsPointer=utils=that.utils(that);
		return function(opts){
			if(typeof opts==='undefined'){
				return this;
			}
			var form=utils.$(opts.form);
			if(!form){return;}
			that.form=form;
			that.items=[];//存放验证项的ID
			that.options=[];//存放验证项的所有参数
			that.ajaxCount=0;
			utils.addEvent(form,'submit',function(e){
				var len=that.items.length,
						i=0,
						hasError=!1,
						flag;
				utils.preventDefault(e);//取消默认提交
				utils.validateAll.call(that,that.options,false);//验证所有项 提交表单将不进行ajax验证

				if(that.ajaxCount > 0){//如果有ajax验证，那么必须等到全部都有返回结果
					alert('由于您的网速问题，请等待异步验证返回结果！');
				}
				//判断是否有没有通过的项
				for(;i<len;i++){
					if(utils.hasClass(utils.$(that.items[i]),that.classObj['inputError'])){
						hasError=true;
						break;
					}
				}
				//执行提交前的函数，如果有的话
				if(opts.beforeSubmit && utils.isFunction(opts.beforeSubmit)) flag = opts.beforeSubmit();
				//如果有没有通过验证的项
				if(flag === false || hasError){return false;}
				//否则，选择是以ajax的形式提交，还是默认形式提交
				opts.ajaxSubmit ? utils.ajaxForm(form,opts.afterSubmit) : form.submit();
			});
			return that.method.call(that,form);
		};
	},
	method:function(elem){// 外部调用的api
		var doc=this.doc,
				that=this,
				utils=that.utilsPointer;
		return {
			add:function(opts){
				if(!opts){return this};
				var i=0,
						arr=Array.prototype.slice.call(arguments),
						options=that.options,
						len=arr.length;
				for(i=0;i<len;i++){
					that.items.push(arr[i].target);
					that.options.push(arr[i]);
					utils.bindHandlers.call(this,arr[i]);
				}
				return this;
			},
			//移除验证项
			remove:function(el){
				var i=0,
					n,
					len=that.options.length,
					element,
					handler,
					tip,
					opt;
				for(;i<len;i++){
					if(el === that.options[i].target){
						n=i;
						break;
					};
				};
				if(n==undefined){return this;}
				that.items.splice(n,1);
				opt=that.options.splice(n,1);
				handler=that.handlers.splice(n,1)[0];
				element=utils.$(el);

				//如果删除的是一个带ajax验证的
				if(opt.action){that.ajaxCount--;}
				//获取需要项的提示信息
				tip=utils.$$(that.classObj['tip'],element.parentNode,'div')[0];
				//移除所有class
				utils.removeClass(element,that.classObj['inputError']+' '+that.classObj['inputPass']);
				//移除提示信息，如果存在的话
				tip && tip.parentNode.removeChild(tip);
				//移除绑定的事件处理函数
				utils.removeEvent(element,'focus',handler['focusFn']);
				utils.removeEvent(element,'blur',handler['blurFn']);
				utils.removeEvent(element,'change',handler['changeFn']);
				utils.removeEvent(element,'keyup',handler['keyupFn']);
				return this;
			},
			//重置
			reset:function(){
				var i=0,
						len=that.items.length,
						item;
				//移除所有项的class
				for(;i<len;i++){
					item=utils.$((that.items)[i]);
					utils.removeClass(item,that.classObj['inputError']+' '+that.classObj['inputPass']);
					item.value='';
				};
				//移除所有提示信息
				utils.hideAllTip(that.form);
				//重置ajax计数器
				that.ajaxCount=0;
				return this;
			},
			//主动触发验证
			trigger:function(el,callback){
				var i=0,
						n,
						len=that.options.length,
						handler;
				for(;i<len;i++){
					if(el===that.options[i].target){
						n=i;
						break;
					}
				}
				if(n==undefined){return this;}
				that.beTrigger=true;
				utils.blurHandler(that.options[n])();
				that.beTrigger=false;
				callback && callback.call(this);
				return this;
			},
			config:function(options){
				var obj=that.config,
						i;
				if(typeof options==='object'){
					for(i in options){
						obj[i]=options[i];
					}
				}
				return this;
			}
		};
	},
	utils:function(obj){// 内部的私有方法
		var that=obj,
				doc=that.doc,
				utils=that.utilsPointer,
				item=that.config;
		return {
			//----------------------------- 工具方法 -----------------------------
			$:function(elem){
				return (typeof elem==='string')?doc.getElementById(elem):elem;
			},
			trim:function(str){// 去除空格
				return str.replace(/^\s+|\s+$/,'').replace(/\s+/,' ');
			},
			escaping:function(val){//去掉换行符和首尾的空格，将/ \ ' "转义
				return val.replace(/^\s+|\s+$/g,'').replace(/(['"])/g,function(a,b){ return '\\'+b;}).replace(/[\r\n]/g,'')
			},
			isFunction:function(obj){
				return (typeof obj=='function'?true:false);
			},
			hasClass:function(elem,oClass){// 检测dom class的值是否包含指定的class选择器
				oClass=' '+oClass+ ' ';
				return (' '+elem.className+' ').indexOf(oClass) > -1 ? true:false;
			},
			check:function(reg,str){
				return reg.test(str);
			},
			extend:function(target,source){
				for(var i in source){
					target[i]=source[i];
				};
				return target;
			},
			confirms:function(opts){// 判断两个值是否相同，如重复密码
				var utils=that.utilsPointer,
						elem=utils.$(opts.target),
						theSame=utils.$(opts.confirms),
						hasPass;
				if(!theSame) return;
				hasPass=utils.hasClass(theSame,that.classObj['inputPass']);
				if(hasPass){
					//如果通过，再判断两个的值是否相同
					if(elem.value===theSame.value){
						//如果相同就显示通过提示信息
						utils.successTips(opts);
					}else{
						//否则显示错误提示信息
						utils.errorTips(opts);
					}
				}
			},
			$$:function(oClass,parent,nodename){
				var i=0,
					len=0,
					re=[],
					elem;
				nodename=nodename || '*';
				parent=parent || that.doc;
				elem=parent.getElementsByTagName(nodename);
				for(len=elem.length;i<len;i++){
					if(this.hasClass(elem[i],oClass)) re.push(elem[i]);
				};
				return re;
			},
			encodeNameAndValue:function(sName,sValue){
				return encodeURIComponent(sName)+'='+encodeURIComponent(sValue);
			},
			serializeForm:function(form){//序列化表单
				var dom=that.utilsPointer.$(form),
						elemList=dom.elements,
						len=elemList.length,
						i=0,
						temp,
						re=[];
				for(;i<len;i++){
					temp=elemList[i];
					switch(temp.type){
						case 'select-one' :
							case 'select-multipe':
								for(var j=0,l=temp.options.length;j<l;j++){
									var opt=temp.options[j];
									if(opt.selected){
										var v='';
										if(opt.hasAttribute){
											v=opt.hasAttribute('value') ? opt.value : opt.text;
										}else{
											v=opt.attributes['value'].specified ? opt.value : opt.text;
										}
										re.push(that.utilsPointer.encodeNameAndValue(temp.name,v));
									}
								}
							break;
							case undefined :
								case 'fieldset':
									case 'button':
										case 'submit':
											case 'reset':
												case 'file':
									 				break;
							case 'checkbox':
								case 'radio':
									if(!temp.checked){break;};
						default :re.push(that.utilsPointer.encodeNameAndValue(temp.name,temp.value));break;
					};
				};
				return re.join('&');
			},
			//----------------------------- 事件方法 ------------------------------
			addEvent:function(elem,type,fn){//添加事件
				if(typeof elem.addEventListener!='undefined'){
					elem.addEventListener(type,fn,false);
				}else if(typeof elem.attachEvent!='undefined'){
					elem.attachEvent('on'+type,fn);
				}else{
					elem['on'+type]=fn;
				};
			},
			removeEvent:function(elem,type,fn){//移除事件
				if(typeof elem.removeEventListener!='undefined'){
					elem.removeEventListener(type,fn,false);
				}else if(typeof elem.detachEvent!='undefined'){
					elem.detachEvent('on'+type,fn);
				}else{
					elem['on'+type]=null;
				};
			},
			fireEvent:function(elem,type){
				if(typeof document.createEventObject=='object'){
					return elem.fireEvent('on'+type);
				}else{
					var e=document.createEvent('HTMLEvents');
					e.initEvent(type,true,true);
					return !elem.dispatchEvent(e);
				};
			},
			preventDefault:function(e){// 取消浏览器默认行为
				e=e || window.event;
				if(e.preventDefault){
					e.preventDefault();
				}else{
					e.returnValue=false;
				};
			},
			//------------------------------ dom操作方法 ----------------------
			show:function(elem){
				elem && (elem.style.cssText = 'inline-block;*display:inline;*zoom:1;');
			},
			hide:function(elem){
				elem && (elem.style.display='none');
			},
			removeClass:function(elem,oClass){
				var C=this.trim(oClass).split(' '),
					eClass=elem.className,
					i=0,
					len=C.length;
				for(;i<len;i++){
					if(this.hasClass(elem,C[i])){
						eClass=eClass.replace(C[i],'');
					};
				};
				elem.className=this.trim(eClass);
			},
			addClass:function(elem,oClass){
				var C=this.trim(oClass).split(' '),
					eClass=elem.className,
					i=0,
					len=C.length;
				for(;i<len;i++){
					if(!this.hasClass(elem,C[i])){
						eClass+=' '+C[i];
					};
				};
				elem.className=this.trim(eClass);
			},
			//------------------------ 事件相关的绑定和回调方法 ------------------------
			bindHandlers:function(opts){//绑定验证事件
				var utils=that.utilsPointer,
						elem=utils.$(opts.target),
						theSame;
				if(opts.confirms){
					theSame=utils.$(opts.confirms);
				}
				focusFn=utils.focusHandler.call(this,opts);
				blurFn=utils.blurHandler.call(this,opts);
				changeFn=utils.changeHandler.call(this,opts);
				keyupFn=utils.keyupHandler.call(this,opts);

				utils.addEvent(elem,'focus',focusFn);
				utils.addEvent(elem,'blur',blurFn);
				utils.addEvent(elem,'keyup',keyupFn);
				if(theSame){
					utils.addEvent(theSame,'blur',function(){
						utils.fireEvent(elem,'blur');
					});
				}
				if(elem.type == 'select' || elem.type == 'file'){
					utils.addEvent(elem,'change',changeFn);
				}
				that.handlers.push({
					'target':opts.target,
					'focusFn':focusFn,
					'blurFn':blurFn,
					'changeFn':changeFn,
					'keyupFn':keyupFn
				});
			},
			focusHandler:function(opts){// 获得焦点函数
				var utils=that.utilsPointer;
				return function(){
					var elem=utils.$(opts.target),// 文本域dom
							val=elem.value,// 文本域字符串
							defaultval=elem.getAttribute('placeholder')||'';// 文本域默认字符串
					if(opts.beforeFocus && utils.isFunction(opts.beforeFocus)){
						opts.beforeFocus(opts);
					}
					if((utils.hasClass(elem,that.classObj['inputError']) || utils.hasClass(elem,that.classObj['inputPass'])) && !(val === '' || val === defaultval )) return;
					if(opts.focusTips){
						utils.resetItem(opts);
					}else{
						utils.tips(opts);
					}
				};
			},
			blurHandler:function(opts){// 失去焦点函数
				var _this=this,
						utils=that.utilsPointer;
				return function(){
					var elem=utils.$(opts.target),
							val=elem.value,
							defaultVal=elem.getAttribute('placeholder'),
							flag=true;
				  //如果主动验证，值为空或是默认值也需要验证
				  if((!that.beTrigger&&!opts.empty) && (val === '' || val === defaultVal)){
				    utils.resetItem(opts);
				    return;
				  }
				  if(opts.beforeBlur && utils.isFunction(opts.beforeBlur)){
				  	flag=opts.beforeBlur(opts);// 执行参数里面的函数验证 在验证规则之前执行
				  }
				  if(flag===false){
				    utils.errorTips(opts);
				    return;
				  }
				  utils.validateItem.call(_this,opts);
				  if(opts.afterBlur && utils.isFunction(opts.afterBlur)){
				  	opts.afterBlur.call(_this,opts);// 执行参数里面的函数验证 在验证规则之后执行
				  }
				};
			},
			changeHandler:function(opts){
				var utils=that.utilsPointer;
				return function(){
					utils.validate(opts) ?  utils.errorTips(opts) : successTips(opts);
					if(opts.afterChange && utils.isFunction(opts.afterChange)){opts.afterChange.call(utils.$(opts.target),opts);};
				};
			},
			keyupHandler:function(opts){
				var utils=that.utilsPointer;
				return function(){
					if(opts.onkeypress && utils.isFunction(opts.onkeypress)){
						opts.onkeypress.call(utils.$(opts.target),opts);
					}
				};
			},
			//--------------------- 提示消息方法 -------------------
			createTip:function(){//创建提示信息
				var div=document.createElement('div');
				div.className=that.classObj['tip'];
				return div;
			},
			tip:function(opts,type){
				var ruleType=opts.ruleType && (opts.ruleType.match(/\w+/g))[0],
						msg=opts[type] || (item[ruleType]&&item[ruleType][type]) ||'',
						elem=this.$(opts.target),
						tip=this.$$(that.classObj['tip'],
						elem.parentNode,'div')[0];
				if(!tip){
				  tip=this.createTip();
				  elem.parentNode.appendChild(tip);
				};
				tip.innerHTML='<span>'+msg+'</span>';
				this.show(tip);
				switch(type){
				  case 'tips':
				    this.removeClass(elem,that.classObj['inputError']+' '+that.classObj['inputPass']);
				    this.removeClass(tip,that.classObj['error']+' '+that.classObj['pass']);
				  break;
				  case 'error' :
				    this.removeClass(elem,that.classObj['inputPass']);
				    this.addClass(elem,that.classObj['inputError']);
				    this.removeClass(tip,that.classObj['pass']);
				    this.addClass(tip,that.classObj['error']);
				  break;
				  case 'pass':
				    this.removeClass(elem,that.classObj['inputError']);
				    this.addClass(elem,that.classObj['inputPass']);
				    this.removeClass(tip,that.classObj['error']);
				    this.addClass(tip,that.classObj['pass']);
				  break;
				  case 'warning':
				  	this.removeClass(elem,that.classObj['inputPass']);
				    this.addClass(elem,that.classObj['inputError']);
				    this.removeClass(tip,that.classObj['pass']);
				    this.addClass(tip,that.classObj['error']);
				  break;
				};
				if(opts.noTips) this.hide(tip);
			},
			tips:function(opts){//显示默认提示信息
				this.tip(opts,'tips');
			},
			errorTips:function(opts){//显示错误提示信息
				this.tip(opts,'error');
			},
			successTips:function(opts){//显示通过验证提示信息
				var elem=this.$(opts.target);
				this.tip(opts,'pass');
				if(elem.value===''){
				  this.resetItem(opts);
				};
			},
			warnTips:function(opts){//显示警告提示信息
				this.tip(opts,'warning');
			},
			//隐藏所有提示信息
			hideAllTip:function(form){
				var i=0,
					tips=this.$$(that.classObj['tip'],form,'div'),
					len=tips.length,
					item;
				for(;i<len;i++){
					item=tips[i];
					item.parentNode.removeChild(item);
				}
			},
			resetItem:function(opts){//重置单个
				var item=this.$(opts.target),
					tip=this.$$(that.classObj['tip'],
					item.parentNode,'div')[0];
				this.removeClass(item,that.classObj['inputError']+' '+that.classObj['inputPass']);
				item.value='';
				this.hide(tip);
			},
			//----------------------- 验证方法 ---------------------
			validate:function(opts){//验证
				var elem=this.$(opts.target),
						reg='',
						fnRule=opts.fnRule,
						utils=that.utilsPointer,
						defaultValue=elem.getAttribute('placeholder');
				if(elem.value===defaultValue){elem.value='';};
				if(opts.ruleType){
				  var type=opts.ruleType,
				    	rule_item=type.match(/(\w+)/g);
				  for(var i=0;i<rule_item.length;i++){
				    type=type.replace(rule_item[i],'utils.check('+ item[rule_item[i]].rules +',\''+utils.escaping(elem.value)+'\')');
				  };
				  reg=type;
				}else if(opts.rule){
				  reg='utils.check('+opts.rule+',\''+utils.escaping(elem.value)+'\');';
				}else{
				  return;
				};
				return !(fnRule ? ((new Function('utils,elem','return '+reg)(utils,elem)) && fnRule.call(elem,opts) !== false) : (new Function('utils,elem','return '+reg)(utils,elem)));
			},
			validateAll:function(options,bool){//表单提交时验证所有
				var utils=that.utilsPointer;
				for(var i=0,o;o=options[i++];){
				  utils.validateItem.call(this,o,bool);
				}
			},
			validateItem:function(opts,bool){//验证单个
				var utils=that.utilsPointer,
						el=utils.$(opts.target),
						_this=that,
						bool=bool||true,
						hasError=utils.validate(opts);
				if(hasError){
					utils.errorTips(opts);
				}else{//如果需要ajax验证
				  if(opts.action&&bool){
				    _this.ajaxCount+=1;
				    utils.ajaxValidate(opts,function(pass){
				      _this.ajaxCount-=1;
				      if(!pass){
				        utils.warnTips(opts);
				      }else{
				        utils.successTips(opts);
				        if(opts.confirms){
				          utils.confirms(opts);
				        }
				      }
				    });
				  }else{
				    utils.successTips(opts);//验证成功提示
				    if(opts.confirms){//针对需要确认验证的文本域 如密码两次是否相等
				      utils.confirms(opts);
				    }
				  }
				}
			},
			ajaxValidate:function(opts,callback){//ajax验证
				var el=that.utilsPointer.$(opts.target),
						val=el.value,
						name=el.name || el.id;
				that.utilsPointer.ajax({
					type:"GET",
					url:opts.action,
					noCache:true,
					data:name +'='+ encodeURIComponent(val),
					onsuccess:function(){
						var data=eval('('+this.responseText+')');
						callback(data);
					}
				});
			},
			// ----------------------- ajax部分 -------------------
			createXhr:function(){
				if(typeof XMLHttpRequest != 'undefined'){
					return new XMLHttpRequest();
				}else{
					var xhr=null;
					try{
						xhr=new ActiveXObject('MSXML2.XmlHttp.6.0');
						return xhr;
					}catch(e){
						try{
							xhr=new ActiveXObject('MSXML2.XmlHttp.3.0');
							return xhr;
						}catch(e){
							throw Error('cannot create XMLHttp object!');
						};
					}
				}
			},
			ajax:function(opts){
				var set=that.utilsPointer.extend({
						url:'',
						data:'',
						type:'POST',
						timeout:5000,
						onbeforerequest:function(){},
						onsuccess:function(){},
						onnotmodified:function(){},
						onfailure:function(){}
					},opts||{});
				var xhr=that.utilsPointer.createXhr();
				if((set.type).toUpperCase()=='GET'){
					if(set.data){
						set.url+=(set.url.indexOf('?')>=0 ? '&' : '?')+set.data;
						set.data=null;
					};
					if(set.noCache){
						set.url+=(set.url.indexOf('?')>=0 ? '&' : '?')+'t='+(+new Date());
					}
				}
				xhr.onreadystatechange=function(){
					if(xhr.readyState==4){
						if(xhr.status>= 200 && xhr.status < 300){
							set.onsuccess.call(xhr,xhr.responseText);
						}else if(xhr.status == 304){
							set.onnotmodified.call(xhr,xhr.responseText);
						}else{
							set.onfailure.call(xhr,xhr.responseText);
						}
					}
				}
				xhr.open(set.type,set.url);
				if((set.type).toUpperCase() == 'POST'){
					xhr.setRequestHeader('content-Type','application/x-www-form-urlencoded');
					xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
				}
				set.onbeforerequest();
				if(set.timeout){
					setTimeout(function(){
						xhr.onreadystatechange=function(){};
						xhr.abort();
						set.onfailure();
					},set.timeout);
				}
				xhr.send(set.data);
			},
			ajaxForm:function(form,onsuccess){//以ajax的形式提交表单
				that.utilsPointer.ajax({
					type:form.method,
					url:form.action,
					data:that.utilsPointer.serializeForm(form),
					onsuccess:onsuccess
				});
			}
		};
	},
	classObj:{
		'tip':'tip',//提示信息的class
		'pass':'tip-pass',//验证通过时的提示信息的class
		'error':'tip-error',//验证没有通过时的提示信息的class
		'inputPass':'item-pass',//验证通过时的表单元素的class
		'inputError':'item-error'//验证没有通过时的表单元素的class
	},
	config:{// 验证配置文件可以通过外部接口修改
		'required':{
			'rules':/.+/,
			'tips':'该信息为必填项，请填写！',
			'error':'对不起，必填信息不能为空，请填写！'
		},
		'username':{
			'rules':/^[\u4E00-\u9FA5A-Za-z0-9_\ ]{5,20}$/i,
			'tips':"5~20个字符，由中文、英文字母和下划线组成。",
			'error':"对不起，用户名格式不正确。",
			'warning':"对不起，该用户名已经被注册。"
		},
		'password':{
			'rules':/^[a-zA-Z0-9\_\-\~\!\%\*\@\#\$\&\.\(\)\[\]\{\}\<\>\?\\\/\'\"]{3,20}$/,
			'tips':"3~20个字符，由英文字母，数字和特殊符号组成。",
			'error':"对不起，您填写的密码有误。"
		},
		'number':{
			'rules':/^[-+]?(0|[1-9]\d*)(\.\d+)?$/,
			'tips':'请输入数字！',
			'error':'对不起，您填写的不是数字。'
		},
		'date':{
			'rules':/^\d{4}(\-|\.)\d{2}(\-|\.)\d{2}$/,
			'tips':'请填写日期！格式为：2014-01-01或者2014.01.01',
			'error':'对不起，您填写的日期格式不正确.'
		},
		'money':{
			'rules':/^[-+]?(0|[1-9]\d*)(\.\d+)?$/,
			'tips':'请输入金额！',
			'error':'金额格式不正确。正确格式如：“60” 或 “60.5”。'
		},
		'per':{
			'rules':/^(?:[1-9][0-9]?|100)(?:\.[0-9]{1,2})?$/,
			'tips':'请输入百分比！',
			'error':'对不起，您填写的百分比格式不正确！'
		},
		'email':{
			'rules':/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
			'tips':'请输入您常用的E-mail邮箱号，以便我们联系您，为您提供更好的服务！',
			'error':'对不起，您填写的E-mail格式不正确！正确的格式：yourname@gmail.com。',
			'warning':'对不起，该E-mail帐号已经被注册。请更换一个。'
		},
		'phone':{
			'rules':/^(([0\+]\d{2,3}-)?(0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$/,
			'tips':'请输入可以联系到您常用的电话号码！',
			'error':'对不起，您填写的电话号码格式不正确！'
		},
		'mobile':{
			'rules':/^[1-9]\d{10}$/,
			'tips':'请输入可以联系到您的手机号码！',
			'error':'对不起，您填写的手机号码格式不正确！'
		},
		'url':{
			'rules':/^(http|https):\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"])*$/,
			'tips':'请输入网站地址！',
			'error':'对不起，您填写的网站地址格式不正确！正确的网站地址如：http://www.abc.com/。'
		},
		'ip':{
			'rules':/^(0|[1-9]\d?|[0-1]\d{2}|2[0-4]\d|25[0-5]).(0|[1-9]\d?|[0-1]\d{2}|2[0-4]\d|25[0-5]).(0|[1-9]\d?|[0-1]\d{2}|2[0-4]\d|25[0-5]).(0|[1-9]\d?|[0-1]\d{2}|2[0-4]\d|25[0-5])$/,
			'tips':'请输入IP地址！',
			'error':'对不起，您填写的IP地址格式不正确！正确的IP地址如：192.168.1.1。'
		},
		'postal':{
			'rules':/^[1-9]\d{5}$/,
			'tips':'请输入邮政编码！',
			'error':'对不起，您填写的邮政编码格式不正确！正确的邮政编码如：410000。'
		},
		'qq':{
			'rules':/^[1-9]\d{4,}$/,
			'tips':'请输入您的QQ号！',
			'error':'对不起，您填写的QQ号格式不正确！正确的QQ号如：12345678。'
		},
		'english':{
			'rules':/^[A-Za-z]+$/,
			'tips':'请输入英文字母！',
			'error':'对不起，您填写的内容含有英文字母（A-Z,a-z）以外的字符！'
		},
		'chinese':{
			'rules':/^[\u0391-\uFFE5]+$/,
			'tips':'请输入中文字符！',
			'error':'对不起，您填写的内容含非中文字符！'
		},
		'ce':{
			'rules':/^[-\w\u0391-\uFFE5]+$/,
			'tips':'请输入中文或英文或数字字符！',
			'error':'对不起，您填写的内容不正确！'
		},
		'select':{
			'rules':/^[-\+]?[1-9]+$/,
			'tips':'请选择！',
			'error':'对不起，您选择的内容不正确！'
		},
		'integer':{
			'rules':/^[-\+]?\d+$/,
			'tips':'请输入整数！',
			'error':'对不起，您填写的内容不是整数！'
		},
		'uint':{
			'rules':/^\d+$/,
			'tips':'请输入整数！',
			'error':'对不起，您填写的内容不是整数！'
		},
		'idcard':{
			'rules':/(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3})|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])(\d{4}|\d{3}[x]))$/,
			'tips':'请输入身份证号码！',
			'error':'对不起，您填写的身份证号码格式不正确！'
		},
		'empty':{
			'rules':/^\s*$/
		},
		'anything':{
			'rules':/^[\s\S]*$/
		}
	}
}).init(window,document);