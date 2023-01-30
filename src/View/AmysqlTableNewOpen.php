<?php !defined('_Amysql') && exit; ?>
<script>
/************************************************
 *
 * Amysql AMS
 * Amysql.com 
 * @page 打开新窗口
 *
 */

	var AmysqlTagWindow = parent.parent.parent.window.frames.AmysqlTag;
	var AmysqlLeftWindow = parent.parent.parent.window.frames.AmysqlLeft;

	var NewOpenSql = <?php echo json_encode(urlencode($sql));?>;
	var SqlFromName = <?php echo json_encode($SqlFromName);?>;
	var DatabaseNewOpen = AmysqlLeftWindow.AmysqlLeftList.list.Item['AmysqlDatabase_' + SqlFromName.DatabaseName];

	
	// 恢复当前窗口的查询SQL为原始SQL
	function ChangeToBaseSql()
	{
		parent.SqlSubmitFormObject.sql_post.value = parent.SqlSubmitFormObject.SqlformoOriginal.value;
		parent.window.SqlEdit.setValue(parent.SqlSubmitFormObject.SqlformoOriginal.value);
	}

	// 2012-4-23去掉Cookie方式，使用GET方式，解决可能打开多个窗口问题。
	// var exp = new Date();
	// exp.setTime(exp.getTime()*1.1);
	// parent.Cookies.set('sql', NewOpenSql , exp, '/');	// 记录Sql新窗口打开 

	if (typeof(DatabaseNewOpen) == 'object')
	{
		DatabaseNewOpen.dl.onclick();	// 展开

		var TableId =  'AmysqlTable_' + SqlFromName.DatabaseName + ' » ' + SqlFromName.TableName;
		var TableNewOpen = (SqlFromName.TableName != '' ) ? DatabaseNewOpen.ChildItem.Item[TableId] : '';	// 是否存在表名


		if (TableNewOpen != '' && typeof(TableNewOpen) == 'object')	// 表存在
		{
			ChangeToBaseSql();
			var _temp = TableNewOpen.url + '';
			TableNewOpen.url = _temp + '&sql=' + NewOpenSql;	// 更改URL
			TableNewOpen.dl.onclick();		
			TableNewOpen.dt.onclick();							// 打开
			TableNewOpen.url = _temp;							// 恢复URL
		}
		else // 没存在表的情况打开数据库页
		{
			ChangeToBaseSql();
			var _temp = DatabaseNewOpen.url + '';
			DatabaseNewOpen.url = _temp + '&sql=' + NewOpenSql;
			DatabaseNewOpen.dd.onclick();
			DatabaseNewOpen.dt.onclick();
			DatabaseNewOpen.url = _temp;
		}
		
	}
	else
	{
		if(parent.window.DatabaseMainObject)	// 数据库页
			parent.DatabaseMainObject.DatabaseNameDom.onclick();
		else if(parent.window.TableMainObject)	// 数据表页
			parent.TableMainObject.DatabaseNameDom.onclick();

		ChangeToBaseSql();
		//alert('不存在数据库:' + SqlFromName.DatabaseName);
	}

	parent.List_loading('hide');
</script>

