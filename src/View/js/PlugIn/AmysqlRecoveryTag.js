/************************************************
 *
 * Amysql Framework
 * Amysql.com 
 * @param Object AmysqlRecoveryTag 恢复窗口插件
 *
 */

// ************************** 预设函数与配置 **************************

if(window.AmysqlMainObject)
{

	AmysqlMainObject.AmysqlExtend.push({
		'_ExtendInfo':{
			'ExtendId':'AmysqlRecoveryTag',
			'PlugName':L.AmysqlRecoveryTagLanguage.PlugName,
			'PlugAbout':L.AmysqlRecoveryTagLanguage.PlugAbout,
			'Sort':'Menu',
			'Version':'1.10',
			'Date':'2011-05-19',
			'WebSite':'https://amh.sh',
			'PoweredBy':'Amysql'
		},

		'_AmysqlExtendInitialConfig':function ()
		{
			if(window._AmysqlLeft && window._AmysqlTag)
			{
				_AmysqlLeft.AmysqlLNO.get('RecoveryTag').A.B.style.color = '#D2D2D2';	// 默认链接是灰色
					
				// 扩展关闭标签函数，关闭时连接恢复原颜色
				_AmysqlTag.AmysqlTabObject.extend(
					function ()
					{	
						if(_AmysqlTag.AmysqlTabObject.CloseTagItem.id != 'RecoveryTag')
							_AmysqlLeft.AmysqlLNO.get('RecoveryTag').A.B.style.color = '';
					}, 'CloseTagFun'
				);
			}
		},

			// 配置参数
		'_AmysqlLNIJson':[{
			'order':2,
			'id':'RecoveryTag',
			'name':L.AmysqlRecoveryTagLanguage.name,
			'PlugIn':true,
			'action':function ()
			{
				if(!_AmysqlTag.AmysqlTabObject.CloseTagItem.id || _AmysqlTag.AmysqlTabObject.CloseTagItem.id == 'RecoveryTag') // 没有关闭标签就返回
				{
					_AmysqlLeft.AmysqlLNO.LeftNavigationDom.style.display = 'block';	// 不关闭下拉菜单
					_AmysqlTag.AmysqlTabObject.New.id = 'NewUp';
					return false;
				}
				return true;
			},
			'url':'js/PlugIn/AmysqlRecoveryTag.js'
		}]

	});

}


// ************************** 标签打开后运行 **************************
if(window.ExtendContent)
{
	var AmysqlTagWindow = parent.parent.window.frames.AmysqlTag;
	var AmysqlLeftWindow = parent.parent.window.frames.AmysqlLeft;
	var AmysqlRootWindow = parent.parent.window;

	var GoShow = function ()
	{
		var CloseTag = AmysqlTagWindow.AmysqlTabObject.CloseTagItem;								// 最后关闭标签项
		var NowTag = AmysqlTagWindow.AmysqlTabObject.LastClickItem;									// 当前标签项

		AmysqlLeftWindow.AmysqlLNO.get('RecoveryTag').A.B.style.color = '#D2D2D2';					// 连接变灰色
		if(CloseTag.id)
			AmysqlRootWindow.OpenWindow('Activate', CloseTag.id, CloseTag.text, CloseTag.command);	// 打开之前关闭的标签
		AmysqlTagWindow.AmysqlTabObject.CloseTagFun(NowTag, true);									// 关闭当前标签

		return;
	}

	document.body.innerHTML = '<div id="LoadingBlock">&nbsp; Loading...<div id="loading"></div></div>';
	setTimeout(
		function () {
				var GoShowObject = new GoShow();
		}, 0
	);
}