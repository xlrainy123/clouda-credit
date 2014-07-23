/*
 *  adduser.js
 *
 *  建立URL与控制器之间的映射关系
 *  该controller只有在初次安装时使用
*/
sumeru.router.add(

	{
		pattern: '/adduser',
		action: 'App.adduser'
	}

);

App.adduser = sumeru.controller.create(function(env, session){
//该处redirect为在login控制器中创建的全局变量，用来进行URL重定向
	redirect=env.redirect;
//创建Auth认证对象
//提示：
//		对Auth对象，按照我个人的理解，应该在每一个controller（需要登录后访问的或者登录相关的)
//		中创建一个Auth对象,毕竟auth对象是env相关的，而且方便针对statusChange绑定不同的操作，
//		也许是我的理解有偏差，如有错误，请各位大牛指正。
	var u=sumeru.auth.create(env);

	var getData=function(){
	//订阅pubadmin数据，根据返回结果重定向到不同的controller
	//该处逻辑为如果pubadmin返回的数据为真，那么再次根据Auth对象
	//判断当前用户是否已经登录，如果已经登录，则重定向到home页面，
	//否则进入登录页面；
	//如果pubadmin返回的数据为假，那么表示后台还没有用户，则继续
	//进行注册用户过程
		env.subscribe('pubadmin',function(result){
			if(result===true){
				if(u.getStatus()==='logined'){
					env.redirect('/home',{},true);
				}
				else{
					env.redirect('/login',{},true);	
				}
			}
		});
	};

	env.onrender = function(doRender){
		doRender('adduser', ['push','left']);
	};

	env.onload = function(){
		return [getData];
	};

	env.onready = function(){
	//数据block命名比较乱。。。木有办法，英语很差。。。
		session.event('adduserBlock',function(){
		//此处通过这个办法获取该controller对应view的section，方便进行后续处理
		//session.__currentTplName为当前controller的名称
			var root=document.getElementById('view/'+session.__currentTplName+'@@content');
			if(root){
				var username=root.getElementsByTagName('input')[0];
				var password=root.getElementsByTagName('input')[1];
				var password2=root.getElementsByTagName('input')[2];
				var msg0=document.getElementById('adduserMessage0');
				var msg1=document.getElementById('adduserMessage1');
				var msg2=document.getElementById('adduserMessage2');
				var add=document.getElementById('adduserBtn');
				var cancel=document.getElementById('adduserCancel');
				var flag0=false;
				var flag1=false;

			//以下为一些简单的事件绑定，用来对用户输入进行简单的判断，并未进行严格的输入过滤
			//实际应用中应该进行严格的正则过滤，毕竟是要写入到数据库中的数据
				if(username && password && password2 && msg0 && msg1 &&add && cancel){
					username.onblur=function(){
						if(username.value.trim().length<=0){
							msg0.innerHTML='用户名不能为空';
						}
						else{
							flag0=true;
						}
					};
					username.onfocus=function(){
						msg0.innerHTML='';
					};
					password.onblur=function(){
						if(password.value.trim().length<=0){
							msg1.innerHTML='密码不能为空';
						}
					};
					password.onfocus=function(){
						msg1.innerHTML='';
					};
					password2.onblur=function(){
						if(password.value.trim()!==password2.value.trim()){
							msg2.innerHTML='两次输入的密码不一致';
						}
						else{
							flag1=true;
						}
					};
					password2.onfocus=function(){
						msg2.innerHTML='';
					};
					cancel.onclick=function(){
					//dispatch函数请参考login.js中的定义
						dispatch('firstrun');
					};
					
					adduserBtn.onclick=function(){
					//如果用户名或密码为空，则直接返回
						if(!flag0 || !flag1){
							return;
						}
						//首先使用registerValidate进行注册前的验证，只有在isUsefull为true时，才进行真正register操作
						u.registerValidate({'token':username.value.trim()},'local',function(err,isUsefull){
							if(!isUsefull){
								msg0.innerHTML='该用户名无法使用';
								return;
							}
							//注册用户
							//参数列表依次为用户民、密码（数据库中为加密存储）、用户信息（此处可以记录任何想记录的信息，如注册IP、时间等）和认证方式
							//认证方式目前有3种，分别为本地认证（默认）、百度帐号认证和第三方认证（第三方认证需要自行实现tpa.js)
							u.register(username.value.trim(),password.value.trim(),{},'local',function(err){
								if(err){
									msg0.innerHTML=err;
									return;
								}
								//注册成功后进入login页面
								else{
									env.redirect('/login',{},true);
								}
							});
						});
					};
				}
			}
		});
	};

});
