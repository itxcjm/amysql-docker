<?php include('AmysqlHeader.php'); ?>

<script src="View/js/AmysqlTab.js"></script>
<script>
if(parent._AmysqlTagLoad)
{
	var AmysqlTabObject = new AmysqlTab();
	window.onload = function()
	{
		// 窗口重新加载时执行
		if (parent.AmysqlMainObject.AmysqlLoadComplete)
		{
			parent.AmysqlMainObject.AmysqlContentRun();
			parent.AmysqlMainObject.AmysqlTagRun();
		}

		parent._AmysqlLeftLoad = true;
		parent.G("AmysqlLeft").src = parent._LeftUrl;

		
	}
}
else
{
	parent.G("AmysqlContent").src = parent._ContentUrl;
}
</script>
<body id="navigation_body">
<div id="navigation" class="Normal">
<span id="Blank" class="Normal" style="padding:0px 4px;"></span>
</div>
</body>
</html>