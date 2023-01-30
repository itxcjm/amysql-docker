<?php !defined('_Amysql') && exit; ?>
<script>
/************************************************
 *
 * Amysql AMS
 * Amysql.com 
 * @page 不存在表关闭当前页
 *
 */

	var TableName = <?php echo json_encode($_GET['TableName']); ?>;			// 表名
	var DatabaseName = <?php echo json_encode($_GET['DatabaseName']); ?>;	// 数据库名

	var AmysqlTagWindow = parent.parent.parent.window.frames.AmysqlTag;
	var AmysqlLeftWindow = parent.parent.parent.window.frames.AmysqlLeft;

	var ParentDom = AmysqlLeftWindow.AmysqlLeftList.list.Item['AmysqlDatabase_' + DatabaseName];
	var TableId = 'AmysqlTable_' + DatabaseName + ' » ' + TableName;
	var DelDom = ParentDom.ChildItem.Item[TableId];

	alert('已经不存在此表： `' + DatabaseName + '`.`' + TableName + '`');

	try
	{
		// 尝试从列表DOM中删除
		if(typeof(DelDom) == 'object')
			DelDom.parentNode.removeChild(DelDom);
		
		// 数量
		ParentDom.dt.em.sum = parseInt(ParentDom.dt.em.sum) -1;
		if(ParentDom.dt.em.sum != 0)
			ParentDom.dt.em.innerHTML = '(' + ParentDom.dt.em.sum + ')';
		else	// 没有表了
		{
			ParentDom.ChildItem = null;
			ParentDom.dt.em.innerHTML = '';
			ParentDom.dd.className = '';
		}
		    
	}
	catch (e){}
	

	// 从列表数据中删除
	for (var k in ParentDom.ChildItemData )
	{
		if(ParentDom.ChildItemData[k].id == TableId)
			ParentDom.ChildItemData.splice(k, 1);
	}

	var NowTag = AmysqlTagWindow.AmysqlTabObject.LastClickItem;									// 当前标签项
	AmysqlTagWindow.AmysqlTabObject.CloseTagFun(NowTag, true);									// 关闭当前标签

</script>
<?php exit();?> 