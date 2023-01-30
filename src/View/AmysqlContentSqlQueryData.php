<?php !defined('_Amysql') && exit; ?>
<script>
var SqlNoticeSql = parent.printf(parent.L.SqlQuery, 
	{
		'SQL1':<?php echo json_encode('<font title="' . $sql . '" color="blue">SQL</font>');?>, 
		'sum':'<b><?php echo number_format($SqlData[2]);?></b>',
		'SQL2':<?php echo json_encode('<font title="' . $NewSql . '" color="blue">SQL</font>');?>, 
		'time':'<?php echo $SqlData[1];?>', 
		'SQL3':<?php echo json_encode('<font title="' . $sql . '" color="blue">SQL</font>');?>, 
		'start':'<?php echo $StartRead;?>', 
		'end':'<?php echo ($SqlData[2] < $PageShow || $QueryResultSum < $PageShow) ? $SqlData[2] : $StartRead+$PageShow;?>',
		'i':'<i>',
		'_i':'</i>',
		'ApproximateTag':'<?php echo $SqlData[4][0];?>'
	}
);

with(parent.window)
{
	sql = <?php echo json_encode($sql);?>;
	CanEdit = <?php echo $CanEdit;?>;	
	UpSqlOriginal = <?php echo json_encode($UpSqlOriginal);?>;

	TableDataFieldList = <?php echo isset($SqlData[3]) ? json_encode($SqlData[3]): '[]';?>;		// 查询结果字段数据
	TableDataArray = <?php echo $SqlStatus ? json_encode($SqlData[0]) : '[]';?>;				// 查询结果数据

	SqlStatus = <?php echo $SqlStatus;?>;												// Sql查询数据是否成功
	QueryResultSum = <?php echo $QueryResultSum;?>;										// 当前数据结果数量
	SqlTableSum = <?php echo $SqlData[2];?>;											// 所有数据总量
	ApproximateTag = <?php echo json_encode($SqlData[4][0]);?>;							// 约等符号

	OperationQuery = <?php echo json_encode($OperationQuery);?>	// 操作Sql结果
	page = <?php echo $page;?>;									// 当前页码
	PageShow = <?php echo $PageShow;?>;							// 一页显示
	PageSum = <?php echo ceil($SqlData[2]/$PageShow);?>;		// 总页数量


	// 表数据重写 **********************************
	// 没有操作Sql的情况 OR 操作没报错才重写数据
	List_loading('hide');
	if(!OperationQuery[0] || OperationQuery[0] == null)
	{
		TableDataObject = new TableData();
		TableDataObject.ThItem = TableDataFieldList;
		// 如果有结构字段就进行判断
		if(CanEdit && window.sqlField_IN_TableField && !sqlField_IN_TableField(TableDataObject.ThItem)) CanEdit = false;

		TableDataObject.AddItem(TableDataArray);
		TableDataObject._IfShow = false;
		TableDataObject.show();	// 显示

		<?php if($AmysqlSql) {?> 
			C(G('ListData'), 'In', JsValue(G('ListData').innerHTML));	// 翻译多语言
		<?php }?>
		
		// 有分页列表
		if(G('PageListTop'))
		{
			PageObject = new PageList('PageListTop');
			PageObject.set(page, PageSum);
			PageObject.show();
		}
	}

	// 激活内容块
	SqlSubmitFormObject.ActiveSetIng = true;	// 激活设置进行中
	NavigationObject.ActiveSet(NavigationObject.Item[ActiveSetID ? ActiveSetID : DefaultActiveSetID]);
	ActiveSetID = null;
	SqlSubmitFormObject.ActiveSetIng = false;	// 激活完成
	FromObjectName = 'TableDataObject';


	// 更新页面的SQL
	if(UpSqlOriginal) SqlSubmitFormObject.SqlformoOriginal.value = sql;
	SqlEdit.setValue(sql + "<?php echo str_repeat('\\n', $SystemConfig -> SqlLine);?>");
	SqlSubmitFormObject.sql_post.value = sql;

}

var SqlNotice = parent.SqlStatus ? SqlNoticeSql : <?php echo json_encode($SqlData[0]);?>;
parent.SqlSubmitFormObject.UpSqlNotice(SqlNotice, parent.SqlStatus);
parent.SqlSubmitFormObject.ActionOperation.value = 0;



 
// 显示操作sql 的结果　
if(parent.window.OperationQuery != '')
{
	if(parent.window.OperationQuery[0])	// 执行有报错
		parent.window.SqlSubmitFormObject.UpOperationSqlNotice(parent.printf(parent.L.SqlError, {'number':'<b>' + parent.window.OperationQuery[1] + '</b>'}) + ' <br />' + parent.window.OperationQuery[0], 0);
	else
		parent.window.SqlSubmitFormObject.UpOperationSqlNotice(parent.printf(parent.L.SqlOk, {'number':'<b>' + parent.window.OperationQuery[1] + '</b>'}) , 1);

	parent.window.SqlSubmitFormObject.operation_sql_text.value = <?php echo json_encode($operation_sql_text);?>;
}
</script>
