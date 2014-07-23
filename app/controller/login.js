/*
 *  login.js
 *
 *  建立URL与控制器之间的映射关系
 *  处理用户登录相关的操作
*/
sumeru.router.add(

	{
		pattern: '/login',
		action: 'App.login'
	}

);

//定义一个全局函数，并在每个controller入口处赋值
//redirect=env.redirect;
//可能是我对env的理解有误，认为env时controller相关的，
//而且不想通过var _env=env这种方式暴露env的接口
var redirect=function(){
};

//定义一个分发包裹函数，主要用来处理不同controller之前
//传递的参数，根据target的不同进行参数的拼接
function dispatch(target,params){
	var p={};
	if(!target || target.length<=0){
		target="home";
	}
	
	redirect('/'+target,p,true);
};

//定义一个全局登录状态绑定函数
var addLoginEventListener=function(u,e){
	u.on('statusChange',function(err,status){
	//如果发生错误，且错误结果为“1001”，则表示用户名或密码错误
	//该处返回的错误code，可以通过查看Clouda源码得到
		if(err){
			if(err.code==="1001"){
			//该错误只可能出现在login页面
				if(session.__currentTplName==="login"){
					var msg=document.getElementById('loginMessage');
					msg.innerHTML='用户名或密码错误';
				}
			}
			return;
		}
		else{
			switch(status){
			//如果statuchange被触发，且status为未登录，则重定向到login页面
				case 'not_login':
					e.redirect('/login',{},true);
				break;
			//如果statuschange被触发，status为登录且用户在login等页面，则重定向到home
				case 'logined':
					var t=session.__currentTplName;
					if(!t || t==='login'){
						t='/home';
						e.redirect(t,{},true);
					}
					//e.redirect(t,{},true);
				break;
				case 'doing_login':
				break;
			}
		}
	});
}

App.login = sumeru.controller.create(function(env, session){
//该处redirect为在login控制器中创建的全局变量，用来进行URL重定向
	redirect=env.redirect;
//创建Auth认证对象
//提示：
//		对Auth对象，按照我个人的理解，应该在每一个controller（需要登录后访问的或者登录相关的)
//		中创建一个Auth对象,毕竟auth对象是env相关的，而且方便针对statusChange绑定不同的操作，
//		也许是我的理解有偏差，如有错误，请各位大牛指正。
	var u=sumeru.auth.create(env);

	var getData=function(){
	//因为默认controller为home，用户未登录情况下会重定向到login页面,如果login控制器判断没有后台
	//用户，则又会重定向到firstrun页面，但在转场过程中，会闪现home或login的页面，所以在这里使用
	//isShow进行判断，如果为true，则显示home视图内容，否则不显示。
		var isShow=false;
	//订阅pubadmin数据，根据返回结果重定向到不同的controller
	//该处逻辑为如果pubadmin返回的数据为真，那么再次根据Auth对象
	//判断当前用户是否已经登录，如果已经登录，则重定向到home页面，
	//否则进入登录页面；
	//如果pubadmin返回的数据为假，那么表示后台还没有用户，则重定向
	//到firstrun页面
		env.subscribe('pubadmin',function(result){
			if(result===false){
				env.redirect('/firstrun',{},true);
			}
			else{
				if(u.getStatus()==='logined'){
					env.redirect('/home',{},true);
				}
				else{
				//执行至此，可判断用户已经有访问home的权限，所有设置isShow为true
					isShow=true;
				//绑定Auth statusChange事件
					addLoginEventListener(u,env);
				}
				//将isShow绑定到loginBlock
				session.bind('loginBlock',{
					isShow:isShow
				});
			}
		});
	};

	env.onrender = function(doRender){
		doRender('login', ['push','left']);
	};

	env.onload = function(){
		return [getData];
	};

	env.onready = function(){
		session.event('loginBlock',function(){
		//此处通过这个办法获取该controller对应view的section，方便进行后续处理
		//session.__currentTplName为当前controller的名称
			var root=document.getElementById('view/'+session.__currentTplName+'@@content');
			if(root){
				var btn=document.getElementById('loginBtn');
				var username=root.getElementsByTagName('input')[0];
				var pwd=root.getElementsByTagName('input')[1];
				var uflag=false,pflag=false;
				if(!(btn && username && pwd)){
					return;
				}
				//绑定回车Enter keyup事件
				username.onkeyup=function(e){
					if(e.keyCode==13 && username.value.trim().length>0 && pwd.value.trim().length>0){
						u.login(username.value.trim(),pwd.value.trim(),{},'local');	
					}
				};
				//绑定回车Enter keyup事件
				pwd.onkeyup=function(e){
					if(e.keyCode==13 && username.value.trim().length>0 && pwd.value.trim().length>0){
						u.login(username.value.trim(),pwd.value.trim(),{},'local');	
					}
				}
				username.onblur=function(){
					if(username.value.trim().length<=0){
						username.value='用户名不能为空';
						username.style.color='red';
						uflag=false;
					}
					else{
						uflag=true;
					}
				};
				username.onfocus=function(){
					if(username.style.color=='red'){
						username.style.color='';	
						username.value='';
					}
				};
				pwd.onblur=function(){
					if(pwd.value.trim().length<=0){
						pwd.value='密码不能为空';
						pwd.type='text';
						pwd.style.color='red';
						pflag=false;
					}
					else{
						pflag=true;
					}
				};
				pwd.onfocus=function(){
					pwd.type='password';
					if(pwd.style.color=='red'){
						pwd.style.color='';
					}
					pwd.value='';
				};
				btn.onclick=function(){
					if(uflag && pflag){
					//进行Auth认证登录，认证方式为本地认证
						u.login(username.value.trim(),pwd.value.trim(),{},'local');
					}
				};
			}
			e=document.getElementById('loginCancel');
			if(e){
				e.onclick=function(){
					var root=document.getElementById('view/'+session.__currentTplName+'@@content');
					if(root){
						root.getElementsByTagName('input')[0].value='';
						root.getElementsByTagName('input')[1].value='';
						document.getElementById('loginMessage').innerHTML='';
					}
				};
			}
		});
	};

});
