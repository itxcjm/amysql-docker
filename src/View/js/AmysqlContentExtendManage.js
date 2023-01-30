/************************************************
 *
 * Amysql AMS
 * Amysql.com 
 * @param Object 
 * AmysqlTableInsert  
 *
 */
var ContentExtendManageObject;

//*****************************************
ExtendArray.push({
	'_Events':[
		{'_Event':
			{'load':function ()
				{
					// 扩展管理
					ContentExtendManageObject = new ContentExtendManage();
					NavigationObject.add({
						'id':'N_manage', 'text':'', 'defaults':false, 'content':'ContentExtendManage', 
						'functions':function ()
						{
							ContentExtendManageObject.show();
						}
					});
					// End **
				}
			},
		'_EventObj':window
		}
	],
	'_ExtendInfo':{
			'ExtendId':'ExtendManageObject',
			'ExtendName':L.ExtensionManager,
			'ExtendAbout':L.ExtensionManagerAbout,
			'Version':'1.00',
			'Date':'2012-04-06',
			'WebSite':'https://amh.sh',
			'PoweredBy':'Amysql'
	}
})
// ExtendArray End *****************

// 扩展管理 **************************
var ContentExtendManage = function ()
{
	this._IfShow = false;
	this.list = C('div', {'id':'ContentExtendManage'});
	C(G('ContentBlock'), 'In', this.list);

	this.show = function ()
	{
		if(this._IfShow) return;
		this._IfShow = true;
		var AmysqlRootWindow = parent.parent.window;
		
		for (var k in ExtendArray )
		{
			if(ExtendArray[k]._ExtendInfo)
			{
				var Item = ExtendArray[k]._ExtendInfo;
				var div = C('div', {'className':'item','href':'javascript:'});
				div.PlugName = C('h3', 'In', Item.ExtendId + '<i>' + Item.Version + '<font>' + Item.Date + '</font></i>');
				div.PlugAbout = C('p', 'In', Item.ExtendName + ': ' + Item.ExtendAbout);
				div.WebSite = C('em', 'In', Item.WebSite);
				div.WebSite.onclick = function ()
				{
					AmysqlRootWindow.OpenWindow('Activate', Item.ExtendId, Item.PoweredBy, Item.WebSite);
				}
				div.PoweredBy = C('i', 'In', 'Powered By:' + Item.PoweredBy);

				div.button = C('a', {'id':'Deactivate', 'className':'button','href':'javascript:'});
				div.button.ExtendCookie = AmysqlRootWindow.Cookies.get('ContentExtendManage').indexOf(Item.ExtendId) == -1 ? null:1;
				C(div.button, {'innerHTML': (div.button.ExtendCookie == null) ? L.Deactivate : L.Activate});

				(function (Item)
				{
					div.button.onclick = function ()
					{
						var exp = new Date();
						exp.setTime(exp.getTime()*1.1);
						if(this.ExtendCookie == null)
						{
							this.innerHTML = L.Activate;
							this.ExtendCookie = 1;
							AmysqlRootWindow.Cookies.set('ContentExtendManage', AmysqlRootWindow.Cookies.get('ContentExtendManage') + '|' + Item.ExtendId + '|', exp, '/');
						}
						else
						{
							this.innerHTML = L.Deactivate;
							this.ExtendCookie = null;
							var exp = new Date();
							exp.setTime(exp.getTime()*1.1);
							AmysqlRootWindow.Cookies.set('ContentExtendManage', AmysqlRootWindow.Cookies.get('ContentExtendManage').replace('|' + Item.ExtendId + '|', '') , exp, '/');
						}
					}
				})(Item);
				this.SumDiv = C('DIV', {'className':'SumDiv'});
				C(this.SumDiv, 'In', '<div>' + printf(L.ExtensionManagerCount, {'sum':'<b>'+ExtendArray.length+'</b>', 'Notice':' <b>Notice:</b>'}) + '<br/><div style="color:#787878;margin-top:5px">' + L.ExtensionManagerNotice + '</div></div>');

				div.onmouseover = function ()
				{
					this.className = 'item_hover';
				}
				div.onmouseout = function ()
				{
					this.className = 'item';
				}
				if(Item.ExtendId == 'TableData' || Item.ExtendId == 'ExtendManageObject' || Item.ExtendId == 'TableList' || Item.ExtendId == 'DatabaseList') div.button = C('u');
				C(this.list, 'In', C(div, 'In', [div.PlugName, div.PlugAbout, div.PoweredBy, div.WebSite, div.button]));
			}
		}
		C(this.list, 'In', this.SumDiv);
	}
}