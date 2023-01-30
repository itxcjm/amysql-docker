/************************************************
 *
 * Amysql Framework
 * Amysql.com 
 * @param Object AmysqlNextTag 下滑动小标签插件
 *
 */

// ************************** 预设函数与配置 **************************

if(window.AmysqlMainObject)
{

	var NextChangeStatus;
	AmysqlMainObject.AmysqlExtend.push({
		'_ExtendInfo':{
			'ExtendId':'AmysqlNextTag',
			'PlugName':L.AmysqlNextTagLanguage.PlugName,
			'PlugAbout':L.AmysqlNextTagLanguage.PlugAbout,
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
				var NextItem = _AmysqlTag.AmysqlTabObject.GetMin('Next');
				NextItem.span.onmouseover = function ()
				{
					if(this.id != 'NextLock')
						this.id = 'NextHover';
				}
				NextItem.span.onmouseout = function ()
				{
					if(this.id != 'NextLock')
						this.id = 'Next';
				}

				// 改变状态
				NextChangeStatus = function ()
				{
					var TabListMarginLeft = parseInt(getStyle(_AmysqlTag.AmysqlTabObject.TabList,'margin-left').replace('px',''));
					if ((TabListMarginLeft - _AmysqlTag.AmysqlTabObject.TagUndulateValue*3) * -1 < _AmysqlTag.AmysqlTabObject.AllTagWidthSum && _AmysqlTag.AmysqlTabObject.AllTagWidthSum > _AmysqlTag.AmysqlTabObject.ShowBlockWidth - _AmysqlTag.AmysqlTabObject.ShowBlockWidthDiffer)
						NextItem.span.id = 'Next';
					else
						NextItem.span.id = 'NextLock';
				}

				NextChangeStatus();
				// 扩展中键上下滑动响应事件
				_AmysqlTag.AmysqlTabObject.extend(
					function ()
					{	 
						NextChangeStatus();
					}, ['PreAction','NextAction']
				);

				// 增加标签也同样响应
				_AmysqlTag.AmysqlTabObject.extend(
					function ()
					{	 
						NextChangeStatus();
					}, 'add'
				);
			}
		},
		
		// 小标签项
		'_AmysqlTabMinJson':[{
			'order':7,
			'id':'Next', 
			'name':L.AmysqlNextTagLanguage.name,
			'action':function ()
			{
				// 点击也改状态
				NextChangeStatus();
				if(window.PreviousChangeStatus) PreviousChangeStatus();
				_AmysqlTag.AmysqlTabObject.NextAction();
			}
		}]

	});

	

}
