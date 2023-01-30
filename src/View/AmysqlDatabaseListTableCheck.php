<?php !defined('_Amysql') && exit; ?>
<script>
/************************************************
 *
 * Amysql AMS
 * Amysql.com 
 * @page 查检重载左栏数据库的数据表列表
 *
 */
	var obj = window.TableDataArray ? window : parent.window;

	var AmysqlTagWindow = obj.parent.parent.window.frames.AmysqlTag;
	var AmysqlLeftWindow = obj.parent.parent.window.frames.AmysqlLeft;
 
	var DN = obj.DatabaseName;
	var _Http = <?php echo json_encode(_Http);?>;

	var DItem = AmysqlLeftWindow.AmysqlLeftList.list.Item['AmysqlDatabase_' + DN];	// 数据库DOM
	DItem.dt.em.sum = 0;

	var TopLocation = AmysqlLeftWindow.getScrollTop();	//  记录滚动条高度

	// 删除掉子项重新加入
	if(DItem.ChildItem) DItem.ChildItem.parentNode.removeChild(DItem.ChildItem);
	DItem.ChildItem =  AmysqlLeftWindow.C('ul','',{'display':'block'});
	AmysqlLeftWindow.C(DItem, 'In', DItem.ChildItem);


	var AddTArr = [];
	for (var uk in obj.TableDataArray)
	{
		var v = obj.TableDataArray[uk];
		// url需要encode
		var AddT = {
			'name':v.Name,
			'id':'AmysqlTable_' + DN + ' » ' + v.Name,
			'url': _Http + 'index.php?c=ams&a=AmysqlTable&TableName=' + encodeURIComponent(v.Name) + '&DatabaseName=' + encodeURIComponent(DN),
			'IcoClass': (obj.is_null(v.Engine) && obj.is_null(v.Rows)) ? 'ico_tabel_views' : 'ico_tabel',
			'title':(obj.is_null(v.Engine) ? 'VIEW' : v.Engine) + ': ' + (v.Engine == 'InnoDB' ? '~':'') + (obj.is_null(v.Rows) ? '*' : v.Rows) + ' Rows' + ' @' + v.Name,
			'ChildItem':null
		};

		DItem.dt.em.sum = parseInt(DItem.dt.em.sum) +1;
		AddTArr.push(AddT);
	
	}
	
	// 有数据表
	if (AddTArr.length > 0)
	{
		DItem.dd.className = 'closelist';
		DItem.dt.em.innerHTML = '(' + DItem.dt.em.sum + ')';
		AmysqlLeftWindow.AmysqlLeftList.add(AddTArr, DItem.ChildItem);
	}
	else	// 没有表
	{
		DItem.dd.className = '';
		DItem.dt.em.innerHTML = '';
	}
	
	AmysqlLeftWindow.AmysqlLeftList.CopyAutoHeight();
	AmysqlLeftWindow.set_location_top(TopLocation);

</script>

