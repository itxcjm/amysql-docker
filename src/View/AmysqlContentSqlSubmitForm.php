<?php !defined('_Amysql') && exit; ?>
<script>
var SqlUppercase = <?php echo $SystemConfig -> SqlUppercase;?>;	// 是否SQL自动大写
var SqlBold = <?php echo $SystemConfig -> SqlBold;?>;			// 是否SQL自动加粗
</script>
<!-- SQL -->
<?php
	// 当前URL不含 GET SQL
	// preg_match('/c=(.*)&a=(.*)&/iU', $_SERVER['QUERY_STRING'], $url);
	$c = isset($_GET['c']) ? '&c=' . urlencode($_GET['c']) : '';
	$a = isset($_GET['a']) ? '&a=' . urlencode($_GET['a']) : '';
	$DatabaseName = isset($_GET['DatabaseName']) ? '&DatabaseName=' . urlencode($_GET['DatabaseName']) : '';
	$TableName = isset($_GET['TableName']) ? '&TableName=' . urlencode($_GET['TableName']) : '';
	$url = 'index.php?' . $c . $a . $DatabaseName . $TableName;
?>
<div style="width:97.3%" id="SqlBlock">
	<form id="SqlForm" name="SqlForm" method="POST" target="GetTableData" action="<?php echo $url;?>">

		<!-- SQL操作提示-->
		<?php
			// 不管是否有执行操作类型SQL，都需输出"operation_sql" DOM。
			// $OperationQuery=='' 没有执行，$OperationQuery[0]==null查询成功, $OperationQuery[0]!=null 查询失败。
			$OperationQueryShow = ($OperationQuery != '') ? 'style="display:block"' : ''; 
		?> 
		<div id="operation_sql" <?php echo $OperationQueryShow;?> >
			<?php if (empty($OperationQuery[0])) { 
				  if(!isset($OperationQuery[1]))
				  {
				  	$OperationQuery = array();
				  	$OperationQuery[1] = '';
				  }	
			?>
			<!-- 操作SQl执行成功 -->
			<div class="SqlNotice" >
				<div id="OP_SqlStatus" class="SqlSuccess">
					<input type="button" value="{js}L.Close{/js}" class="execute_sql" id="cancel_confirm_sql"/>
					<input type="button" value="{js}L.ConfirmOperation + '>>'{/js}" class="execute_sql" id="confirm_sql"/>
					<b id="OP_SqlICOStatus" class="ico ico_sqlsuccess"></b>
					<font id="OP_SqlNotice" class="OSqlNotice">{js}printf(L.SqlOk, {'number':'<b><?php echo $OperationQuery[1];?></b>'}){/js}</font>
				 <br style="line-height:9px;"/>
				<div class="c"></div>
				</div>
			</div>
			<textarea id="operation_sql_text" name="operation_sql_text"><?php echo $operation_sql_text;?></textarea>
			<?php } else { ?>
			<!-- 操作SQl执行失败 -->
			<div class="SqlNotice" >
				<div id="OP_SqlStatus" class="SqlError">
					 <input type="button" value="{js}L.Close{/js}" class="execute_sql" id="cancel_confirm_sql"/>
					 <input type="button" value="{js}L.ConfirmOperation + '>>'{/js}" class="execute_sql" id="confirm_sql"/>
					<b id="OP_SqlICOStatus" class="ico ico ico_sqlError"></b>
					<font id="OP_SqlNotice" class="OSqlNotice">{js}printf(L.SqlError, {'number':'<b><?php echo $OperationQuery[1];?></b>'}){/js}
					<br /><?php echo $OperationQuery[0];?></font>
				 <br style="line-height:9px;"/>
				<div class="c"></div>
				</div>
			</div>
			<textarea id="operation_sql_text" name="operation_sql_text" class="warning_sql_text" ><?php echo $operation_sql_text;?></textarea>
			<?php } ?>
			<input type="hidden" name="ActionOperation" id="ActionOperation" value="0" /> <!-- 是否执行operation_sql_text -->
		</div>


		<!-- 查询SQL -->
		<div id="SqlNotice" class="SqlNotice" >
			<?php if ($SqlStatus) { ?>
				<!-- 查询成功 -->
				<div id="SqlStatus" class="SqlSuccess">
					<input type="submit" value="{js}L.Execution + '>>'{/js}" class="execute_sql"/>
					<b id="SqlICOStatus" class="ico ico_sqlsuccess"></b>
					<font id="OSqlNotice" class="OSqlNotice" >
					<script>
					// 避免innerHTML得到特殊符号先存于一变量
					var _tepm = printf(L.SqlQuery, 
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
					)
					</script>
					{js}_tepm{/js}
					</font>
				 <br style="line-height:9px;"/>
				<div class="c"></div>
				</div>
			<?php } else { ?>
				<!-- 查询失败 -->
				<div id="SqlStatus" class="SqlError">
					<input type="submit" value="{js}L.Execution + '>>'{/js}" class="execute_sql"/>
					<b id="SqlICOStatus" class="ico ico ico_sqlError"></b>
					<font id="OSqlNotice" class="OSqlNotice" >
						<?php echo $SqlData[0];?>
					</font>
				 <br style="line-height:9px;"/>
				<div class="c"></div>
				</div>
			<?php } ?>
		</div>


		<input type="hidden" name="original_sql"  id="SqlformoOriginal"  value="<?php echo $sql. "\n\n\n";?>"/>
		<input type="hidden" name="page"  id="SqlformPage" value="1"  />
		<textarea  id="sql_post" name="sql" ><?php echo $sql. str_repeat("\n", $SystemConfig -> SqlLine);?></textarea>
	</form>
</div> 
<script>
// 翻译 *****
var SqlBlockDom = G('SqlBlock');
C(SqlBlockDom, 'In', JsValue(SqlBlockDom.innerHTML));
</script>
<iframe src="" scrolling="auto" id="GetTableData" name="GetTableData"></iframe>

