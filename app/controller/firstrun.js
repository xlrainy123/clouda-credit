/*
 *  firstrun.js
 *
 *  建立URL与controller之间的映射关系
 *  此controller只在初次安装时使用
*/
sumeru.router.add(

	{
		pattern: '/firstrun',
		action: 'App.firstrun'
	}

);

App.firstrun = sumeru.controller.create(function(env, session){
//该处redirect为在login控制器中创建的全局变量，用来进行URL重定向
	redirect=env.redirect;
//创建Auth认证对象
	var u=sumeru.auth.create(env);

	var getData=function(){
	//订阅pubadmin数据，根据返回结果重定向到不同的controller
	//该处逻辑为如果pubadmin返回的数据为真，那么再次根据Auth对象
	//判断当前用户是否已经登录，如果已经登录，则重定向到home页面，
	//否则进入登录页面；
	//如果pubadmin返回的数据为假，那么表示后台还没有用户，则继续
	//进行初次安装过程
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
		doRender('firstrun', ['push','left']);
	};

	env.onload = function(){
		return [getData];
	};
});
