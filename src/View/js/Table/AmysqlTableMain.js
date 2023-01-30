/************************************************
 *
 * Amysql AMS
 * Amysql.com 
 * @param Object 
 * AmysqlTableMain  
 *
 */


// 数据表主对象 **************************
var TableMain = function ()
{
	this.LocalhostDom = G('localhost');
	this.DatabaseNameDom = G('DatabaseName');
	this.TableNameDom = G('TableName');
	this.ContentBlock = G('ContentBlock');			// 所有内容块
	
	with(this)
	{
		LocalhostDom.onclick = function ()
		{
			parent.parent.AmysqlLeft.AmysqlLeftList.Logo.onclick();
			return false;
		}
		DatabaseNameDom.onclick = function ()
		{
			// 触发列表点击
			var LeftDom = parent.parent.AmysqlLeft.AmysqlLeftList.list.Item['AmysqlDatabase_' + DatabaseName];
			LeftDom.dl.onclick();
			LeftDom.dt.onclick();
			return false;
		}
		TableNameDom.onclick = function ()
		{
			// 触发列表点击
			var LeftDom = parent.parent.AmysqlLeft.AmysqlLeftList.list.Item['AmysqlDatabase_' + DatabaseName].ChildItem.Item['AmysqlTable_' + DatabaseName + ' » ' + TableName];
			LeftDom.dl.onclick();
			LeftDom.dt.onclick();
			return false;
		}
	}

	// 运行
	this.run = function ()
	{

		// 打开首页显示版块
		if(QueryResultSum > 0) 
			DefaultActive.TableData = true;
		else 
			DefaultActive.TableStructure = true;
		if(Cookies.get('DefaultActive'))
		{
			for (var k in DefaultActive )
				DefaultActive[k] = false;
			DefaultActive[Cookies.get('DefaultActive')] = true;
			Cookies.del('DefaultActive');
		}

		// 扩展相关 *************************
		if(Cookies.get('ContentExtendManage') == null ) 
		{
			var exp = new Date();
			exp.setTime(exp.getTime()*1.1);
			Cookies.set('ContentExtendManage', ' ', exp, '/');
		}
		
		// 扩展加载
		for (var k in ExtendArray )
		{
			if(ExtendArray[k]._Events && !ExtendArray[k]._del)
			{
				for (var ke in ExtendArray[k]._Events)
				{
					// 加载未卸载的扩展
					if(Cookies.get('ContentExtendManage').indexOf('|' + ExtendArray[k]._ExtendInfo.ExtendId + '|') == -1)
						AddEvent(ExtendArray[k]._Events[ke]._Event, ExtendArray[k]._Events[ke]._EventObj);
				}
			}
		}
	}
}






// 运行开启 *****************************************

var NavigationObject = new Navigation();				// 导航对象
var AmysqlMenuObject = new AmysqlMenu();				// 菜单对象
var SqlSubmitFormObject = new AmysqlSqlSubmitForm();	// Sql表单提交对象
var TableMainObject = new TableMain();					// 数据表主对象
TableMainObject.run();									// 运行







