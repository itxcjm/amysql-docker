<?php include('AmysqlHeader.php'); ?>

<script src="View/js/AmysqlLeft.js"></script>
<script src="View/js/AmysqlLeftNavigation.js"></script>
<style>
body,html { _overflow-x:hidden; }
</style>

<script>
var AmysqlLNO = new AmysqlLN();
var AmysqlLeftList = new AmysqlLeftListObject();
window.onload = function ()
{

	parent._AmysqlLeftListJson = <?php echo $DatabasesList;?>;


	// 窗口重新加载时执行
	if (parent.AmysqlMainObject.AmysqlLoadComplete)
	{
		parent._AmysqlTagLoad = false;
		parent.AmysqlMainObject.AmysqlLeftRun();
		parent.AmysqlMainObject.AmysqlExtendInitialConfigRun();	// 重新初始化
	}
	else if(parent._AmysqlLeftLoad && parent._AmysqlTagLoad) 	// 首次加载完成运行
	{
		parent._AmysqlTagLoad = false;
		parent.AmysqlMainObject.AmysqlRun();
	}
	
}
</script>
</head>
<body id="left">
<div id="left_navigation"></div>
<div id="left_logo"><!--LOGIN--></div>
<div id="AmysqlLeftList"></div>
</body>
</html>