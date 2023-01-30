/************************************************
 *
 * Amysql Framework
 * Amysql.com 
 * @param Object AmysqlCloseTag 关闭小标签插件
 *
 */

// ************************** 预设函数与配置 **************************

if(window.AmysqlMainObject)
{
	
	AmysqlMainObject.AmysqlExtend.push({
		'_ExtendInfo':{
			'ExtendId':'AmysqlCloseTag',
			'PlugName':L.AmysqlCloseTagLanguage.PlugName,
			'PlugAbout':L.AmysqlCloseTagLanguage.PlugAbout,
			'Sort':'MinTag',
			'Version':'1.10',
			'Date':'2011-05-19',
			'WebSite':'https://amh.sh',
			'PoweredBy':'Amysql'
		},

		'_AmysqlExtendInitialConfig':function ()
		{
			if (window._AmysqlTag)
			{
				var CloseItem = _AmysqlTag.AmysqlTabObject.GetMin('Close');
				CloseItem.span.onmouseover = function ()
				{
					if(this.id != 'CloseLock')
						this.id = 'CloseHover';
				}
				CloseItem.span.onmouseout = function ()
				{
					if(this.id != 'CloseLock')
						this.id = 'Close';
				}
				
				// 改变状态
				var CloseChangeStatus = function ()
				{
					CloseItem.span.id = (_AmysqlTag.AmysqlTabObject.NumberOneId == _AmysqlTag.AmysqlTabObject.LastClickItem.id) ? 'CloseLock' : 'Close';
				}

				CloseChangeStatus();
				// 扩展标签点击响应事件
				_AmysqlTag.AmysqlTabObject.extend(
					function ()
					{	 
						CloseChangeStatus();
					}, 'TagOnclick'
				);

				// 增加标签也同样响应
				_AmysqlTag.AmysqlTabObject.extend(
					function ()
					{	 
						CloseChangeStatus();
					}, 'add'
				);
	 
			}
		},
			
		// 小标签项
		'_AmysqlTabMinJson':[{
			'order':6,
			'id':'Close', 
			'name':L.AmysqlCloseTagLanguage.name,
			'action':function ()
			{
				_AmysqlTag.AmysqlTabObject.GoLocation(false, _AmysqlTag.AmysqlTabObject.LastClickItem.TagListKey - 1);		// 跳到标签位置
				_AmysqlTag.AmysqlTabObject.CloseTagFun(_AmysqlTag.AmysqlTabObject.Item[_AmysqlTag.AmysqlTabObject.LastClickItem.TagListKey], true);		// 关闭标签
			}
		}]

	});
}
