<?php include('AmysqlHeader.php'); ?>

<script>
var sql = <?php echo json_encode($sql);?>;
var CanEdit = <?php echo $CanEdit;?>;								// 数据是否可编辑
var UpSqlOriginal = <?php echo json_encode($UpSqlOriginal);?>;

var OperationQuery = <?php echo json_encode($OperationQuery);?>;	// 操作Sql结果

var TableDataFieldList = <?php echo isset($SqlData[3]) ? json_encode($SqlData[3]): '[]';?>;		// 查询结果字段数据
var TableDataArray = <?php echo $SqlStatus ? json_encode($SqlData[0]) : '[]';?>;				// 查询结果数据
var SqlStatus = <?php echo $SqlStatus;?>;						// Sql查询数据是否成功
var QueryResultSum = <?php echo $QueryResultSum;?>;				// 数据结果数量
var SqlTableSum = <?php echo $SqlData[2];?>;					// 所有数据总量

var page = <?php echo $page;?>;									// 当前页码
var PageShow = <?php echo $PageShow;?>;							// 一页显示
var PageSum = <?php echo ceil($SqlData[2]/$PageShow);?>;		// 总页数量


var ExtendArray = [];											// 扩展
var DefaultActiveSetID = 'N_DatabaseList';						// 查询Sql默认激活的内容块
var ActiveSetID = null;
var FromObjectName = 'TableDataObject';							// 当前对象名

</script>

<body id="body">
<div id="T_Navigation">
	<a id="localhost" class="h1" href=""><i class="ico_localhost"></i> <?php echo $Config['Host'];?> <font>(<?php echo $mysql_version;?>)</font></a>
</div>

<div id="C_Navigation">
	<ul id="CB_Navigation"></ul>
</div>

<div id="ContentBlock">
	<?php include('AmysqlContentSqlSubmitForm.php'); ?>
</div>


<!-- 扩展顺序载入 -->
<script src="View/js/AmysqlLeftShowAndHide.js"></script>
<script src="View/js/AmysqlContentExtendManage.js"></script>
<script src="View/js/Home/AmysqlDatabaseList.js"></script>
<script src="View/js/Home/AmysqlDatabaseAdd.js"></script>
<script src="View/js/Home/AmysqlPrivileges.js"></script>
<script src="View/js/Home/AmysqlShowProcesslist.js"></script>
<script src="View/js/Home/AmysqlEngines.js"></script>
<script src="View/js/Home/AmysqlSqlHelp.js"></script>
<script src="View/js/Home/AmysqlShowAbout.js"></script>

<!-- End -->

<script src="View/js/AmysqlContentNavigation.js"></script>
<script src="View/js/AmysqlContentSqlSubmitForm.js"></script>
<script src="View/js/AmysqlMenu.js"></script> 
<script src="View/js/SqlEdit/codemirror.js"></script> 
<script src="View/js/SqlEdit/plsql.js"></script> 
<script src="View/js/Home/AmysqlHomeMain.js"></script>

</body>
</html>