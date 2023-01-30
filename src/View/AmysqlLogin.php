<?php include('AmysqlHeader.php'); ?>
<link type="text/css" rel="stylesheet" href="View/css/index.css" />
<script src="View/js/language/list.js"></script>
<script src="View/js/language/<?php echo $AmysqlLanguage;?>.js"></script>
<script>
var header = {};
var NowUseLanguage = <?php echo json_encode($AmysqlLanguage);?>;
var NowUseTime = <?php echo json_encode(isset($_SESSION['AddTime']) ? $_SESSION['AddTime'] : '5I');?>;

var LL = {};				// 当前语言列表数据
var LSelectData = [];		// 语言选择下拉框数据
var LSelectDom = {};		// 语言选择下拉框
var SelectDom = {};			// SelectDom

var LtimeList = [['20','I'], ['1','H'], ['8','H'], ['1' ,'D'], ['1','M']];
var LTimeData = [];
var LTimeDom = {};

var UserDom = {};
var PassDom = {};
var SubmitDom = {};

var sun = function (NowUseLanguage)
{
	LL = LanguageList[NowUseLanguage];
	SelectDom = G('SelectDom');
	C(SelectDom, 'In', '');

	// 选择使用语言 ***********************
	LSelectData = [];
	for (var k in LanguageList )
		LSelectData.push(LanguageList[k]['text'] + '|' + k);
	LSelectDom = CreatesSelect(LSelectData, LL['text']);
	LSelectDom.name = 'language';
	C(SelectDom, 'In', C('p', 'In', [C('span', 'In', LL['UL'] + ': '), LSelectDom]));
	LSelectDom.onchange = function ()
	{
		sun(this.value);
	}

	// 选择持续时间 ************************
	LTimeData = [];
	for(var k in LtimeList)
		LTimeData.push(LtimeList[k][0]  + ' ' +  LL[LtimeList[k][1]] + '|' + LtimeList[k][0] + LtimeList[k][1]);
	LTimeDom = CreatesSelect(LTimeData, NowUseTime);
	LTimeDom.name = 'time';
	C(SelectDom, 'In', C('p', 'In', [C('span', 'In', LL['T'] + ': '), LTimeDom]));


	UserDom = G('UserDom');
	PassDom = G('PassDom');
	SubmitDom = G('SubmitDom');

	C(UserDom, 'In', LL['U'] + ': ');
	C(PassDom, 'In', LL['P'] + ': ');
	C(SubmitDom, {'value':LL['L']});
	window.document.title = LL.title;
}

window.onload = function ()
{
	header = G('header');
	sun(NowUseLanguage);
	C(header, 'In', JsValue(header.innerHTML));
}

</script>
<body>
	<div id="login">
		<div id="header">
			<a href="index.php" class="logo"></a>
			<?php
				if (isset($LoginError)) echo '<p id="error">' . $LoginError . '</p>';
			?>
			<div style="clear:both"></div>
		</div>

		<form id="LoginForm" action="index.php?c=index&a=AmysqlLogin" method="POST" autocomplete="off" >
			<div id="SelectDom">
			</div>			
			<p>
				<dl><dt id="UserDom"></dt><dd><input type="text" name="user" id="nameDom" class="input_text" value="<?php echo isset($_COOKIE['LoginUser']) ? $_COOKIE['LoginUser'] : '';?>" / ></dd></dl>
				<dl><dt id="PassDom"></dt><dd><input type="password" name="password" id="passwordDom" class="input_text" value="" / ></dd></dl>
				<dl><dt>&nbsp;</dt><dd id="login_submit"><input type="submit" name="login" id="SubmitDom" value=""  / ></dd></dl>
			</p>
		</form>
		<br />
		<p id="footer">
			Copyright © 2021 广州华的科技 All Rights Reserved <br />
			AMH提供技术支持 <a href="https://amh.sh" target="_blank">amh.sh</a> 
		</p>
	</div>
<script>
var nameDom = G('nameDom');
var passwordDom = G('passwordDom');
if(nameDom.value == '')  nameDom.focus(); else passwordDom.focus();
</script>
</body>
</html>
