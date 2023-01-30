<?php include('AmysqlHeader.php'); ?>

<script> 
var _Http = <?php echo json_encode(_Http);?>;
var _L = <?php echo json_encode($AmysqlLanguage);?>;
var _PDN = <?php echo json_encode($_SESSION['open_database_name']);?>;
</script>
<script src="View/js/language/<?php echo $AmysqlLanguage;?>.js"></script>
<script src="View/js/AmysqlConfig.js"></script>
<script>
if (_PDN) // (AMH)
{
	var _AmysqlTabJson = [
		{'type':'Normal','id':'AmysqlHome','name':L.HomeTitle + ' - localhost', 'url': _Http + 'index.php?c=ams&a=AmysqlHome'},
		{'type':'Activate','id':'AmysqlDatabase_' + _PDN ,'name': _PDN, 'url': _Http + 'index.php?c=ams&a=AmysqlDatabase&DatabaseName=' + _PDN}
	];
}
</script>
<script src="View/js/AmysqlMain.js"></script>

<script src="View/js/PlugIn/PluginManage/AmysqlPluginManage.js"></script>
<script src="View/js/PlugIn/AllTag/AmysqlAllTag.js"></script>
<script src="View/js/PlugIn/NewTag/AmysqlNewTag.js"></script>
<script src="View/js/PlugIn/AmysqlRecoveryTag.js"></script>
<script src="View/js/PlugIn/AmysqlNextTag.js"></script>
<script src="View/js/PlugIn/AmysqlPreviousTag.js"></script>
<script src="View/js/PlugIn/AmysqlCloseTag.js"></script>
<script>
/**
 **** Amysql Framework 框架总体结构 *********************************
 *
 *----- 程序加载顺序 ----------------------------------
 *
 *		- AmysqlContent -> AmysqlTag -> AmysqlLeft
 *
 *----- 操作流程 ----------------------------------
 *
 *		- AmysqlContent.html		创建 内容对象		AmysqlContent
 *		- AmysqlTag.html			创建 标签对象		AmysqlTab
 *		- AmysqlLeft.html			创建 列表内容对象		Amysql

 *		- AmysqlLeft.html -> Amysql对象触发 -> 增加标签至 AmysqlTab 对象 -> 增加内容项至 AmysqlContent 对象
 *
 ****************************************************************
 */


// 控制整体加载开始 ***************
window.onload = function() 
{
	G("AmysqlContent").src = _ContentUrl;
	_AmysqlContent = window.frames.AmysqlContent;
	_AmysqlLeft = window.frames.AmysqlLeft;
	_AmysqlTag = window.frames.AmysqlTag;
}

</script>
<frameset rows="31,*" cols="*" border="0" framespacing="0">
	<frame  name="AmysqlTag" id="AmysqlTag" scrolling="No" frameborder="0" border="0" noresize >
	<frameset rows="*" cols="236,*" border="0" id="AmysqlLeftAndContent"  framespacing="0">
		<frame  name="AmysqlLeft"  id="AmysqlLeft" frameborder="0" border="0" >
		<frame  scrolling="No" name="AmysqlContent" id="AmysqlContent"  frameborder="0" border="0">
	</frameset>
</frameset>
</HTML>
