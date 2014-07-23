/*
 *  adduser.js
 *
 *  建立URL与控制器之间的映射关系
 *  处理用户登录相关的操作
*/
sumeru.router.add(

	{
		pattern: '/home',
		action: 'App.home'
	}

);

//设置home为默认控制器
sumeru.router.setDefault('App.home');

App.home = sumeru.controller.create(function(env, session){
//该处redirect为在login控制器中创建的全局变量，用来进行URL重定向
	redirect=env.redirect;
//创建Auth认证对象
//提示：
//		对Auth对象，按照我个人的理解，应该在每一个controller（需要登录后访问的或者登录相关的)
//		中创建一个Auth对象,毕竟auth对象是env相关的，而且方便针对statusChange绑定不同的操作，
//		也许是我的理解有偏差，如有错误，请各位大牛指正。
	var u=sumeru.auth.create(env);

	var getData=function(){
	//因为默认controller为home，用户未登录情况下会重定向到login页面，但在转场过程中，会闪现home的页面，
	//所以在这里使用一个isShow进行判断，如果为true，则显示home视图内容，否则不显示。
		var isShow=false;
		env.subscribe('pubadmin',function(result){
			if(result===false){
			//没有检测到后台用户，则重定向到firstrun页面
				env.redirect('/firstrun',{},true);
			}
			else{
			//检测到后台用户，且该用户未登录，则重定向到login页面
				if(u.getStatus()==='not_login'){
					env.redirect('/login',{},true);
				}
			//检测到后台用户，且该用户已登录,则继续home原有逻辑
				else{
				//显示home视图内容
					isShow=true;
				//绑定Auth statusChange事件
					addLoginEventListener(u,env);
				}
			}
			session.bind('homeBlock',{
				isShow:isShow
			});
		});
	};

	env.onrender = function(doRender){
		doRender('home', ['push','left']);
	};

	env.onload = function(){
		return [getData];
	};

	env.onready = function(){
		session.event('homeBlock',function(){
			var e=document.getElementById('welcomeMessage');
			if(e){
				e.innerHTML+=u.getUserInfo().token||'';
			}
			e=document.getElementById('logoutBtn');
			if(e){
				e.onclick=function(){
				//触发statusChange事件,会执行前面绑定的事件处理函数，本例中为重定向到login页面
					u.logout();
				};
			}
		});
	};

});
