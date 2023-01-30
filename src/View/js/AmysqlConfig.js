/************************************************
 *
 * Amysql Framework
 * Amysql.com 
 * @param AmysqlConfig 系统配置
 *
 */
var _ContentUrl = _Http + 'index.php?c=index&a=AmysqlContent';
var _TagUrl = _Http + 'index.php?c=index&a=AmysqlTag';			// AmysqlTag
var _LeftUrl = _Http + 'index.php?c=index&a=AmysqlLeft';		// AmysqlLeft
var _AmysqlContent;						// 框架内容
var _AmysqlTag;							// 框架标签
var _AmysqlLeft;						// 框架左栏
var _AmysqlContentLoad = false;
var _AmysqlTagLoad = false;
var _AmysqlLeftLoad = false;


// 设置默认打开的标签列表
var _AmysqlTabJson = [
	{'type':'Activate','id':'AmysqlHome','name':L.HomeTitle + ' - localhost', 'url': _Http + 'index.php?c=ams&a=AmysqlHome'}
];

// 设置默认小标签列表
var _AmysqlTabMinJson = [];


// 设置左栏下拉菜单数据
var _AmysqlLNIJson = [
	/*{'order':6.1,'id':'SetTemplet', 'name':'AmysqlTemplet.html', 'url': 'index.php/index/AmysqlTemplet'},  */
	{'order':6.1,'id':'AmysqlSqlLog', 'name':L.SqlLog, 'url':'index.php?c=index&a=AmysqlSqlLog'},
	{'order':6.2,'id':'SetAmysql', 'name':L.SysSet, 'url':'index.php?c=index&a=AmysqlSystem'},
	{'order':6.3,'id':'AmysqlWeb', 'name':L.AmysqlWeb, 'url':'https://amh.sh'},
	{'order':6.4,'id':'LogoutAmysql', 'name':L.Logout, 'url':'index.php?c=index&a=logout'}, 
];

// 设置左栏列表数据
var _AmysqlLeftListJson = [];

