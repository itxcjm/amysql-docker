/************************************************
 *
 * Amysql Framework
 * Amysql.com 
 * @param Object AmysqlPreviousTag 上滑动小标签插件
 *
 */

// ************************** 预设函数与配置 **************************

if(window.AmysqlMainObject)
{ 

	var PreviousChangeStatus;
	AmysqlMainObject.AmysqlExtend.push({
		'_ExtendInfo':{
			'ExtendId':'AmysqlPreviousTag',
			'PlugName':L.AmysqlPreviousTagLanguage.PlugName,
			'PlugAbout':L.AmysqlPreviousTagLanguage.PlugAbout,
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
				var PreviousItem = _AmysqlTag.AmysqlTabObject.GetMin('Previous');
				PreviousItem.span.onmouseover = function ()
				{
					if(this.id != 'PreviousLock')
						this.id = 'PreviousHover';
				}
				PreviousItem.span.onmouseout = function ()
				{
					if(this.id != 'PreviousLock')
						this.id = 'Previous';
				}

				// 改变状态
				PreviousChangeStatus = function ()
				{
					var TabListMarginLeft = parseInt(getStyle(_AmysqlTag.AmysqlTabObject.TabList,'margin-left').replace('px',''));
					PreviousItem.span.id = (TabListMarginLeft < 0) ? 'Previous' : 'PreviousLock';
				}

				PreviousChangeStatus();
				// 扩展中键上下滑动响应事件
				_AmysqlTag.AmysqlTabObject.extend(
					function ()
					{	 
						PreviousChangeStatus();
					}, ['PreAction','NextAction']
				);

				// 增加标签也同样响应
				_AmysqlTag.AmysqlTabObject.extend(
					function ()
					{	 
						PreviousChangeStatus();
					}, 'add'
				);
	 
			}
		},
		
		// 小标签项
		'_AmysqlTabMinJson':[{
			'order':8,
			'id':'Previous', 
			'name':L.AmysqlPreviousTagLanguage.name,
			'action':function ()
			{
				// 点击也改状态
				PreviousChangeStatus();
				if(window.NextChangeStatus) NextChangeStatus();
				_AmysqlTag.AmysqlTabObject.PreAction();
			}
		}]

	});

	

}
