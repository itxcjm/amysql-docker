/************************************************
 *
 * Amysql AMS
 * Amysql.com 
 * @param Object 
 * AmysqlTableList  
 *
 */
var TableDataObject;
var PageObject;

var SqlEdit = {};							// 编辑sql对象



//*****************************************
ExtendArray.push({
	'_Events':[
		{'_Event':
			{'load':function ()
				{
					// 表数据 
					TableDataObject = new TableData();
					TableDataObject.AddItem(TableDataArray);
					NavigationObject.add({
						'id':'N_TableList', 'text':L.TableList, 'defaults': true, 'content':'TableDataMainBlock', 
						'functions':function ()
						{
							TableDataObject.show();
						}
					})
				}
			},
		'_EventObj':window
		}
	],
	'_ExtendInfo':{
			'ExtendId':'TableList',
			'ExtendName':L.TableList,
			'ExtendAbout':L.TableListAbout,
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
	this.ThItem = new Array();								// 数据表名称集合
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
	if(TableDataObject) DatabaseMainObject.ContentBlock.removeChild(TableDataObject.TableDataMainBlock);	
	C(this.TableDataMainBlock, 'In', [ C('div', {'id':'ListPageOffsetTop'}), C(this.ListData, 'In', this.list) ])
	C(DatabaseMainObject.ContentBlock, 'In', this.TableDataMainBlock);

	
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
		// 数据表名称集合
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
			this.htr.appendChild(C('th', {'innerHTML':' DatabaseTableActionHidden','className':'td1_1'}));
			this.htr.appendChild(C('th',{'innerHTML':L.AmysqlHome.Id},{'padding':'5px'}));
		}

		var i = CanEdit ? 2 : 0;
		for (var k in this.ThItem)
		{
			this.ThItem[k].key = i;													// 下标

			this.ThItem[k].ATag = C('span',{'innerHTML': L.AmysqlTable[k] ? L.AmysqlTable[k] : k});	// 标题文字
			this.ThItem[k].ThTag = C('th','In', this.ThItem[k].ATag );				// 标题块
			this.ThItem[k].Click = false;											// 是否已 marked
			
			
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
		this.ActionTr.AllSelect = C('a','In',L.SelectAll);
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
		this.ActionTr.edit = C('a', {'innerHTML':L.Edit,'className': 'ico ico_edit','title':L.EditSelect});
		this.ActionTr.del = C('a', {'innerHTML':L.Del,'className': 'ico ico_del','title':L.DeleteSelectedItem});
		this.ActionTr.save = C('a', {'innerHTML':L.Save,'className': 'ico ico_save','title':L.SaveSelect});

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
							Item[key].Name.onclick();
					}
				}
				// 选中行删除
				ActionTr.del.onclick = function ()
				{
					var DelTable = [];
					var DelTableSql = [];
					for (key in Item)
					{
						var TableName = SqlKeyword(Item[key].arr.Name);
						if (Item[key].input.checked)
						{
							if(is_null(Item[key].arr.Engine) && is_null(Item[key].arr.Rows))
							{
								DelTableSql.push('DROP VIEW `' + TableName + '`');
								DelTable.push(TableName + '(' + L.View + ')');
							}
							else 
							{
								DelTableSql.push('DROP TABLE `' + TableName + '`');
								DelTable.push(TableName);
							}
						}
					}
					if(DelTable.length == 0) return false;
					SqlSubmitFormObject.operation_sql_text.value = DelTableSql.join(";\n");
					SqlSubmitFormObject.UpOperationSqlNotice(printf(L.ConfirmDelTable, {'list':DelTable.join(' , '), 'del':L.Del2}), 0);
					SqlSubmitFormObject.confirm_sql.style.display = 'inline';
				}
				// 选中行编辑
				ActionTr.edit.onclick = function (type)
				{
					type = typeof(type) == 'string' ? type : 'edit';
					for (var key in Item )
					{
						if(Item[key].input.checked || type == 'CancelEdit')	// 取消编辑的情况全部通过
						{
							try{
							Item[key].edit.onclick(type);
							}catch(e){return;}
						}
					}
				}
				// 保存编辑项
				ActionTr.save.onclick = function ()
				{
					var AllSql = [];
					for (var k in Item)
					{
						if (Item[k].btr.td.EditStatus)	// 编辑项
						{
							var SqlStr = [];
							for (var TK in Item[k].textarea )
							{
								var ThisObj = Item[k].textarea[TK];
								switch (TK)
								{
									case 'Name':
										if(ThisObj.value != Item[k].arr.Name)
										{	
											var ObjValue = ThisObj.value.replace(/`/g, '``');
											AllSql.push('RENAME TABLE `' + DatabaseName + '`.`' + Item[k].arr.Name.replace(/`/g, '``') + '` TO `' + DatabaseName + '`.`' + ObjValue + '`');
											Item[k].arr.Name = ObjValue;
										}
									break;
									case 'Auto_increment':
										if(ThisObj.type == 'text' && ThisObj.value != Item[k].arr.Auto_increment)
											SqlStr.push('AUTO_INCREMENT = ' + ThisObj.value);
									break;
									case 'Engine':
										if(ThisObj.value != Item[k].arr.Engine)
											SqlStr.push('ENGINE = ' + ThisObj.value);
									break;
									case 'Collation':
										if(ThisObj.value != '' && ThisObj.value != Item[k].arr.Collation)
											SqlStr.push('DEFAULT CHARACTER SET ' + ThisObj.options[ThisObj.selectedIndex].parentNode.getAttribute('label') +  ' COLLATE ' + ThisObj.value);
									break;
									case 'Comment':
										var ObjValue = ThisObj.value.replace(/\'/g, "''");
										if(ThisObj.value != Item[k].arr.Comment)
											SqlStr.push("COMMENT = '" + ObjValue + "'");
									break;
									case 'Row_format':
										if(ThisObj.value.toLowerCase() != Item[k].arr.Row_format.toLowerCase())
											SqlStr.push('ROW_FORMAT = ' + ThisObj.value);
									break;
									case 'Checksum':
										if(ThisObj.checked && Item[k].arr.Checksum == null)
											SqlStr.push('CHECKSUM = 1');
										else if (!ThisObj.checked && Item[k].arr.Checksum != null)
											SqlStr.push('CHECKSUM = 0');
									break;
									case 'PACK_KEYS':
										if(ThisObj.value != Item[k].arr.PACK_KEYS)
											SqlStr.push('PACK_KEYS = ' + ThisObj.value);
									break;
									case 'DELAY_KEY_WRITE':
										if(ThisObj.checked && Item[k].arr.Create_options.indexOf('delay_key_write') == -1)
											SqlStr.push('DELAY_KEY_WRITE = 1');
										else if (!ThisObj.checked && Item[k].arr.Create_options.indexOf('delay_key_write') != -1)
											SqlStr.push('DELAY_KEY_WRITE = 0');
									break;
								}
							}
							if (SqlStr.length > 0)
								AllSql.push('ALTER TABLE `' + DatabaseName + '`.`' + Item[k].arr.Name + '` ' + SqlStr.join(' '));
						}
					}
					if (AllSql.length > 0)
						SqlSubmitFormObject.ConfirmSqlSubmit(null, AllSql.join("; \n"));
					else
						alert(L.SaveTableNotSave);
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
				this.Item[i].browse = C('a', {'innerHTML':L.Browse_,'className':'ico2 ico_browse2','title':L.BrowseTable});
				this.Item[i].structure = C('a', {'innerHTML':L.Structure,'className':'ico2 ico_structure2','title':L.BrowseTableStructure});
				this.Item[i].search = C('a', {'innerHTML':L.Search,'className':'ico2 ico_search2','title':L.SearchTable});
				this.Item[i].insert = C('a', {'innerHTML':L.Add,'className':'ico2 ico_insert2','title':L.AddTableData});
				this.Item[i].edit = C('a', {'innerHTML':L.Edit,'className':'ico2 ico_edit2','title':L.EditTableStructure});
				this.Item[i].del = C('a', {'innerHTML':L.Del,'className':'ico2 ico_del2','title':L.DelTableData});
				this.Item[i].del.key = i;	// 下标
				
				this.Item[i].btr.BtrAction = C('td','In',new Array(
					C(this.Item[i].input,'checked',''),
					this.Item[i].browse,
					this.Item[i].structure,
					this.Item[i].search,
					this.Item[i].insert,
					this.Item[i].edit,
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

				var _val = is_null(this.Item[i].arr[Thi]) ? '<i>NULL</i>' : this.Item[i].arr[Thi] + '';
				if(Thi == 'Rows')  _val = C((parseInt(_val) > 0 ? 'b':'i'), 'In', _val);			// 加粗记录数

				if(Thi == 'Name')  
					this.Item[i].Name = C('a', {'innerHTML':_val, 'className':'name'});	// 表名
				

				C(td.field_div, 'In', ((Thi != 'Name') ? _val : this.Item[i].Name));
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
						obj.edit.onclick = function (type)
						{
							// 'Checksum','PACK_KEYS', 'DELAY_KEY_WRITE' 这三个属性MyISAM表才拥有
							var EditItem = ['Name','Auto_increment', 'Engine', 'Collation', 'Comment', 'Row_format','Checksum','PACK_KEYS','DELAY_KEY_WRITE'];	// 可编辑项
							var status = (obj.btr.td.EditStatus) ? true : false;	// 是否为编辑
							if(!_width.Name) _width.Name = obj.btr.td['Name'].field_div.scrollWidth;
							if(!_width.Comment) _width.Comment = obj.btr.td['Comment'].field_div.scrollWidth;
							if(!_width.Auto_increment) _width.Auto_increment = obj.btr.td['Auto_increment'].field_div.scrollWidth;

							for (var k in EditItem )
							{
								var TK = EditItem[k];
								if (!status && type != 'CancelEdit')
								{
									switch(TK)
									{
										case 'Name':
											obj.textarea[TK] = C('input',{'type':'text','value':obj.arr.Name}, {'width':_width.Name+'px','fontSize':'14px'});
										break;
										case 'Auto_increment':
											if (obj.arr.Auto_increment == null)
												obj.textarea[TK] = C('span', 'In', [C('i','In','NULL:'),C('input',{'type':'radio','checked':true,'defaultChecked':true})]);
											else
												obj.textarea[TK] = C('input',{'type':'text','value':obj.arr.Auto_increment},  {'width':_width.Auto_increment+'px'});
										break;
										case 'Engine':
											obj.textarea[TK] = CreatesSelect(StorageEngines, obj.arr.Engine);
										break;
										case 'Collation':
											obj.textarea[TK] = C(CreatesSelect(Collations, obj.arr.Collation), '', {'width':'170px'});
										break;
										case 'Comment':
											obj.textarea[TK] = C('input',{'type':'text','value':obj.arr.Comment},  {'width':_width.Comment+'px'});
										break;
										case 'Row_format':
											var RowFormat = null;
											if(obj.arr.Engine == 'InnoDB') RowFormat = RowFormatInnoDB;
											if(obj.arr.Engine == 'MyISAM') RowFormat = RowFormatMyISAM;
											if(RowFormat)
												obj.textarea[TK] = CreatesSelect(RowFormat, obj.arr.Row_format);
										break;
										case 'Checksum':
											if(obj.arr.Engine == 'MyISAM')
											{
												var _checked = ((obj.arr.Checksum != null)? true:false);
												obj.textarea[TK] = C('input',{'type':'checkbox','checked':_checked, 'defaultChecked':_checked});
											}
										break;
										case 'PACK_KEYS':
											if(obj.arr.Engine == 'MyISAM')
												obj.textarea[TK] = CreatesSelect(PackKeys, obj.arr.PACK_KEYS);
										break;
										case 'DELAY_KEY_WRITE':
											if(obj.arr.Engine == 'MyISAM')
											{
												var _checked = ((obj.arr.Create_options.indexOf('delay_key_write') != -1 )? true:false);
												obj.textarea[TK] = C('input',{'type':'checkbox','checked':_checked,'defaultChecked':_checked});
											}
										break;

									}
									obj.btr.td.EditStatus = true;
									if(obj.textarea[TK])
									{
										obj.btr.td[TK].field_div.style.display = 'none';
										C(obj.btr.td[TK], 'In', obj.textarea[TK]);

										obj.textarea[TK].onkeydown = function (event)	// 避免输入文本框右击菜单的快捷键字母
										{
											event = event? event:window.event;
											if((event.keyCode == 69  || event.keyCode == 83 || event.keyCode == 68  || event.keyCode == 67 || event.keyCode == 82 || event.keyCode == 84 ) && RightButtonRow != null)
											return false;
										}
									}
								}
								else if(type != 'edit' && obj.textarea[TK]) 
								{
									obj.btr.td.EditStatus = false;
									obj.btr.td[TK].field_div.style.display = 'block';
									obj.textarea[TK].parentNode.removeChild(obj.textarea[TK]);
									obj.textarea[TK] = null;
								}
							}
						}

						// 删除记录操作
						obj.del.onclick = function ()
						{
							var TempStr = ['TABLE', ''];
							if(is_null(obj.arr.Engine) && is_null(obj.arr.Rows))
								TempStr = ['VIEW', '(' + L.View + ')'];

							var sql = 'DROP ' + TempStr[0] + ' `' + SqlKeyword(obj.arr.Name) + '`';
							SqlSubmitFormObject.ConfirmSqlSubmit(printf(L.ConfirmDelTable, {'list': TempStr[1] + ': `' + obj.arr.Name, 'del':L.Del2}) + "` \n\r" + sql, sql);
						}

						obj.Name.onclick = function (show)
						{
							if(typeof(show) == 'string') 
							{
								var exp = new Date();
								exp.setTime(exp.getTime()*1.1);
								Cookies.set('DefaultActive', show , exp, '/');
							}
							var DatabaseNewOpen = parent.parent.window.frames.AmysqlLeft.AmysqlLeftList.list.Item['AmysqlDatabase_' + DatabaseName];
							var TableId =  'AmysqlTable_' + DatabaseName + ' » ' + obj.arr.Name;
							DatabaseNewOpen.ChildItem.Item[TableId].dl.onclick();
							DatabaseNewOpen.ChildItem.Item[TableId].dt.onclick();
						}

						obj.browse.onclick = function ()
						{
							obj.Name.onclick('TableData');
						}
						obj.structure.onclick = function ()
						{
							obj.Name.onclick('TableStructure');
						}
						obj.search.onclick = function ()
						{
							obj.Name.onclick('TableSearch');
						}
						obj.insert.onclick = function ()
						{
							obj.Name.onclick('TableInsert');
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
				this.ActionTr.edit,
				this.ActionTr.del,
				this.ActionTr.save
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
					{'id':'TLedit', 'name':L.Edit, 'KeyCodeTag':'E', 'ico':'ico_edit2', 'functions':function (){
						o.Item[o.RightButtonRow].edit.onclick('edit');
					}},
					{'id':'TLEditAll', 'name':L.EditSelects, 'functions':function (){
						o.ActionTr.edit.onclick('edit');
					}},
					{'className':'separator'},
					{'id':'TLsaves', 'name':L.Save, 'KeyCodeTag':'S', 'ico':'ico_save2', 'functions':function (){
						o.ActionTr.save.onclick();
					}},
					{'className':'separator'},
					{'id':'TLdel', 'name':L.Del, 'KeyCodeTag':'D', 'ico':'ico_del2', 'functions':function (){
						o.Item[o.RightButtonRow].del.onclick();
					}},			
					{'id':'TLDelAll', 'name':L.DeleteSelectedItems, 'functions':function (){
						o.ActionTr.del.onclick();
					}},	
					{'className': 'separator'},
					{'id':'TLopen', 'name':L.OpenSelectedItem, 'KeyCodeTag':'T', 'ico':'ico_open2', 'functions':function (){
						o.ActionTr.open();
					}},
					{'className': 'separator'},
					{'id':'TLCancelEdit', 'name':L.CanceledEdit, 'KeyCodeTag':'C', 'functions':function (){
						o.ActionTr.edit.onclick('CancelEdit');
					}},
					{'id':'TLCancelSelect', 'name':L.UncheckItem, 'functions':function (){
						o.ActionTr.NoAllSelect.onclick();
					}},
					{'className': 'separator'},
					{'id':'TLrenovate', 'name':L.ReloadPageData, 'KeyCodeTag':'R', 'ico':'ico_renovate2', 'functions':function (){
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
					this.get('TLopen').className = ActionSet ? 'item' : 'item2'; 
					this.get('TLCancelEdit').className = EditSum ? 'item' : 'item2';
					this.get('TLsaves').className = EditSum ? 'item' : 'item2'; 
					this.get('TLedit').className = ActionSet ? 'item' : 'item2'; 
					this.get('TLEditAll').className = ActionSet ? 'item' : 'item2'; 
					this.get('TLdel').className = ActionSet ? 'item' : 'item2'; 
					this.get('TLDelAll').className = ActionSet ? 'item' : 'item2'; 

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
