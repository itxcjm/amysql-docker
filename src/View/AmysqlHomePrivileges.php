<?php !defined('_Amysql') && exit; ?>
<script>

var SqlNoticeSql = parent.printf(parent.L.SqlQuery, 
	{
		'SQL1':<?php echo json_encode('<font title="' . $sql . '" color="blue">SQL</font>');?>, 
		'sum':'<b><?php echo number_format($UserData[2]);?></b>',
		'SQL2':<?php echo json_encode('<font title="' . $NewSql . '" color="blue">SQL</font>');?>, 
		'time':'<?php echo $UserData[1];?>', 
		'SQL3':<?php echo json_encode('<font title="' . $sql . '" color="blue">SQL</font>');?>, 
		'start':'0', 
		'end':'<?php echo number_format($UserData[2]);?>',
		'i':'<i>',
		'_i':'</i>',
		'ApproximateTag':''
	}
);

with(parent.window)
{
	sql = <?php echo json_encode($sql);?>;
	PrivilegesDataFieldList = <?php echo isset($UserData[3]) ? json_encode($UserData[3]): '[]';?>;		// 查询结果字段数据
	PrivilegesDataArray = <?php echo is_array($UserData[0]) ? json_encode($UserData[0]) : '[]';?>;		// 查询结果数据
	SqlPrivilegesSum = <?php echo $UserData[2];?>;													// 所有数据总量


	PrivilegesDataObject = new PrivilegesData();
	PrivilegesDataObject.ThItem = PrivilegesDataFieldList;
	PrivilegesDataObject.AddItem(PrivilegesDataArray);
	PrivilegesDataObject._IfShow = false;
	PrivilegesDataObject.show();	// 显示
	PrivilegesDataObject.MySQLVersion = <?php echo $mysql_version_int;?>;

	SqlSubmitFormObject.SqlForm.action = 'index.php?&c=ams&a=AmysqlHome';
	FromObjectName = 'TableDataObject';
	ActiveSetID = null;

	OperationQuery = <?php echo json_encode($OperationQuery);?>	// 操作Sql结果

}

parent.SqlSubmitFormObject.UpSqlNotice(SqlNoticeSql, parent.SqlStatus);
parent.SqlSubmitFormObject.SqlformoOriginal.value = parent.SqlSubmitFormObject.sql_post.value = parent.sql;
parent.SqlEdit.setValue(parent.sql + "<?php echo str_repeat('\\n', $SystemConfig -> SqlLine);?>");
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