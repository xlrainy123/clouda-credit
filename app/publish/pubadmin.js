/*
 * pubadmin.js
 *
 * 定义后台管理员数据发布方法
 * 1. 数据模型名称smr_LocaleUser，此模型为Clouda框架内集成模型，用户可以连接mongod查看
 * 2. 数据发布名称pubadmin，此处选择使用publishPlain，原因为了防止返回后台数据的Collection,
 * 	  导致用户数据如用户名token、密码哈希pwd的泄漏
*/

module.exports=function(fw){
//提示：如果使用Clouda开发类似留言板或者其他功能时，要注意尽量使用securePublish*的方法,
//		对用户进行身份验证；并且如无特殊需求，建议在publish*方法后使用beforeDelete、beforeUpdate
//		禁止用户删除、修改已经存储在数据库的数据。
	fw.publishPlain('smr_LocaleUser','pubadmin',function(callback){
		var collection=this;
		collection.count({}, function(err,count){
		//如果已经不存在后台用户，则返回false，否则返回true
			var result=false;
			if(count>0){
				result=true;
			}
			callback(result);
		});
	});
}

