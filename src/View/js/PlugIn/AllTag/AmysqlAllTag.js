/************************************************
 *
 * Amysql Framework
 * Amysql.com 
 * @param Object AmysqlAllTag 全部标签列表插件
 *
 */

// ************************** 预设函数与配置 **************************

if(window.AmysqlMainObject)
{
	AmysqlMainObject.AmysqlExtend.push({
		'_ExtendInfo':{
			'ExtendId':'AmysqlAllTag',
			'PlugName':L.AmysqlAllTagLanguage.PlugName,
			'PlugAbout':L.AmysqlAllTagLanguage.PlugAbout,
			'Sort':'Menu',
			'Version':'1.10',
			'Date':'2011-05-19',
			'WebSite':'https://amh.sh',
			'PoweredBy':'Amysql'
		},

		'_AmysqlExtendInitialConfig':function ()
		{
			if (window._AmysqlTag)
			{
				var ShowItem = _AmysqlTag.AmysqlTabObject.GetMin('AmysqlAllShow');
				ShowItem.span.onmouseover = function ()
				{
					this.id = 'ShowHover';
				}
				ShowItem.span.onmouseout = function ()
				{
					this.id = 'AmysqlAllShow';
				}
			}
		},

		'_AmysqlTabMinJson':[{
			'order':9,
			'id':'AmysqlAllShow', 
			'name':L.AmysqlAllTagLanguage.name,
			'PlugIn':true,
			'url':'js/PlugIn/AllTag/AmysqlAllTag.js'
		}],

		'_AmysqlLNIJson':[{
			'order':3,
			'id':'AmysqlAllShow', 
			'name':L.AmysqlAllTagLanguage.name,
			'PlugIn':true,
			'url':'js/PlugIn/AllTag/AmysqlAllTag.js'
		}]

	});
}

// ************************** 标签打开后运行 **************************

if(window.ExtendContent)
{
	var R_W = parent.parent;
	var AmysqlTagWindow = R_W.window.frames.AmysqlTag;
	var AmysqlParentWindow = parent.window;

	// 创建子条项
	var CreateItem = function (Item)
	{
		var DIV = C('DIV', {'className':'item'});
		var A = C('A', {'className':'item_list', 'href':'javascript:;'});

		// 详细位置
		var TagID = '<b>' + Item.id.replace(/AmysqlTable_/, '').replace(/AmysqlDatabase_/, '') + '</b>';
		var I = C('I', {'innerHTML':TagID + ' &nbsp; <br /> <em>' + (Item.command.length > 90 ? Item.command.substr(0,90) + ' ... ' : Item.command) + '</em>', 'title':Item.command});
		
		// 标题
		var SPAN = C('SPAN', {'innerHTML':Item.text});

		A.appendChild(I);
		A.appendChild(SPAN);

		A.onclick = function (e)
		{
			var src = e ? e.target : event.srcElement; 
			if(src.tagName == 'U') return;

			// 我们使用add方法激活 标签是已存在 不会再插入新标签 同时处理标签所在位置
			// AmysqlTagWindow.AmysqlTabObject.TagOnclick(Item);	// 也可以这样激活标签 但不会跳到当前标签位置
			Item.type = 'Activate';
			AmysqlParentWindow.AmysqlContentObject.LoadRefresh = false;	// 不刷新
			AmysqlTagWindow.AmysqlTabObject.add(Item);	// 激活标签
		}
		// *************************************


		// 关闭
		var U = C('u', {'className':'close','title':R_W.L.AmysqlAllTagLanguage.close});
		var X = C('u', {'className':'ico2 ico_del2'});
		X.href = 'javascript:;';
		U.onclick = function ()
		{

			var RunClick = true;	// 是否关闭时 同时执行点击事件 更新标签 
			AmysqlTagWindow.AmysqlTabObject.GoLocation(false, AmysqlTagWindow.AmysqlTabObject.LastClickItem.TagListKey);			// 位置
			AmysqlTagWindow.AmysqlTabObject.CloseTagFun(Item, RunClick);				// 关闭标签

			var GoShowObject = new GoShow();	// 删除后key都变了。重新来一次吧~
			
			// AmysqlTagList.removeChild(DIV);
			// --ItemSum;
			// GoShowObject.ItemSumB.innerHTML = ItemSum;
		}
		if(Item.id != AmysqlTagWindow.AmysqlTabObject.NumberOneId ) // 第一个标签不显示关闭
			U.appendChild(X);
		// *************************************

		DIV.appendChild(A);
		SPAN.appendChild(U);		
		return DIV;
	}

	var GoShow = function ()
	{
		this.AmysqlTagList = C('div', {'id':'AmysqlTagList'});
		this.SumDiv = null;
		this.TempTag = new Array();
		this.ItemSum = 0;

		this.AmysqlTagList.innerHTML = '';

		for (key in AmysqlTagWindow.AmysqlTabObject.Item)
		{
			this.TempTag[key] = [AmysqlTagWindow.AmysqlTabObject.Item[key].id, key];	// 存临时数组
		}
		// 排序
		this.TempTag.sort();

		for (key in this.TempTag )
		{
			++this.ItemSum;
			// 增加至列表
			this.AmysqlTagList.appendChild(CreateItem(AmysqlTagWindow.AmysqlTabObject.Item[this.TempTag[key][1]]));
		}
		
		this.SumDiv = C('DIV');
		this.SumDiv.className = 'SumDiv';
		this.SumDiv.innerHTML = R_W.printf(R_W.L.AmysqlAllTagLanguage.Count, {'sum':this.ItemSum});

		this.AmysqlTagList.appendChild(this.SumDiv);
		document.body.innerHTML = '';
		C(document.body, 'In', [
			C('link',{'type':'text/css','rel':'stylesheet','href':'js/PlugIn/AllTag/style.css'}),
			C(C('span','In', R_W.L.AmysqlAllTagLanguage.name), {'id':'h1'}),
			this.AmysqlTagList]
		);
	}

	document.body.innerHTML = '<div id="LoadingBlock">&nbsp; Loading...<div id="loading"></div></div>';
	setTimeout(
		function () {
				var GoShowObject = new GoShow();
		}, 50
	);
}