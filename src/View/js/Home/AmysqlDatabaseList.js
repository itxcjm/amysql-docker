/************************************************
 *
 * Amysql AMS
 * Amysql.com 
 * @param Object 
 * AmysqlDatabaseList  
 *
 */
var TableDataObject;
var PageObject;

var SqlEdit = {};							// 编辑sql对象
var FirstLoad = true;


//*****************************************
ExtendArray.push({
	'_Events':[
		{'_Event':
			{'load':function ()
				{
					// 表格对象 
					TableDataObject = new TableData();
					TableDataObject.AddItem(TableDataArray);
					NavigationObject.add({
						'id':'N_DatabaseList', 'text':L.DatabaseList, 'defaults': true, 'content':'TableDataMainBlock', 
						'functions':function ()
						{
							if(FirstLoad)
							{
								TableDataObject.show();		// 只是显示方式(1)
								FirstLoad = false;
								return;
							}
							
							// 使用提交重载方式(2)
							if(SqlSubmitFormObject.ActiveSetIng) return;	// 为激活操作直接返回，不重复提交
							var Sql = 'SHOW DATABASES';
							SqlSubmitFormObject.SqlformoOriginal.value = SqlSubmitFormObject.sql_post.value = Sql;
							SqlEdit.setValue(Sql);
							ActiveSetID = 'N_DatabaseList';	// 激活本版块
							SqlSubmitFormObject.SqlForm.onsubmit(1);
						}
					})
				}
			},
		'_EventObj':window
		}
	],
	'_ExtendInfo':{
			'ExtendId':'DatabaseList',
			'ExtendName':L.DatabaseList,
			'ExtendAbout':L.DatabaseListAbout,
			'Version':'1.00',
			'Date':'2012-04-06',
			'WebSite':'https://amh.sh',
			'PoweredBy':'Amysql'
	}
})
// ExtendArray End *****************




