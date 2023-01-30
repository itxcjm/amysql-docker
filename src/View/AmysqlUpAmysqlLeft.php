<?php !defined('_Amysql') && exit; ?>
<script>
/************************************************
 *
 * Amysql AMS
 * Amysql.com 
 * @page 更新左栏数据
 *
 */

	var AmysqlTagWindow = parent.parent.parent.window.frames.AmysqlTag;
	var AmysqlLeftWindow = parent.parent.parent.window.frames.AmysqlLeft;
 
	var _Http = <?php echo json_encode(_Http);?>;
	var DatabaseName = <?php echo isset($_GET['DatabaseName']) ? json_encode($_GET['DatabaseName']) : "''"; ?>;	// 数据库名
	var UpAmysqlLeftData = <?php echo json_encode($UpAmysqlLeftData);?>;

	// 增加数据库或数据表
	if (typeof(UpAmysqlLeftData.add) == 'object' && UpAmysqlLeftData.add.length > 0)
	{
		for (var k in UpAmysqlLeftData.add)
		{
			// 创建只能一个
			var DN = UpAmysqlLeftData.add[k][0].DatabaseName;		// 添加的数据库名称
			var TN = UpAmysqlLeftData.add[k][0].TableName;			// 添加的数据表名称
			DN = DN.substr(1, (DN.length-2));
			TN = TN.substr(1, (TN.length-2));

			if (DN != '' && TN == '')
			{
				// 增加数据库 ********************
				var AddD = {
					'name':DN,
					'id':'AmysqlDatabase_' + DN,
					'url': _Http + 'index.php?c=ams&a=AmysqlDatabase&DatabaseName=' + encodeURIComponent(DN),
					'IcoClass':'ico_database',
					'ChildItemSum':0,
					'ChildItem':null
				};
				AmysqlLeftWindow.AmysqlLeftList.add([AddD]);	// 增加数据库DOM
			}
			else
			{
				var TableType = UpAmysqlLeftData.add[k][0].TableType;		// 数据表或视图
				DN = DN == '' ? DatabaseName : DN;							// 默认当前数据库

				// 增加数据表 ********************
				var AddT = {
					'name':TN,
					'id':'AmysqlTable_' + DN + ' » ' + TN,
					'url': _Http + 'index.php?c=ams&a=AmysqlTable&TableName=' + encodeURIComponent(TN) + '&DatabaseName=' + encodeURIComponent(DN),
					'IcoClass':TableType == 'VIEW' ? 'ico_tabel_views' : 'ico_tabel',
					'ChildItem':null
				};

				var DItem = AmysqlLeftWindow.AmysqlLeftList.list.Item['AmysqlDatabase_' + DN];	// 数据库DOM
				
				// 首次增加子项
				if(DItem.ChildItem == null)
				{
					DItem.ChildItem =  AmysqlLeftWindow.C('ul','',{'display':'block'});
					AmysqlLeftWindow.C(DItem, 'In', DItem.ChildItem);
					DItem.dd.className = 'closelist';
				}
				DItem.dt.em.sum = parseInt(DItem.dt.em.sum) +1;
				DItem.dt.em.innerHTML = '(' + DItem.dt.em.sum + ')';
				AmysqlLeftWindow.AmysqlLeftList.add([AddT], DItem.ChildItem);
			}
		}
	}


	// 删除数据库或数据表
	if (typeof(UpAmysqlLeftData.del) == 'object' && UpAmysqlLeftData.del.length > 0)
	{
		for (var k in UpAmysqlLeftData.del)
		{
			// 可能一行SQL删除多个库表。
			for (var KI in UpAmysqlLeftData.del[k] )
			{
				var DN = UpAmysqlLeftData.del[k][KI].DatabaseName;		// 添加的数据库名称
				var TN = UpAmysqlLeftData.del[k][KI].TableName;			// 添加的数据表名称
				DN = DN.substr(1, (DN.length-2));
				TN = TN.substr(1, (TN.length-2));

				if (DN != '' && TN == '')
				{
					// 删除数据库DOM  ********************
					var DatabaseId = 'AmysqlDatabase_' + DN;							// 数据库ID

					try{
						var DItem = AmysqlLeftWindow.AmysqlLeftList.list.Item[DatabaseId];	// 数据库DOM
						if(typeof(DItem) == 'object') DItem.parentNode.removeChild(DItem);	// 删除
					}
					catch (e){}

					// 关闭库窗口
					var AllTabDel = [];	// 待关闭的窗口(可能需要关闭多，多个不能一次for删除)
					for (var KT in AmysqlTagWindow.AmysqlTabObject.Item )
					{
						var Tag = AmysqlTagWindow.AmysqlTabObject.Item[KT];
						if((Tag.id == DatabaseId) || Tag.id.indexOf('AmysqlTable_' + DN + ' » ') != -1) 
							AllTabDel.push(Tag);
					}
					for (var KC in AllTabDel)
						AmysqlTagWindow.AmysqlTabObject.CloseTagFun(AllTabDel[KC], true);
				}
				else
				{
					// 删除数据表DOM  ********************
					DN = DN == '' ? DatabaseName : DN;									// 默认当前数据库
					var DatabaseId = 'AmysqlDatabase_' + DN;							// 数据库ID
					var TableId = 'AmysqlTable_' + DN + ' » ' + TN;						// 数据表ID

					try	{ // 尝试删除
						var DItem = AmysqlLeftWindow.AmysqlLeftList.list.Item[DatabaseId];	// 数据库DOM
						var Titem = DItem.ChildItem.Item[TableId];							// 数据表DOM
						if(typeof(Titem) == 'object') Titem.parentNode.removeChild(Titem);	// 从列表DOM中删除
						DItem.dt.em.sum = parseInt(DItem.dt.em.sum) -1;
						if(DItem.dt.em.sum != 0)
							DItem.dt.em.innerHTML = '(' + DItem.dt.em.sum + ')';
						else
						{
							// 删除到没有表了
							DItem.ChildItem = null;
						    DItem.dt.em.innerHTML = '';
							DItem.dd.className = '';
						}

						// 从列表数据中删除
						for (var KD in DItem.ChildItemData )
							if(DItem.ChildItemData[k].id == TableId) DItem.ChildItemData.splice(KD, 1);
					}
					catch (e){}

					// 关闭表窗口(一个)
					for (var KT in AmysqlTagWindow.AmysqlTabObject.Item )
					{
						var Tag = AmysqlTagWindow.AmysqlTabObject.Item[KT];
						if(Tag.id == TableId) AmysqlTagWindow.AmysqlTabObject.CloseTagFun(Tag, true);
					}
				}
			}
		}
	}

	AmysqlLeftWindow.AmysqlLeftList.CopyAutoHeight();

</script>


<?php

// 如果当前库表已删除终止当前程序
if(isset($UpAmysqlLeftData['del']) && count($UpAmysqlLeftData['del']) > 0)
{
	foreach ($UpAmysqlLeftData['del'] as $key=>$val)
	{
		foreach ($val as $k=>$v)
		{
			if (($v['TableName'] != '``' && $v['TableName'] == '`'.$TableName.'`') || ($v['TableName'] == '``' && $v['DatabaseName'] == '`'.$DatabaseName.'`')) 
				exit();
		}
	}
}
?>