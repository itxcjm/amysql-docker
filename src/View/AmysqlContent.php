<?php include('AmysqlHeader.php'); ?>

<script src="View/js/AmysqlContent.js"></script>
<script src="View/js/AmysqlSql.js"></script>
<script>

// 设置对象与属性
var AmysqlContentObject = new AmysqlContent();
window.onload = function()
{
	parent._AmysqlTagLoad = true;
	parent.G("AmysqlTag").src = parent._TagUrl;
}


var AmysqlCollations = <?php echo $AmysqlCollations;?>;					// Collations列表
var AmysqlCollationsDefault = <?php echo $AmysqlCollationsDefault;?>;	// 默认Collations
var AmysqlEngines = <?php echo json_encode($AmysqlEngines);?>;		// 支持的引擎列表
var AmysqlSqlObject = new AmysqlSql();								// sql编辑对象

</script>
</head>
<frameset id="content" rows="100%,*" cols="*" frameborder="no" border="0" framespacing="0"></frameset>
</html>