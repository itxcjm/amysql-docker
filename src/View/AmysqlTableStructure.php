<?php !defined('_Amysql') && exit; ?>
<script>
with(parent.window)
{
	OperationQuery = <?php echo json_encode($OperationQuery);?>	// 操作Sql结果

	// 表结构重写 **********************************
	// 没有操作Sql的情况 OR 操作没报错才重写数据
	if(!OperationQuery[0] || OperationQuery[0] == null)
	{
		TableFieldList = <?php echo $FieldList;?>;
		TableIndexItem = <?php echo $ShowIndex;?>;					// 表索引数据

		TableObject = new Table();
		TableObject.AddField(TableFieldList);
		TableObject.IndexItem = TableIndexItem;
		TableObject.show();

		// 结构更新时重新加载
		for (var k in StructureUpdateRun)
			StructureUpdateRun[k]();
	}

	ActiveSetID = 'N_structure';	// 激活N_structure, (默认提交Sql激活的数据导航)
}
</script>
 