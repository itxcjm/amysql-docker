<?php include('AmysqlHeader.php'); ?>

<script>
var sql = <?php echo json_encode($sql);?>;
var CanEdit = <?php echo $CanEdit;?>;							// 数据是否可编辑
var CanEditStructure = <?php echo $CanEditStructure;?>;			// 结构是否可编辑
var UpSqlOriginal = <?php echo json_encode($UpSqlOriginal);?>;


var TableName = <?php echo json_encode($_GET['TableName']); ?>;			// 表名
var DatabaseName = <?php echo json_encode($_GET['DatabaseName']); ?>;	// 数据库名

var OperationQuery = <?php echo json_encode($OperationQuery);?>			// 操作Sql结果

var TableFieldList = <?php echo $FieldList;?>;							// 表字段数据
var TableFieldListName = <?php echo json_encode($AllField);?>;			// 表字段名列表
var TableIndexItem = <?php echo $ShowIndex;?>;							// 表索引数据

var TableDataFieldList = <?php echo isset($SqlData[3]) ? json_encode($SqlData[3]): '[]';?>;		// 查询结果字段数据
var TableDataArray = <?php echo $SqlStatus ? json_encode($SqlData[0]) : '[]';?>;				// 查询结果数据
var SqlStatus = <?php echo $SqlStatus;?>;								// Sql查询数据是否成功
var QueryResultSum = <?php echo $QueryResultSum;?>;						// 数据结果数量
var SqlTableSum = <?php echo $SqlData[2];?>;							// 所有数据总量
var ApproximateTag = <?php echo json_encode($SqlData[4][0]);?>;			// 约等符号

var page = <?php echo $page;?>;											// 当前页码
var PageShow = <?php echo $PageShow;?>;									// 一页显示
var PageSum = <?php echo ceil($SqlData[2]/$PageShow);?>;				// 总页数量
var TableShowIndex = <?php echo $SystemConfig -> TableShowIndex;?>;						// 是否显示索引
var TableResultContentLimit = <?php echo $SystemConfig -> TableResultContentLimit;?>;	// 内容最多显示长度
var TableKeyDownGoPage = <?php echo $SystemConfig -> TableKeyDownGoPage;?>;				// 键盘方向键翻页


var ExtendArray = [];											// 扩展
var StructureUpdateRun = [];									// 结构更新时运行的事件

// 版块显示相关
var DefaultActive = {};
var DefaultActiveSetID = 'N_browse';							// 查询Sql默认激活的内容块
var ActiveSetID = null;											// 激活设置ID
var FromObjectName = 'TableDataObject';							// 当前对象名

</script>

<body id="body">
<div id="T_Navigation">
	<a id="localhost" class="h1" href=""><i class="ico_localhost"></i> <?php echo $Config['Host'];?> <font>(<?php echo $mysql_version;?>)</font></a>
	<span class="join">»</span>
	<a id="DatabaseName" class="h1" href=""><i class="ico_database"></i> <?php echo $_GET['DatabaseName'];?></a>
	<span class="join">»</span>
	<a id="TableName" class="h1" href=""><i class="ico_tabel"></i> <?php echo $_GET['TableName'];?></a>
</div>

<div id="C_Navigation">
	<ul id="CB_Navigation"></ul>
</div>

<div id="ContentBlock">
	<?php include('AmysqlContentSqlSubmitForm.php'); ?>
</div>


<!-- AmysqlTable Javascript -->

<!-- 扩展顺序载入 -->
<script src="View/js/AmysqlLeftShowAndHide.js"></script>
<script src="View/js/AmysqlContentExtendManage.js"></script>
<script src="View/js/Table/AmysqlTableData.js"></script>
<script src="View/js/Table/AmysqlTableStructure.js"></script>
<script src="View/js/Table/AmysqlTableSearch.js"></script>
<script src="View/js/Table/AmysqlTableInsert.js"></script>
<script src="View/js/Table/AmysqlTableEmpty.js"></script>
<script src="View/js/Table/AmysqlTableDel.js"></script>
<!-- End -->

<script src="View/js/AmysqlContentNavigation.js"></script>
<script src="View/js/AmysqlContentSqlSubmitForm.js"></script>
<script src="View/js/AmysqlMenu.js"></script> 
<script src="View/js/SqlEdit/codemirror.js"></script> 
<script src="View/js/SqlEdit/plsql.js"></script> 
<script src="View/js/Table/AmysqlTableConfigure.js"></script>
<script src="View/js/Table/AmysqlTableMain.js"></script>

<!-- AmysqlUpObject -->
<link href="View/css/UploadObject.css" rel="stylesheet" type="text/css" />
<script src="View/js/Upload/jquery.js"></script>
<script src="View/js/Upload/webuploader.min.js"></script>
<script src="View/js/Upload/amfile.progress.js"></script>
	
</body>
</html>