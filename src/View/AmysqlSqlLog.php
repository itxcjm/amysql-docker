<?php include('AmysqlHeader.php'); ?>
<style>
body {
	padding:3px 10px;
	width:96%;
	font-family: Arial,微软雅黑,宋体;
	color:#717171;
}
#body {
	width:auto;
}
.item {
	width:820px;
	height:25px;
	display:block;
	text-shadow: #fff 1px 1px 0;
}
a.item_list {
	padding:7px 9px;
	width:99%;
	display:block;
	font-size:12px;
	color:#4F4F4F;
	text-decoration: none;
	float:left;
	border-radius: 5px;
	margin:0px 0px 6px 0px;
	word-wrap:break-word;
}
a.item_list:hover {
	background:url("View/js/PlugIn/AllTag/bj.gif") repeat-x left top white;
	border-radius: 5px;
	border:1px solid #EBEBEB;
	padding:6px 8px;
}

a em{
	font-size:12px;
	color:#8B8EA3;
}

a i{
	margin-top:0px;
	font-size:10px;
	color:#8B8EA3;
	display:block;
	padding-left:30px;
}


.close {
	padding:10px;
}

.SumDiv {
	padding:10px;
	width:900px;
	/*float:left;*/
}
</style>
<script>
var sqllog = <?php echo json_encode($sqllog);?>;
var AmysqlLeftWindow = parent.parent.window.frames.AmysqlLeft;

var run_sql = function (i)
{
	if (sqllog[i].sql.substr(0, 6).toUpperCase() != 'SELECT' && sqllog[i].sql.substr(0, 4).toUpperCase() != 'SHOW')
	{
		if(!confirm(L.ConfirmExecution + "\n\r" + sqllog[i].sql)) return;
	}

	if (sqllog[i].DB)
	{
		var DatabaseNewOpen = AmysqlLeftWindow.AmysqlLeftList.list.Item['AmysqlDatabase_' + sqllog[i].DB];
		if(!typeof(DatabaseNewOpen)) return false;
		var TableId =  'AmysqlTable_' + sqllog[i].DB + ' » ' + sqllog[i].DT;
		var TableNewOpen = (sqllog[i].DT && DatabaseNewOpen.ChildItem.Item) ? DatabaseNewOpen.ChildItem.Item[TableId] : '';	// 是否存在表名

		if (TableNewOpen != '' && typeof(TableNewOpen) == 'object')	// 表存在
		{
			var _temp = TableNewOpen.url + '';
			TableNewOpen.url = _temp + '&sql=' + sqllog[i].sql;	// 更改URL
			TableNewOpen.dl.onclick();		
			TableNewOpen.dt.onclick();							// 打开
			TableNewOpen.url = _temp;							// 恢复URL
		}
		else // 没存在表的情况打开数据库页
		{
			var _temp = DatabaseNewOpen.url + '';
			DatabaseNewOpen.url = _temp + '&sql=' + sqllog[i].sql;
			DatabaseNewOpen.dd.onclick();
			DatabaseNewOpen.dt.onclick();
			DatabaseNewOpen.url = _temp;
		}
	}
	else
	{
	    parent.parent.OpenWindow('Activate', parent.parent._AmysqlTabJson[0].id, parent.parent._AmysqlTabJson[0].name, parent.parent._AmysqlTabJson[0].url +  '&sql=' + sqllog[i].sql);
	}
}
</script>

<body id="body">
<span id="h1">{js}L.SqlLog{/js}</span>
<?php 
	$len = is_array($sqllog) ? count($sqllog) : 0;
?>
<div class="SumDiv" > 
{js}printf(L.SqlLogSum, {'sum':'<?php echo $len;?>', 'limit':'<?php echo $SqlLogLimit;?>'}){/js}
<input type="button" value="{js}L.Refresh{/js}" onclick="window.location='index.php?c=index&a=AmysqlSqlLog'"/>
</div>
<?php
	$k = 1;
	for ($i=$len; $i>=0; $i--)
	{
		if(!empty($sqllog[$i]['sql']))
		{
		?>
			<div class="item">
			<a class="item_list" href="javascript:;" onclick="run_sql(<?php echo $i;?>)" >
			<em><?php echo $k < 10 ? '0'.$k:$k;?> )</em> &nbsp; <?php echo $sqllog[$i]['sql'];?> 
			<?php echo $sqllog[$i]['status'] == '0' ? '<u class="ico2 ico_del2"></u>' : '<u class="ico2 ico_sqlsuccess2"></u>';?>
			<i>(<?php echo date('Y-m-d H:i:s', $sqllog[$i]['time']);?>)</i>  
			</a>
			</div>
		<?php
			++$k;
		}
	}
?>
<div class="item">&nbsp;</div>
<script>
C(G('body'), 'In', JsValue(body.innerHTML));
</script>
</body>
</html>