// 表格数据ITEM对象
var TableDataItem = function (arr)
{
	this.arr = arr;					// 行数据的数组
	this.input = C('input');
	this.input.type = 'checkbox';
	this.textarea = new Array();	// 编辑文本框数组
	this.btr = null;				// 表格行
}
// 表格数据对象 
var TableData = function ()
{
	this.ThItem = new Array();								// 数据库名称集合
	this.Item = new Array();
	this.TableDataMainBlock = C('div', {'id':'TableDataMainBlock'});
	this.list = C('div', {'id':'DatabaseDataBlock'});		// 表格块

	this.table = null;			// 表格
	this.table_thead = null;	// 表格头部
	this.table_tbody = null;	// 表格内容
	this.table_tfoot = null;	// 表格脚部
	this.ActionTr =  C('tr');	// 操作的TR

	this.SEstatus = false;
	this.StartTr = null;
	this.EndTr = null;
	this.StartRead = 0;								// 起读点
	this.RightButtonRow = null;						// 当前右键记录
	this._IfShow = false;
	this._width = {};

	this.ListData = C('div', {'id':'ListData','className':'ListData'},{'margin':'0px'});
	// Dom
	if(TableDataObject) HomeMainObject.ContentBlock.removeChild(TableDataObject.TableDataMainBlock);	
	C(this.TableDataMainBlock, 'In', [ C('div', {'id':'ListPageOffsetTop'}), C(this.ListData, 'In', this.list) ])
	C(HomeMainObject.ContentBlock, 'In', this.TableDataMainBlock);

	
	this.AddItem = function (arr)
	{
		for (var k in arr)
			this.Item.push(new TableDataItem(arr[k]));
	}

	this.hide = function ()
	{
		this.TableDataMainBlock.style.display = 'none';
	}

	// 显示数据 ********* empty 是否清空 ***********
	this.show = function ()
	{
		this.ThItem = [];
		// 数据库名称集合
		for (var k in TableDataFieldList )
			this.ThItem[TableDataFieldList[k].name] = {};


		if(this.Item.length == 0) this.TableDataMainBlock.style.display = 'none';
		if(this._IfShow && !status) return;
		this._IfShow = true;	// 已运行
		var ItemSum = this.Item.length;			// 数据总数
		var ThItemSum = 0 ;						// 字段总数
		

		this.list.style.display = 'block';
	
		this.list.innerHTML = '';
		this.table = C('table', {'className':'table'});
		this.table.style.width = 'auto';
		this.table_thead = C('thead');
		this.table_tbody = C('tbody');
		this.table_tfoot = C('tfoot');
		
		// ***** 表格标题 ***************************************************************************************************
		this.htr = C('tr');
		if(CanEdit)
		{
			this.htr.appendChild(C('th', {'innerHTML':' DATABASES','className':'td1_1'}));
			this.htr.appendChild(C('th',{'innerHTML':L.AmysqlHome.Id},{'padding':'5px'}));
		}

		var i = CanEdit ? 2 : 0;
		for (var k in this.ThItem)
		{
			this.ThItem[k].key = i;											// 下标
			this.ThItem[k].ATag = C('span',{'innerHTML': L.AmysqlHome[k] ? L.AmysqlHome[k] : k});				// 标题文字
			this.ThItem[k].ThTag = C('th','In', this.ThItem[k].ATag );		// 标题块
			this.ThItem[k].Click = false;									// 是否已 marked
			
			
			with(this)
			{
				(function(obj)
				{
					// 一列 marked
					obj.ThTag.onclick = function ()
					{
						obj.Click = obj.Click ? false : true;
						for (Tkey in Item)
						{
							if(!Item[Tkey].btr) break;
							if(obj.Click)
							{
								Item[Tkey].btr.childNodes[obj.key].className = Item[Tkey].btr.childNodes[obj.key].className + ' marked';
							}
							else
							{
								Item[Tkey].btr.childNodes[obj.key].className = Item[Tkey].btr.childNodes[obj.key].className.replace(/marked/, '');
							}
						}
					}
					// 一列 焦点高亮
					obj.ThTag.onmouseout = function ()
					{
						for (Tkey in Item)
						{
							if(!Item[Tkey].btr) break;
							Item[Tkey].btr.childNodes[obj.key].className = Item[Tkey].btr.childNodes[obj.key].className.replace(/onmouseover/, '');
						}
					}
					obj.ThTag.onmouseover = function ()
					{
						for (Tkey in Item)
						{
							if(!Item[Tkey].btr) break;
							Item[Tkey].btr.childNodes[obj.key].className = (Item[Tkey].btr.childNodes[obj.key].className != '') ?  Item[Tkey].btr.childNodes[obj.key].className + ' onmouseover' : 'onmouseover';
						}
					}

					
				})(ThItem[k]);

			}

			this.htr.appendChild(this.ThItem[k].ThTag);
			++i;
			++ThItemSum;
		}
		this.table_thead.appendChild(this.htr);	//  加表格Th标题



		this.ActionTr = C('tr');

		// 定义操作的Tr *********************************************************************************************************
		this.ActionTr.AllSelect = C('a','In', L.SelectAll);
		with(this)
		{
			ActionTr.AllSelect.onclick = function ()
			{
				for (var i = 0; i < ItemSum; ++i)
				{
					ClickTr(Item[i].btr, false);
				}
			}
		}

		this.ActionTr.NoAllSelect = C('a','In',L.ClearAll);
		with(this)
		{
			ActionTr.NoAllSelect.onclick = function ()
			{
				for (var i = 0; i < ItemSum; ++i)
				{
					ClickTr(Item[i].btr, false, true);
				}
			}
		}

		this.ActionTr.OppositeSelect = C('a','In',L.InvertSelect);
		with(this)
		{
			ActionTr.OppositeSelect.onclick = function ()
			{
				for (var i = 0; i < ItemSum; ++i)
				{
					ClickTr(Item[i].btr, true);
				}
			}
		}
		
		this.ActionTr.ListSelect = C('a', {'innerHTML':L.Selects,'className':'ico ico_select'});
		this.ActionTr.del = C('a', {'innerHTML':L.Del,'className': 'ico ico_del','title':L.DeleteSelectedItem});

		if(CanEdit)
		{
			with(this)
			{
				// 打开选中项
				ActionTr.open = function ()
				{
					for (key in Item)
					{
						if (Item[key].input.checked)
							Item[key].Database.onclick();
					}
				}
				// 选中行删除
				ActionTr.del.onclick = function ()
				{
					var DelTable = [];
					var DelSql = [];
					for (key in Item)
					{
						if (Item[key].input.checked)
						{
							DelTable.push(SqlKeyword(Item[key].arr.Database));
							DelSql.push('DROP DATABASE `' + SqlKeyword(Item[key].arr.Database) + '`');
						}
					}
					if(DelTable.length == 0) return false;
					SqlSubmitFormObject.operation_sql_text.value = DelSql.join(";\n");
					SqlSubmitFormObject.UpOperationSqlNotice(printf(L.ConfirmdeletionDatabase, {'list':DelTable.join(' , '), 'del':'<font color="red"><b> ' + L.Del + ' </b></font>'}) , 0);
					SqlSubmitFormObject.confirm_sql.style.display = 'inline';
				}
											
			}
		}
		


		// 循环记录行 **********************************************************************************************************
		var show_del_block = 1;		// 是否显示删除修改操作的TD

		var i = this.StartRead;		// 从哪读起
		var k = 1;
		for (; ; ++k)
		{
			if(k > this.OnceShow || i >= ItemSum) 
			{
				this.StartRead += this.OnceShow;
				break;	// 一次显示this.OnceShow条记录
			}
			
			
			this.Item[i].btr = C('tr');
			this.Item[i].btr.td = [];
			this.Item[i].btr.key = i;

			if(CanEdit)
			{
				
				this.Item[i].del = C('a', {'innerHTML':L.Del,'className':'ico2 ico_del2','title':L.DeleteDatabase});
				this.Item[i].del.key = i;	// 下标
				
				this.Item[i].btr.BtrAction = C('td','In',new Array(
					C(this.Item[i].input,'checked',''),
					this.Item[i].del
				));
				this.Item[i].btr.BtrAction.align = 'center';
				this.Item[i].btr.appendChild(this.Item[i].btr.BtrAction);
				this.Item[i].btr.appendChild(C('td', 'In',  '<i>' + k + '</i>'));
			}

			var PRI_OR_UNI = new Array();	// 唯一字段
			var Where = new Array();		// Del语句

			for (var Thi in this.Item[i].arr)
			{
				var td = this.Item[i].btr.td[Thi] = C('td', {'name':Thi,'noWrap':'noWrap'});
				td.field_div = C('div', {'className' : 'field_div'});
				var _val = is_null(this.Item[i].arr[Thi]) ? '<i>NULL</i>' : ((Thi == 'Collation' && parent.AmysqlCollationsDefault[this.Item[i].arr[Thi]]) ? parent.AmysqlCollationsDefault[this.Item[i].arr[Thi]] : this.Item[i].arr[Thi]) + '';
				if(Thi == 'Rows')  _val = C((parseInt(_val) > 0 ? 'b':'i'), 'In', _val);			// 加粗记录数

				if(Thi == 'Database')  
					this.Item[i].Database = C('a', {'innerHTML':_val, 'className':'name'});			// 库名

				C(td.field_div, 'In', ((Thi != 'Database') ? _val : this.Item[i].Database));
				C(td, 'In', td.field_div);
				td.className = this.ThItem[Thi].Click ? td.className + ' marked' : td.className.replace(/marked/, '');
				this.Item[i].btr.appendChild(td);					//  加字段数据到TR 
			}
								


			// 数据行操作相关 *******************************
			if(CanEdit)
			{
				with(this)
				{
					(function (obj)
					{
						obj.input.onclick = function ()
						{
							return false;
						}
						// 删除记录操作
						obj.del.onclick = function ()
						{
							var sql = 'DROP DATABASE `' + SqlKeyword(obj.arr.Database) + '`';
							SqlSubmitFormObject.ConfirmSqlSubmit(printf(L.ConfirmdeletionDatabase, {'list':obj.arr.Database, 'del':L.Del}) + " \n\r" + sql, sql);
						}

						obj.Database.onclick = function (show)
						{
							var DatabaseNewOpen = parent.parent.window.frames.AmysqlLeft.AmysqlLeftList.list.Item['AmysqlDatabase_' + obj.arr.Database];
							DatabaseNewOpen.dl.onclick();
							DatabaseNewOpen.dt.onclick();
						}

					})(this.Item[i])
				}
			}


			this.Item[i].btr.marked = false;

			// 增加事件
			with(this)
			{
				Item[i].btr.onmouseover = function ()
				{
					this.className = (this.className != '') ?  this.className + ' onmouseover' : 'onmouseover';
				}
				Item[i].btr.onmouseout = function ()
				{
					var temp_obj = this;
					setTimeout(function ()
					{
						temp_obj.className = temp_obj.className.replace(/onmouseover/, '');
					}, 50);
				}
				Item[i].btr.onmousedown = function (event)
				{
					// 按住Shift键
					event = event? event:window.event;
					if(event.button == 2) RightButtonRow = this.key;
					if((!document.all && event.button == 1) ||event.button == 4)  return;

					if(event.shiftKey==true)
					{
						EndTr = this.key;
						var StartGo = StartTr;				// 开始的Tr KEY
						var Sum = StartTr - EndTr;			// 个数
						if(Sum > 0) var StartGo = EndTr;
						Sum = Math.abs(Sum);
						if(Sum < 1) return;
						var EndGo = Sum + StartGo +1;
						for (; StartGo < EndGo; ++StartGo)
						{
							ClickTr(Item[StartGo].btr, false);	// 选上
						}
						SEstatus = false;
						return;
					}
					else
					{
						StartTr = this.key;
						SEstatus = true;
						if(event.button == 2) 		// 右键选择
							ClickTr(this, false);	// 只能选上	
						else
							ClickTr(this, true);	// 自由切换
					}
					
				}
				Item[i].btr.onmouseup = function (event)
				{
					// 划拉选择处理
					event = event? event:window.event;
					if(event.button == 2 || (!document.all && event.button == 1) || event.button == 4) 
					{
						return;			// 禁止右键、中键划拉选择
					}
					
					
					if(!SEstatus) return;
					EndTr = this.key;
					var StartGo = StartTr+1;			// 开始的Tr KEY
					var Sum = StartTr - EndTr;			// 个数
					if(Sum > 0) var StartGo = EndTr;
					Sum = Math.abs(Sum);
					if(Sum < 1) return;
					var EndGo = Sum + StartGo;
					for (; StartGo < EndGo; ++StartGo)
					{
						ClickTr(Item[StartGo].btr, true);	// 自由切换
					}
					SEstatus = false;
				}
			}

			if(i%2) this.Item[i].btr.className = 'odd';
			this.table_tbody.appendChild(this.Item[i].btr);
			++i;
			
		} // **************************************************
		
		if(CanEdit)
		{
			this.ActionTr.td = C('td');
			if(!this.htr.del)
			{
				this.ActionTr.td = C('td','In',new Array(
				this.ActionTr.ListSelect,
				this.ActionTr.AllSelect,
				C('span','In','/'),
				this.ActionTr.NoAllSelect,
				C('span','In','/'),
				this.ActionTr.OppositeSelect,
				C('span','In',' &nbsp; &nbsp; ' + L.SelectItems + ': '),
				this.ActionTr.del
				));
			}
			this.ActionTr.td.className = 'ActionTd';
			this.ActionTr.td.colSpan = ThItemSum + 2;
			this.ActionTr.td.align = 'left';
			this.ActionTr = C(this.ActionTr,'In', this.ActionTr.td);

			this.table_tfoot.appendChild(this.ActionTr);
		}

		this.table.appendChild(this.table_thead);
		this.table.appendChild(this.table_tbody);
		this.table.appendChild(this.table_tfoot);
		this.list.appendChild(this.table);

		this.TableDataMainBlock.style.display = (ItemSum == 0) ? 'none' : 'block';
	}

	// Tr点击函数
	this.ClickTr = function (Tr, status, ParentStatus)
	{
		try{
			if ( ParentStatus || (Tr.marked && status) )
			{
				// 不选上
				Tr.className = Tr.className.replace(/marked/, '');
				this.Item[Tr.key].input.checked = false;
				Tr.marked = false;
			}
			else
			{
				// 选上
				Tr.className = Tr.className.replace(/marked/, '') + ' marked';
				this.Item[Tr.key].input.checked = true;
				Tr.marked = true;
			}
		}catch(e){
			return;
		}
	}

	// 右键菜单
	this.Menu = function ()
	{
		(function (o)
		{
			AmysqlMenuObject.add(
			{
				'MenuId':'AmysqlDatabaseTableDataMenu', 'AreaDomID':'DatabaseDataBlock',
				'MenuList':[
					
					{'id':'DLdel', 'name':L.Del, 'KeyCodeTag':'D', 'ico':'ico_del2', 'functions':function (){
						o.Item[o.RightButtonRow].del.onclick();
					}},			
					{'id':'DLDelAll', 'name':L.DeleteSelectedItems, 'functions':function (){
						o.ActionTr.del.onclick();
					}},	
					{'className': 'separator'},
					{'id':'DLopen', 'name':L.OpenSelectedItem, 'KeyCodeTag':'T', 'ico':'ico_open2', 'functions':function (){
						o.ActionTr.open();
					}},
					{'id':'DLCancelSelect', 'name':L.UncheckItem, 'functions':function (){
						o.ActionTr.NoAllSelect.onclick();
					}},
					{'className': 'separator'},
					{'id':'DLrenovate', 'name':L.ReloadPageData, 'KeyCodeTag':'R', 'ico':'ico_renovate2', 'functions':function (){
						SqlSubmitFormObject.sql_post.value = SqlSubmitFormObject.SqlformoOriginal.value;
						G("SqlForm").onsubmit(parseInt(G("SqlformPage").value)) 
					}},
				],
				'initial': function ()	// 菜单初始化函数
				{
					
					var EditSum = 0;					// 是否有编辑项
					for (var k in o.Item ) 
					{ 
						if(o.Item[k].btr.td.EditStatus) 
						{
							EditSum = 1;
							break;
						}
					}
					var ActionSet = o.RightButtonRow != null ? true : false;		// 是否能操作
					this.get('DLopen').className = ActionSet ? 'item' : 'item2'; 
					this.get('DLdel').className = ActionSet ? 'item' : 'item2'; 
					this.get('DLDelAll').className = ActionSet ? 'item' : 'item2'; 

				},
				'close':function ()
				{
					o.RightButtonRow = null;		// 表格数据右击菜单标识清空
				}
			});
		})
		(this);
	}

	this.Menu2 = function ()
	{
		(function (o)
		{
			AmysqlMenuObject.add(
			{
				'MenuId':'AmysqlDatabaseTableDataMenu2', 'AreaDomID':'DatabaseDataBlock',
				'MenuList':[
					{'id':'DLrenovate', 'name':L.ReloadPageData, 'KeyCodeTag':'R', 'ico':'ico_renovate2', 'functions':function (){
						SqlSubmitFormObject.sql_post.value = SqlSubmitFormObject.SqlformoOriginal.value;
						G("SqlForm").onsubmit(parseInt(G("SqlformPage").value)) 
					}},
				]
			});
		})
		(this);
	}

	if(CanEdit) 
		this.Menu();
	else
		this.Menu2();
	
}
