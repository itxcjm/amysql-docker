/************************************************
 *
 * Amysql AMS
 * Amysql.com 
 * @param Object 
 * AmysqlTableStructure
 *
 */
var TableObject;			

//*****************************************

ExtendArray.push({
	'_Events':[
		{'_Event':
			{'load':function ()
				{
					// 表结构
					TableObject = new Table();
					TableObject.AddField(TableFieldList);
					TableObject.IndexItem = TableIndexItem;
					NavigationObject.add({
						'id':'N_structure', 'text':L.Structure, 'defaults': DefaultActive.TableStructure ? true:false, 'content':'TableBlock', 
						'functions':function ()
						{
							TableObject.show();
						}
					});
					// End **
				}
			},
		'_EventObj':window
		}
	],
	'_ExtendInfo':{
			'ExtendId':'TableStructure',
			'ExtendName':L.TableStructure,
			'ExtendAbout':L.TableStructureAbout,
			'Version':'1.00',
			'Date':'2012-04-06',
			'WebSite':'https://amh.sh',
			'PoweredBy':'Amysql'
	}
})
// ExtendArray End *****************


// 字段结构对象 
var TableItem = function (data)
{
	if(typeof(data) != 'object') return false;
	this.Field = data.COLUMN_NAME;			// 字段名称
	this.Type =  data.DATA_TYPE;			// 字段类型
	this.Null =  data.IS_NULLABLE;			// 是否为空
	this.Key =  data.COLUMN_KEY;			// 主键&唯一
	this.Default =  data.COLUMN_DEFAULT;	// 默认值
	this.Extra =  data.EXTRA;				// 额外
	this.Length =  data.Length;				// 长度
	this.CharacterSet =  data.COLLATION_NAME;
	this.Comment =  data.COLUMN_COMMENT;
	this.COLUMN_PROPERTY =  data.COLUMN_PROPERTY;

	this.input = C('input');
	this.input.type = 'checkbox';
	this.btr = null;
	return this;
}

// 表格结构对象
var Table = function ()
{
	this.TempItem = new Array();						// 临时数据行
	this.Item = new Array();							// 表数据行
	this.list = C('div', {'id':'TableBlock'});			// 表格块
	this.RightButtonRow = null;							// 当前右键记录
	this.IndexRightButtonRow = null;					// 索引右键记录
	this.AddLineTag = false;							// 添加新字段状态标识

	this.IndexData = null;
	this.IndexItem = new Array();	// 索引数据行

	this.StartTr = null;			// 开始的Tr
	this.EndTr = null;				// 结束的Tr
	this.SEstatus = false;
	this._IfShow = false;

	if(TableObject) TableMainObject.ContentBlock.removeChild(TableObject.list);	
	C(TableMainObject.ContentBlock, 'In', this.list);

	// 添加字段
	this.AddField = function (arr)
	{
		for (var k in arr)
			this.Item.push(new TableItem(arr[k]));
	}

	this.hide = function ()
	{
		this.list.style.display = 'none';
	}
	this.show = function ()
	{
		if(this._IfShow) return;
		this._IfShow = true;	// 已运行
		this.list.style.display = 'block';
		this.list.innerHTML = '';
		this.table = C('table',{'className':'table', 'id':'TableBlockStructure'});	// 表格
		this.table_thead = C('thead');			// 表格头部
		this.table_tbody = C('tbody');			// 表格内容
		this.table_tfoot = C('tfoot');
		this.ActionTr =  C('tr');				// 操作的TR
		this.width_arr = new Array();			// 记录宽度
		this.AddLint_field = new Array();		// 添加新字段　字段集合

		var th = new Array(C('th'),C('th',{'innerHTML':L.AmysqlHome.Id},{'padding':'5px'}), C('th','In',L.Field), C('th','In',L.Type),C('th','In',L.Collations),C('th','In',L.AllowNull),C(C('th','In',L.DefaultVal)),C('th','In',L.AUTO_INCREMENT),C('th','In',L.Attribute),C('th','In',L.Comment),C('th','In', L.Operations + ' && ' + L.Index) );
		if(!CanEditStructure) th.splice(th.length-1, 1);
		var htr = C('tr', 'In', th);
		this.table_thead.appendChild(htr);

		var ItemSum = this.Item.length;

		for (var i = 0; i < ItemSum; ++i)
		{
			var btr_input = C('td');
			btr_input.align = 'center';
			btr_input.className = 'td1';
			this.Item[i].input.checked = false;
			btr_input.appendChild(this.Item[i].input);

			this.Item[i].edit = C('a',{'innerHTML':L.Edit,'className':'ico2 ico_edit2','title':L.Edit});
			this.Item[i].del = C('a',{'innerHTML':L.Del,'className':'ico2 ico_del2','title':L.Del});
			this.Item[i].PrimeKey = C('a',{'innerHTML':L.PrimeKey,'className':'ico2 ico_PrimeKey2','title':L.PrimeKey});
			this.Item[i].only = C('a',{'innerHTML':L.Only,'className':'ico2 ico_only2','title':L.Only});
			this.Item[i].index = C('a',{'innerHTML':L.Index,'className':'ico2 ico_index2','title':L.Index});
			this.Item[i].key = i;

			this.Item[i].edit.data = new Array();	// 编辑保存的数据
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
						var status = (obj.edit.data.length == 0) ? true : false;	// 是否为编辑
						for (key in obj.btr.getElementsByTagName('div'))
						{
							if(typeof(obj.btr.getElementsByTagName('div')[key]) == 'object')
							{
								if (status && type != 'CancelEdit')
								{
									obj.edit.data[key] = C('input');
									switch (key)
									{
										case '0':	// 字段名
											obj.edit.data[key].value = obj.Field;
											break;
										case '6':	// 属性
											obj.edit.data[key] = C(CreatesSelect(TextOperators, obj.COLUMN_PROPERTY), '', {'width':'170px'});
											break;
										case '7':	// 注释
											obj.edit.data[key] = C('textarea');
											obj.edit.data[key].value = obj.Comment;
											obj.edit.data[key].style.height = '17px';
											break;
										case '1':	// 类型
											obj.edit.data[key] = C('span');
											obj.edit.data[key].ColumnTypes = C(CreatesSelect(ColumnTypes, obj.Type), '', {'width':'180px'});
											obj.edit.data[key].ColumnLength = C('input', '', {'width':'50px'});
											obj.edit.data[key].ColumnLength.value = obj.Length;
											obj.edit.data[key] = C(obj.edit.data[key], 'In', new Array(obj.edit.data[key].ColumnTypes, C('i', 'In', ' - '),obj.edit.data[key].ColumnLength));
											obj.edit.data[key].ColumnTypes.onchange = function ()
											{
												c = this.options[this.selectedIndex].parentNode.getAttribute('label') // 大分类
												if(c == 'NUMERIC' || this.value == 'INT' ||  c == 'DATE and TIME'  || this.value == 'DATE')
												{
													obj.edit.data[2].value = '';
													obj.edit.data[2].disabled = true;
												}
												else
												    obj.edit.data[2].disabled = false;

												if(c == 'DATE and TIME' || this.value == 'DATE')
												{
													obj.edit.data[1].ColumnLength.value = '';
													obj.edit.data[1].ColumnLength.disabled = true;
												}
												else
													obj.edit.data[1].ColumnLength.disabled = false;
											}
											break;
										case '2':	// 字符集
											obj.edit.data[key] = C(CreatesSelect(Collations, obj.CharacterSet), '', {'width':'170px'});
											if(ColumnTypes[5].toString().indexOf(obj.Type.toUpperCase()) != -1 )  // 时间类型
											{	
												obj.edit.data[key].disabled = true;
												obj.edit.data[1].ColumnLength.disabled = true;
											}
											if(ColumnTypes[4].toString().indexOf(obj.Type.toUpperCase()) != -1 )  // 数字类型
												obj.edit.data[key].disabled = true;
											break;
										case '3':	// 允许NULL
											obj.edit.data[key].type = 'checkbox';
											obj.edit.data[key].onclick = function ()
											{
												if(!this.checked) obj.edit.data[4].NullInput.checked = false;
											}
											break;
										case '4':	// 默认值
											obj.edit.data[key] = C('span');
											obj.edit.data[key].NullInput = C('input', {'type':'checkbox'});
											obj.edit.data[key].NullInput.onclick = function ()
											{
												if(this.checked) 
												{
													obj.edit.data[3].checked = true;
													obj.edit.data[4].ValueInput.value = '';
												}
											}
											obj.edit.data[key].ValueInput = C('input');
											obj.edit.data[key].ValueInput.onkeyup = function ()
											{
												if(this.value != '') obj.edit.data[4].NullInput.checked = false;
											}
											obj.edit.data[key] = C(obj.edit.data[key], 'In', new Array(C('i', 'In', 'NULL:'), obj.edit.data[key].NullInput, obj.edit.data[key].ValueInput));
											break;
										case '5':	// AUTO INCREMENT
											obj.edit.data[key].type = 'checkbox';
											break;
									}
									width_arr[key] = (typeof(width_arr[key]) != 'undefined') ? width_arr[key] : obj.btr.getElementsByTagName('div')[key].scrollWidth - 10;	// 记录input宽度
									
									// 设置input 宽度
									if(key == '4') 
										obj.edit.data[key].ValueInput.style.width = width_arr[key] + 'px';
									else if(key != '1' && key != '2' && key != '6')
										obj.edit.data[key].style.width =  width_arr[key] + 'px';
									
									obj.btr.getElementsByTagName('div')[key].style.display = 'none';
									obj.edit.data[key].className = 'edit_input';
									obj.btr.getElementsByTagName('div')[key].parentNode.appendChild(obj.edit.data[key]);

									// 勾选复选框
									if((key == '5' && obj.Extra == 'auto_increment') || (key == '3' && obj.Null == 'YES'))
										obj.edit.data[key].checked = true;
									if(key == '4')
									{
										if(is_null(obj.Default) &&  obj.Null == 'YES')
											obj.edit.data[key].NullInput.checked = true;
										else
											obj.edit.data[key].ValueInput.value = obj.Default;
									}

									// 避免输入文本框右击菜单的快捷键字母
									obj.edit.data[key].onkeydown = function (event)	
									{
										event = event? event:window.event;
										
										if((event.keyCode == 69  || event.keyCode == 83 || event.keyCode == 68  || event.keyCode == 67 || event.keyCode == 82 ) && RightButtonRow != null)
										{
											this.blur();
											return false;
										}
									}
									if(key == '1') obj.edit.data[key].ColumnTypes.onkeydown = obj.edit.data[key].onkeydown;
											
								}
								else if(!status && type != 'edit') 
								{
									obj.btr.getElementsByTagName('div')[key].style.display = 'block';
									obj.btr.getElementsByTagName('div')[key].parentNode.removeChild(obj.edit.data[key]);
								}
							}
						}
						if(!status && type != 'edit') obj.edit.data = new Array();
					}
					obj.del.onclick = function ()
					{
						var sql = 'ALTER TABLE `' + TableName + '` DROP `' + Item[obj.key].Field.replace(/`/g, '``') + '`';
						SqlSubmitFormObject.ConfirmSqlSubmit(printf(L.ConfirmDelField, {'field':Item[obj.key].Field}) + " \n\r" + sql, sql);
					}
					obj.PrimeKey.onclick = function ()
					{
						var sql = 'ALTER TABLE `' + TableName + '` ADD PRIMARY KEY(`' + Item[obj.key].Field.replace(/`/g, '``') + '`)';
						SqlSubmitFormObject.ConfirmSqlSubmit(printf(L.FieldSetPrimeKey, {'field':Item[obj.key].Field}) + " \n\r" + sql, sql);
					}
					obj.only.onclick = function ()
					{
						var sql = 'ALTER TABLE `' + TableName + '` ADD UNIQUE (`' + Item[obj.key].Field.replace(/`/g, '``') + '`)';
						SqlSubmitFormObject.ConfirmSqlSubmit(printf(L.FieldSetOnly, {'field':Item[obj.key].Field}) + " \n\r" + sql, sql);
					}
					obj.index.onclick = function ()
					{
						var sql = 'ALTER TABLE `' + TableName + '` ADD INDEX  (`' + Item[obj.key].Field.replace(/`/g, '``') + '`)';
						SqlSubmitFormObject.ConfirmSqlSubmit(printf(L.FieldSetIndex, {'field':Item[obj.key].Field}) + " \n\r" + sql, sql);
					}
				}
				)(Item[i])
			} // ************************** 添加事件结束 **************************

			this.AddLint_field.push(this.Item[i].Field + '|' + i);
			var field_style = C('b','In', this.Item[i].Field);	// 字段名称
			if(this.Item[i].Key == 'UNI' || this.Item[i].Key == 'MUL' || this.Item[i].Key == 'PRI') 
			{
				field_style = C(C('span', 'In', field_style) , {'className':this.Item[i].Key});	// 加下划线
				C(field_style, {'title':this.Item[i].Key});	// 加Title
			}

			var Default =  (is_null(this.Item[i].Default) &&  this.Item[i].Null == 'YES') ? '<i>NULL</i>' : this.Item[i].Default;
			var Length = (this.Item[i].Length != '') ? ' (' + this.Item[i].Length + ')' : '';
			var data_br = new Array(
				btr_input,
				C('td', 'In', (i+1)),
				C('td', 'In', C(C('div', {'className':'field_div'}), 'In', field_style)),
				C('td', 'In', C('div', {'className':'field_div','innerHTML' : this.Item[i].Type + Length})),
				C('td', 'In', C('div', {'className':'field_div','innerHTML' : (is_null(this.Item[i].CharacterSet) ? '<i>NULL</i>' : this.Item[i].CharacterSet)})),
				C('td', 'In', C('div', {'className':'field_div','innerHTML' : this.Item[i].Null})),
				C('td', 'In', C('div', {'className':'field_div','innerHTML' : Default})),
				C('td', 'In', C('div', {'className':'field_div','innerHTML' : this.Item[i].Extra})),
				C('td', 'In', C('div', {'className':'field_div','innerHTML' : this.Item[i].COLUMN_PROPERTY})),
				C('td', 'In', C('div', {'className':'field_div','innerHTML' : this.Item[i].Comment})),
				C('td', 'In', new Array(this.Item[i].edit, this.Item[i].del, this.Item[i].PrimeKey, this.Item[i].only, this.Item[i].index))
			);
			if(!CanEditStructure) data_br.splice(data_br.length-1, 1);
			this.Item[i].btr = C('tr','In', data_br);
			
			this.Item[i].btr.key = i;			
			this.Item[i].btr.marked = false;

			// btr ******** 增加事件 *****************
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
					if(event.button == 2 || (!document.all && event.button == 1) || event.button == 4) 
					{
						AddLineTag = false;
						if(event.button == 2) RightButtonRow = this.key;
					}
					if((!document.all && event.button == 1) ||event.button == 4)  return;

					if(event.shiftKey==true && StartTr != null)
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
							ClickTr(Item[StartGo].btr, false);
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
						ClickTr(Item[StartGo].btr, true);
					}
					SEstatus = false;
				}
			}
		
			if(i%2) this.Item[i].btr.className = 'odd';
			this.table_tbody.appendChild(this.Item[i].btr);

		}
		
		// 操作的Tr ****************************************
		with(this)
		{
			ActionTr.AllSelect = C('a','In',L.SelectAll);
			ActionTr.AllSelect.onclick = function ()
			{
				for (var i = 0; i < ItemSum; ++i)
				{
					ClickTr(Item[i].btr, false);
				}
			}

			ActionTr.NoAllSelect = C('a','In',L.ClearAll);
			ActionTr.NoAllSelect.onclick = function ()
			{
				for (var i = 0; i < ItemSum; ++i)
				{
					ClickTr(Item[i].btr, false, true);
				}
			}

			ActionTr.OppositeSelect = C('a','In',L.InvertSelect);
			ActionTr.OppositeSelect.onclick = function ()
			{
				for (var i = 0; i < ItemSum; ++i)
				{
					ClickTr(Item[i].btr, true);
				}
			}

			// 保存结构
			ActionTr.SaveEdit = function ()
			{
				alter_table = new Array();
				alter_table_add = new Array();
				alter_table_add_sql = '';
				for (var i = 0; i < ItemSum; ++i)
				{
					if(typeof(Item[i].edit.data[0]) == 'object')
					{
						var ColumnLength_SQL = (Item[i].edit.data[1].ColumnLength.value == '') ? '' : "( " + Item[i].edit.data[1].ColumnLength.value + " ) ";
						var COLLATE_SQL = (Item[i].edit.data[2].value != '' ) ? ' CHARACTER SET ' + Item[i].edit.data[2].options[Item[i].edit.data[2].selectedIndex].parentNode.getAttribute('label') +  ' COLLATE ' + Item[i].edit.data[2].value : '';
						var PROPERTY_SQL = (Item[i].edit.data[6].value != '') ?  ' '+ Item[i].edit.data[6].value : '';
						var NULL_SQL = (Item[i].edit.data[3].checked) ? ' NULL ' : ' NOT NULL ';
						var DEFAULT_STR = (Item[i].edit.data[1].ColumnTypes.value == 'TIMESTAMP' && Item[i].edit.data[4].ValueInput.value == 'CURRENT_TIMESTAMP') ?  Item[i].edit.data[4].ValueInput.value : "'" + Item[i].edit.data[4].ValueInput.value + "'";
						var DEFAULT_SQL = (Item[i].edit.data[4].NullInput.checked) ? ' DEFAULT NULL ' :  ((Item[i].edit.data[4].ValueInput.value != '') ? " DEFAULT " + DEFAULT_STR : '');
						var AUTO_INCREMENT_SQL = (Item[i].edit.data[5].checked) ? ' AUTO_INCREMENT ' : '';
						var COMMENT_SQL = (Item[i].edit.data[7].value != '')? ' COMMENT \'' + Item[i].edit.data[7].value + '\'' : '';
						alter_table.push("CHANGE  `" + Item[i].Field.replace(/`/g, '``') + "`  `" + Item[i].edit.data[0].value.replace(/`/g, '``') + "` " + Item[i].edit.data[1].ColumnTypes.value + ColumnLength_SQL + PROPERTY_SQL + COLLATE_SQL +  NULL_SQL + DEFAULT_SQL + AUTO_INCREMENT_SQL + COMMENT_SQL );

					}
				}
				// 新添加字段　************************
				for (k in TempItem )
				{
					if(TempItem[k].length > 0)
					{
						for (ek in TempItem[k] )
						{

							var ColumnLength_SQL = (TempItem[k][ek].edit[1].ColumnLength.value == '') ? '' : "( " + TempItem[k][ek].edit[1].ColumnLength.value + " ) ";
							var COLLATE_SQL = (TempItem[k][ek].edit[2].value != '' ) ? ' CHARACTER SET ' + TempItem[k][ek].edit[2].options[TempItem[k][ek].edit[2].selectedIndex].parentNode.getAttribute('label') +  ' COLLATE ' + TempItem[k][ek].edit[2].value : '';
							var NULL_SQL = (TempItem[k][ek].edit[3].checked) ? ' NULL ' : ' NOT NULL ';
							var DEFAULT_STR = (TempItem[k][ek].edit[1].ColumnTypes.value == 'TIMESTAMP' && TempItem[k][ek].edit[4].ValueInput.value == 'CURRENT_TIMESTAMP') ?  TempItem[k][ek].edit[4].ValueInput.value : "'" + TempItem[k][ek].edit[4].ValueInput.value + "'";
							var DEFAULT_SQL = (TempItem[k][ek].edit[4].NullInput.checked) ? ' DEFAULT NULL ' :  ((TempItem[k][ek].edit[4].ValueInput.value != '') ? " DEFAULT " + DEFAULT_STR : '');
							var AUTO_INCREMENT_SQL = (TempItem[k][ek].edit[5].checked) ? ' AUTO_INCREMENT ' : '';
							var COMMENT_SQL = (TempItem[k][ek].edit[7].value != '')? ' COMMENT \'' + TempItem[k][ek].edit[7].value + '\'' : '';
							var PROPERTY_SQL = (TempItem[k][ek].edit[6].value != '') ?  ' ' + TempItem[k][ek].edit[6].value : '';
							
							var join_sql = "ADD  `" + TempItem[k][ek].edit[0].value.replace(/`/g, '``') + "` " +  TempItem[k][ek].edit[1].ColumnTypes.value + ColumnLength_SQL + PROPERTY_SQL + COLLATE_SQL +  NULL_SQL + DEFAULT_SQL + AUTO_INCREMENT_SQL + COMMENT_SQL;
							
							if (ek != 0)	// 集合中的非第一条
							{
								alter_table_add.push(join_sql + ' AFTER `' + TempItem[k][ek-1].edit[0].value +'`');
							}
							else
							{
								if (TempItem[k][ek].key == 'END') 
									alter_table_add.push(join_sql);
								else if (TempItem[k][ek].key == 'FIRST')
									alter_table_add.push(join_sql + ' FIRST');
								else
									alter_table_add.push(join_sql + ' AFTER `' + Item[k].Field.replace(/`/g, '``') +'`');
							}
							
						
							if (TempItem[k][ek].edit[8].value != '')
							{
								if (TempItem[k][ek].edit[8].value == 'PRIMARY')
									join_sql = 'ADD PRIMARY KEY ';
								else if (TempItem[k][ek].edit[8].value == 'UNIQUE')
									join_sql = 'ADD UNIQUE ';
								else if (TempItem[k][ek].edit[8].value == 'INDEX')
									join_sql = 'ADD INDEX ';
								else if (join_sql == 'FULLTEXT ')
									join_sql = 'ADD FULLTEXT ';
								alter_table_add.push(join_sql + '(`' + TempItem[k][ek].edit[0].value.replace(/`/g, '``') + '`)');
							}
							
						}
					}
				}

				if(alter_table_add.length == 0 && alter_table == 0)
				{
					alert(L.NoChangeStructure);
					return;	// 没有编辑返回
				}
				var sql = 'ALTER TABLE `' +  TableName + '`' + "\n" + alter_table.join(',' + "\n");
				if(alter_table_add.length > 0) sql +=  alter_table_add.join(',' + "\n");
				SqlSubmitFormObject.ConfirmSqlSubmit(null, sql);
			}
			
			// 刷新
			ActionTr.Srenovate = function ()
			{
				SqlSubmitFormObject.sql_post.value = SqlSubmitFormObject.SqlformoOriginal.value;
				SqlEdit.setValue(SqlSubmitFormObject.sql_post.value);
				SqlSubmitFormObject.ConfirmSqlSubmit(null, 'ALTER TABLE `' +  TableName + '`');
			}
		}


		
		this.ActionTr.ListSelect = C('a',{'innerHTML':L.Selects,'className':'ico ico_select'});
		this.ActionTr.edit = C('a',{'innerHTML':L.Edit,'className':'ico ico_edit', 'title':L.EditSelectItem});
		this.ActionTr.del = C('a',{'innerHTML':L.Del,'className':'ico ico_del', 'title':L.DeleteSelectedItem});
		this.ActionTr.PrimeKey = C('a',{'innerHTML':L.PrimeKey,'className':'ico ico_PrimeKey', 'title':L.SelectedSetPrimeKey});
		this.ActionTr.only = C('a',{'innerHTML':L.Only,'className':'ico ico_only', 'title':L.SelectedSetOnly});
		this.ActionTr.index = C('a',{'innerHTML':L.Index,'className':'ico ico_index', 'title':L.SelectedSetIndex});
		this.ActionTr.save = C('a',{'innerHTML':L.Save,'className':'ico ico_save', 'title':L.SaveEditItem});


		// 增加新字段
		this.ActionTr.AddLint = C('form' , {'method':'POST','target':'GetTableData'});
		this.ActionTr.AddLint.id = 'TableAddLint';
		this.ActionTr.AddLint.AddNumInp = C('input',{'value':1}, {'width':'25px'});
		this.ActionTr.AddLint.AddSubmit = C('input', {'type':'button','value':L.Determine,'className':'submit'});
		this.ActionTr.AddLint.AddSelect = CreatesSelect(new Array(L.TableEnd + '|END', L.TableHead + '|FIRST', new Array(L.Fieldlater + ' >> ', this.AddLint_field)));
		C(this.ActionTr.AddLint, 'In', new Array(
			C('a', {'className':'ico ico_AddLint'}), 
			this.ActionTr.AddLint.AddSelect,
			C('font', 'In', ' ' + L.Add + ' '), 
			this.ActionTr.AddLint.AddNumInp, 
			C('font', 'In', ' ' + L.NewField),
			this.ActionTr.AddLint.AddSubmit
			)
		);
		// 插入新字段 From Onsubmit
		this.ActionTr.AddLint.onsubmit = function ()
		{
			TableObject.ActionTr.AddLint.AddSubmit.onclick();
			return false;
		}

		// 显示索引
		this.ActionTr.ShowIndex = C('font');
		this.ActionTr.ShowIndex.button = C('input', {'type':'button','value':(this.IndexItem.length > 0 && TableShowIndex) ? L.Close:L.Show});
		this.ActionTr.ShowIndex.button.status_x = (this.IndexItem.length > 0 && TableShowIndex) ? 'close':'open';
		this.ActionTr.ShowIndex.button.onclick = function ()
		{
			TableObject.ShowIndex(this.status_x);
			this.value =  this.status_x == 'open' ? L.Close : L.Show;
			this.status_x = this.status_x == 'open' ? 'close' : 'open';
		}
		this.ActionTr.ShowIndex = C(this.ActionTr.ShowIndex, 'In', [C('font', 'In', ' &nbsp; ' + L.IndexList + ':'), this.ActionTr.ShowIndex.button, C('i', 'In', '<b>' + this.IndexItem.length + '</b> ' + L.Record)]);


		with(this)
		{
			(function (obj)
			{
				obj.save.onclick = function ()
				{
					ActionTr.SaveEdit();
				}
				obj.edit.onclick = function (type)
				{
					type = typeof(type) == 'string' ? type : 'edit';
					for (key in Item )
					{
						if(Item[key].input.checked || type == 'CancelEdit')	// 取消编辑的情况全部通过
						{
							try{
							Item[key].edit.onclick(type);
							}catch(e){return;}
						}
					}

					// if (type == 'CancelEdit') ActionTr.NoAllSelect.onclick();	// 同时取消选择
				}
				obj.del.onclick = function ()
				{
					var temp_arr =  new Array();
					var temp_arr2 = new Array();
					for (key in Item)
					{
						if (Item[key].input.checked)
						{
							temp_arr.push(' DROP `' + Item[key].Field.replace(/`/g, '``') + '`');
							temp_arr2.push(Item[key].Field);
						}
					}
					if(temp_arr.length < 1) return false;
					var sql = 'ALTER TABLE `' + TableName + '`' +  temp_arr.join(',');
					SqlSubmitFormObject.ActionOperation.value = 1;
					SqlSubmitFormObject.operation_sql_text.value = sql;
					SqlSubmitFormObject.UpOperationSqlNotice(printf(L.ConfirmDelField, {'list':temp_arr2.join('; '), 'b':'<font color="red"><b>', '_b':'</b></font>'}), 0);
					SqlSubmitFormObject.confirm_sql.style.display = 'inline';
				}
				obj.PrimeKey.onclick = function ()
				{
					var temp_arr = new Array();
					var temp_arr2 = new Array();
					for (key in Item)
					{
						if (Item[key].input.checked) 
						{
							temp_arr.push(Item[key].Field.replace(/`/g, '``'));
							temp_arr2.push(Item[key].Field);
						}
					}
					if(temp_arr.length < 1) return false;
					var sql = 'ALTER TABLE `' + TableName + '` ADD PRIMARY KEY  (`' + temp_arr.join('`,`') + '`)';
					SqlSubmitFormObject.ActionOperation.value = 1;
					SqlSubmitFormObject.operation_sql_text.value = sql;
					SqlSubmitFormObject.UpOperationSqlNotice(printf(L.ConfirmSetFieldPrimeKey, {'list':temp_arr2.join('; '), 'b':'<font color="red"><b>', '_b':'</b></font>'}) , 0);
					SqlSubmitFormObject.confirm_sql.style.display = 'inline';
				}
				obj.only.onclick = function ()
				{
					var temp_arr = new Array();
					var temp_arr2 = new Array();
					for (key in Item)
					{
						if (Item[key].input.checked) 
						{
							temp_arr.push(Item[key].Field.replace(/`/g, '``'));
							temp_arr2.push(Item[key].Field);
						}
					}
					if(temp_arr.length < 1) return false;
					var sql = 'ALTER TABLE `' + TableName + '` ADD UNIQUE  (`' + temp_arr.join('`,`') + '`)';
					SqlSubmitFormObject.ActionOperation.value = 1;
					SqlSubmitFormObject.operation_sql_text.value = sql;
					SqlSubmitFormObject.UpOperationSqlNotice(printf(L.ConfirmSetFieldOnly, {'list':temp_arr2.join('; '), 'b':'<font color="red"><b>', '_b':'</b></font>'}), 0);
					SqlSubmitFormObject.confirm_sql.style.display = 'inline';
				}
				obj.index.onclick = function ()
				{
					var temp_arr = new Array();
					var temp_arr2 = new Array();
					for (key in Item)
					{
						if (Item[key].input.checked) 
						{
							temp_arr.push(Item[key].Field.replace(/`/g, '``'));
							temp_arr2.push(Item[key].Field);
						}
					}
					if(temp_arr.length < 1) return false;
					var sql = 'ALTER TABLE `' + TableName + '` ADD INDEX  (`' + temp_arr.join('`,`') + '`)';
					SqlSubmitFormObject.ActionOperation.value = 1;
					SqlSubmitFormObject.operation_sql_text.value = sql;
					SqlSubmitFormObject.UpOperationSqlNotice(printf(L.ConfirmSetFieldIndex, {'list':temp_arr2.join('; '), 'b':'<font color="red"><b>', '_b':'</b></font>'}), 0);
					SqlSubmitFormObject.confirm_sql.style.display = 'inline';
				}
				
				// 增加新字段 确定操作
				obj.AddLint.AddSubmit.onclick = function ()
				{
					var k = obj.AddLint.AddSelect.value;	// 插入的位置
					if(typeof(TempItem[k]) != 'object') TempItem[k] = new Array();	// 一次增加几条记录的总集合
					for (var i = 0; i < obj.AddLint.AddNumInp.value; ++i)
					{
						var o = {};
						o.key = k;				// 记录大key
						o.edit = new Array();
						o.edit[0] = C('input');
						o.edit[1] = C('span');
						o.edit[1].ColumnTypes = C(CreatesSelect(ColumnTypes), '', {'width':'180px'});
						o.edit[1].ColumnLength = C('input' , '', {'width':'50px'});
						C(o.edit[1], 'In', new Array(o.edit[1].ColumnTypes, C('i', 'In', ' - '),o.edit[1].ColumnLength));
						o.edit[2] = C(CreatesSelect(Collations), '', {'width':'170px'});
						o.edit[2].disabled = true;
						o.edit[3] = C('input', {'type':'checkbox'});
						o.edit[4] = C('span');
						o.edit[4].NullInput = C('input', {'type':'checkbox'});
						o.edit[4].ValueInput = C('input');
						C(o.edit[4], 'In', new Array(C('i', 'In', 'NULL:'), o.edit[4].NullInput,o.edit[4].ValueInput));
						o.edit[5] = C('input', {'type':'checkbox'});
						o.edit[6] = C(CreatesSelect(TextOperators), '', {'width':'170px'});
						o.edit[7] = C('textarea', {'className':'edit_input'}, {'height':'17px','width':'100px'});
						o.edit[8] = C(CreatesSelect(ColumnIndex), '',{'width':'100px'});
						o.del = C('a', {'innerHTML':L.Del, 'className':'ico2 ico_del2', 'title':L.Del});
						
						
						o.btr = C('tr', 'In', new Array(
							C(C('td', {'align':'center'}), 'In', o.del),
							C('td', 'In', ' - '),
							C('td', 'In', o.edit[0]),
							C('td', 'In', o.edit[1]),
							C('td', 'In', o.edit[2]),
							C('td', 'In', o.edit[3]),
							C('td', 'In', o.edit[4]),
							C('td', 'In', o.edit[5]),
							C('td', 'In', o.edit[6]),
							C('td', 'In', o.edit[7]),
							C(C('td', {'align':'center'}), 'In', o.edit[8])
							)
						);
						o.i = TempItem[k].length;	// 记录小key
						TempItem[k].push(o);

						(function (o)
						{
							o.del.onclick = function ()
							{ 
								o.btr.parentNode.removeChild(o.btr);
								TempItem[o.key].splice(o.i, 1);			// 删除一条
								New_i = 0;
								for (dk in TempItem[o.key] )
								{
									TempItem[o.key][dk].i = New_i;		// 重新更新key
									++New_i;
								}
								if(TempItem[o.key].length == 0) delete TempItem[o.key];	// 删除总集合
							}

							o.edit[1].ColumnTypes.onchange = function ()
							{
								c = this.options[this.selectedIndex].parentNode.getAttribute('label') // 大分类
								if(c == 'NUMERIC' || this.value == 'INT' ||  c == 'DATE and TIME'  || this.value == 'DATE')
								{
									o.edit[2].value = '';
									o.edit[2].disabled = true;
								}
								else
									o.edit[2].disabled = false;

								if(c == 'DATE and TIME' || this.value == 'DATE')
								{
									o.edit[1].ColumnLength.value = '';
									o.edit[1].ColumnLength.disabled = true;
								}
								else
									o.edit[1].ColumnLength.disabled = false;
							}

							o.edit[4].NullInput.onclick = function ()
							{
								if(this.checked) o.edit[3].checked = true;
							}
							o.edit[3].onclick = function ()
							{
								if(!this.checked) o.edit[4].NullInput.checked = false;
							}

							o.btr.onmouseup = function (event)
							{
								event = event? event:window.event;
								if(event.button == 2) AddLineTag = true;
							}

							for (var ei = 0; ei < 9; ++ei)
							{
								o.edit[ei].onkeydown = function (event)	
								{
									event = event? event:window.event;
									
									if((event.keyCode == 69  || event.keyCode == 83 || event.keyCode == 68  || event.keyCode == 67 || event.keyCode == 82 ) && AddLineTag)
									{
										this.blur();
										return false;
									}
								}
							}
						})
						(o);

						
						if (k == 'FIRST')
							table_tbody.insertBefore(o.btr, Item[0].btr);
						else if(k == 'END' || typeof(Item[parseInt(k)+1]) != 'object') 
							table_tbody.appendChild(o.btr);
						else
							table_tbody.insertBefore(o.btr, Item[parseInt(k)+1].btr);
					}
				}
			})
			(this.ActionTr)
		}
		
		this.ActionTr.td = C('td');
		if(CanEditStructure)
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
				this.ActionTr.PrimeKey,
				this.ActionTr.only,
				this.ActionTr.index,
				this.ActionTr.save,
				this.ActionTr.AddLint,
				this.ActionTr.ShowIndex
			));
		}
		this.ActionTr.td.className = 'ActionTd';
		this.ActionTr.td.colSpan = '12';
		this.ActionTr.td.align = 'left';

		this.ActionTr.appendChild(this.ActionTr.td);
		this.table_tfoot.appendChild(this.ActionTr);

		this.table.appendChild(this.table_thead);
		this.table.appendChild(this.table_tbody);
		this.table.appendChild(this.table_tfoot);
		this.list.appendChild(this.table);

		if(this.IndexItem.length > 0 && TableShowIndex) this.ShowIndex();	// 显示索引

		this.Menu();									// 加载右键菜单
	}

	// 显示索引 ****************************
	this.ShowIndex = function (type)
	{

		if(this.IndexData != null) 
		{
			this.IndexData.table.style.display = (type == 'open') ? 'block':'none';
			if(type == 'open')  GoLocation('ShowIndex');
			return ;
		}
		this.IndexData = {};
		this.IndexData.table = C('table', {'className':'table'});		// 表格
		this.IndexData.table_thead = C('thead');						// 表格头部
		this.IndexData.table_tbody = C('tbody');						// 表格内容
		this.IndexData.table_tfoot = C('tfoot');
		this.IndexData.table_tfoot.ActionTr = C('tr');
		this.IndexData.table_tfoot.ActionTr.td = C('td', {'className':'ActionTd'});

		this.IndexData.StartTr = null;		// 开始的Tr
		this.IndexData.EndTr = null;		// 结束的Tr
		this.IndexData.SEstatus = false;	// 是否做离开时onmouseup处理

		var temp_arr = {};					// 统计分组
		var exist_MuchRow = false;			// 是否存在多列索引

		if (this.IndexItem.length > 0)
		{
			for (key in this.IndexItem)
			{
				if(typeof(temp_arr[this.IndexItem[key].Key_name]) != 'number') 
					temp_arr[this.IndexItem[key].Key_name] = 0;
				++temp_arr[this.IndexItem[key].Key_name];
				if(temp_arr[this.IndexItem[key].Key_name] > 1) exist_MuchRow = true;
			}
		}

		var th_title = [L.Operations,L.IndexKeyName,L.IndexType,L.Only,L.Field,L.Size,L.Sequence,L.Collations,L.Radix,"Packed","Null",L.Comment];
		this.IndexData.table_thead.tr = C('tr');
		for (key in th_title)
			C(this.IndexData.table_thead.tr, 'In', (key == 4 && exist_MuchRow) ? C('th', {'innerHTML': th_title[key], 'colSpan':2}) : C('th', 'In', th_title[key]));
		C(this.IndexData.table_thead, 'In', this.IndexData.table_thead.tr);

		
		if (this.IndexItem.length > 0)
		{
			for (key in this.IndexItem )
			{
				this.IndexItem[key].NL = temp_arr[this.IndexItem[key].Key_name]			// 大于1: 多列索引第一列，等于1:单列索引, 等于0:多列索引非第一列
				var NL = temp_arr[this.IndexItem[key].Key_name];						// 是否多列索引

				this.IndexItem[key].Action = (NL > 1) ? C('td',{'rowSpan': NL}) : C('td');
				this.IndexItem[key].Action.input = C('input', {'type':'checkbox'});
				this.IndexItem[key].Action.del = C('a', {'innerHTML':L.Del,'className':'ico2 ico_del2','title':L.Del});
				this.IndexItem[key].Action.edit = C('a',{'innerHTML':L.Edit,'className':'ico2 ico_edit2','title':L.Edit});
				C(this.IndexItem[key].Action, 'In', [this.IndexItem[key].Action.input, this.IndexItem[key].Action.edit, this.IndexItem[key].Action.del]);
				
				with(this)
				{
					(function (obj)
					{
						obj.Action.input.onclick = function ()
						{
							return false;
						}
						obj.Action.del.onclick = function ()
						{
							if (obj.Key_name == 'PRIMARY')
								var sql = 'ALTER TABLE `' + TableName + '` DROP PRIMARY KEY';
							else
								var sql = 'ALTER TABLE  `' +  TableName + '` DROP INDEX  `' + obj.Key_name + '`';
							
							SqlSubmitFormObject.ConfirmSqlSubmit(printf(L.ConfirmDelIndex, {'list': obj.Key_name, 'b':'', '_b':''}) + "? \n\r" + sql, sql);
						}
						obj.Action.edit.onclick = function (type)
						{	
							// 多列索引非第一列不能编辑
							if(!obj.NL) return;
							
							var FieldLocation = (exist_MuchRow) ? 5 : 4;		// 索引字段位置
							var SubPartLocation = (exist_MuchRow) ? 6 : 5;		// 索引大小位置

							if ((!obj.Action.edit.data || type == 'edit') && type != 'CancelEdit')
							{
								if(!obj.Action.edit.data)
								{
									obj.Action.edit.data = {};
									obj.Action.edit.data.name = C('input');
									obj.Action.edit.data.name.value = obj.Key_name;

									if(!_ColumnIndex) var _ColumnIndex = [ColumnIndex[1]];
									obj.Action.edit.data.IndexType = CreatesSelect(_ColumnIndex, obj.type);
									
									if(obj.NL == 1)
									{
										obj.Action.edit.data.FieldName = CreatesSelect(AddLint_field, obj.Column_name);

										// 索引大小
										obj.Action.edit.data.Sub_part = C('input','', {'width':'50px'});
										obj.Action.edit.data.Sub_part.value = obj.Sub_part;
										obj.Action.edit.data.Sub_part.onkeyup = function ()
										{
											if(this.value != '') obj.Action.edit.data.Sub_part_null.checked = false;
										}
										obj.Action.edit.data.Sub_part_null = C('input', {'type':'checkbox','checked':(is_null(obj.Sub_part) ? true:false)});
										obj.Action.edit.data.Sub_part_null.onclick = function ()
										{
											if(this.checked) obj.Action.edit.data.Sub_part.value = '';
										}
										obj.Action.edit.data.Sub_part_show = C('span', 'In', [C('i', 'In', 'NULL:'), obj.Action.edit.data.Sub_part_null, obj.Action.edit.data.Sub_part]);
									}

									// 避免输入文本框右击菜单的快捷键字母
									for (var k in obj.Action.edit.data )
									{
										obj.Action.edit.data[k].onkeydown = function (event)	
										{
											event = event? event:window.event;
											if((event.keyCode == 69  || event.keyCode == 83 || event.keyCode == 68  || event.keyCode == 67 || event.keyCode == 82 ) && IndexRightButtonRow != null)
											{
												this.blur();
												return false;
											}
										}
									}
								}
								obj.btr.getElementsByTagName('td')[1].getElementsByTagName('div')[0].style.display = 'none';	// 索引名
								obj.btr.getElementsByTagName('td')[2].getElementsByTagName('div')[0].style.display = 'none';	// 索引类型

								C(obj.btr.getElementsByTagName('td')[1], 'In', obj.Action.edit.data.name);
								C(obj.btr.getElementsByTagName('td')[2], 'In', obj.Action.edit.data.IndexType);

								if(obj.NL == 1)
								{
									obj.btr.getElementsByTagName('td')[FieldLocation].getElementsByTagName('div')[0].style.display = 'none';	// 字段名
									obj.btr.getElementsByTagName('td')[SubPartLocation].getElementsByTagName('div')[0].style.display = 'none';	// 索引大小
									C(obj.btr.getElementsByTagName('td')[FieldLocation], 'In', obj.Action.edit.data.FieldName);
									C(obj.btr.getElementsByTagName('td')[SubPartLocation], 'In', obj.Action.edit.data.Sub_part_show);
								}
							}
							else
							{
								obj.btr.getElementsByTagName('td')[1].getElementsByTagName('div')[0].style.display = 'block';
								obj.btr.getElementsByTagName('td')[2].getElementsByTagName('div')[0].style.display = 'block';

								obj.Action.edit.data.name.parentNode.removeChild(obj.Action.edit.data.name);
								obj.Action.edit.data.IndexType.parentNode.removeChild(obj.Action.edit.data.IndexType);
								if(obj.NL == 1)
								{
									obj.btr.getElementsByTagName('td')[FieldLocation].getElementsByTagName('div')[0].style.display = 'block';
									obj.btr.getElementsByTagName('td')[SubPartLocation].getElementsByTagName('div')[0].style.display = 'block';
									obj.Action.edit.data.FieldName.parentNode.removeChild(obj.Action.edit.data.FieldName);
									obj.Action.edit.data.Sub_part_show.parentNode.removeChild(obj.Action.edit.data.Sub_part_show);
								}
								obj.Action.edit.data = null;
							}
						}

						// 多列索引字段操作
						if(!obj.NL || NL > 1)
						{
							obj.Action_small = C('td');
							obj.Action_small.del_small = C('a',{'In':L.Del,'className':'ico2 ico_del2','title':L.Del});
							obj.Action_small.edit_small = C('a',{'In':L.Edit,'className':'ico2 ico_edit2','title':L.Edit});
							C(obj.Action_small, 'In', [obj.Action_small.edit_small, obj.Action_small.del_small]);

							obj.Action_small.del_small.onclick = function ()
							{
								if (obj.Key_name == 'PRIMARY')
									var sql = ' DROP PRIMARY KEY, ';
								else
									var sql = ' DROP INDEX  `' + obj.Key_name + '`, ';
								var temp_arr = [];		// 同索引的其它字段
								for (key in IndexItem)
								{
									if(IndexItem[key].Key_name == obj.Key_name && IndexItem[key].Column_name != obj.Column_name)
										temp_arr.push(IndexItem[key].Column_name);
								}
								var index_type = obj.type == 'PRIMARY' ? 'PRIMARY KEY' : obj.type + ' `' + obj.Key_name + '`';
								sql = 'ALTER TABLE `' + TableName + '` ' + sql + ' ADD ' + index_type + ' (`'  + temp_arr.join('`,`') + '`)';


								SqlSubmitFormObject.ConfirmSqlSubmit("确定删除索引:" + obj.Key_name +  ' : ' + obj.Column_name + "? \n\r" + sql, sql);
							}

							obj.Action_small.edit_small.onclick = function (type)
							{
								var FieldLocation = (!obj.NL) ? 1 : 5;		// 多列索引字段位置
								var SubPartLocation = (!obj.NL) ? 2 : 6;	// 索引大小位置
								
								if (!obj.Action_small.edit_small.data &&  type != 'CancelEdit')
								{
									obj.Action_small.edit_small.data = {};
									obj.Action_small.edit_small.data.name = CreatesSelect(AddLint_field, obj.Column_name);
									obj.btr.getElementsByTagName('td')[FieldLocation].getElementsByTagName('div')[0].style.display = 'none';	// 字段名
									C(obj.btr.getElementsByTagName('td')[FieldLocation], 'In', obj.Action_small.edit_small.data.name);

									// 索引大小
									obj.Action_small.edit_small.data.Sub_part = C('input','', {'width':'50px'});
									obj.Action_small.edit_small.data.Sub_part.value = obj.Sub_part;
									obj.Action_small.edit_small.data.Sub_part.onkeyup = function ()
									{
										if(this.value != '') obj.Action_small.edit_small.data.Sub_part_null.checked = false;
									}
									obj.Action_small.edit_small.data.Sub_part_null = C('input', {'type':'checkbox','checked':(is_null(obj.Sub_part) ? true:false)});
									obj.Action_small.edit_small.data.Sub_part_null.onclick = function ()
									{
										if(this.checked) obj.Action_small.edit_small.data.Sub_part.value = '';
									}
									obj.Action_small.edit_small.data.Sub_part_show = C('span', 'In', [C('i', 'In', 'NULL:'), obj.Action_small.edit_small.data.Sub_part_null, obj.Action_small.edit_small.data.Sub_part]);

									obj.btr.getElementsByTagName('td')[SubPartLocation].getElementsByTagName('div')[0].style.display = 'none';	// 索引大小
									C(obj.btr.getElementsByTagName('td')[SubPartLocation], 'In', obj.Action_small.edit_small.data.Sub_part_show);

									// 避免输入文本框右击菜单的快捷键字母
									for (var k in obj.Action_small.edit_small.data )
									{
										obj.Action_small.edit_small.data[k].onkeydown = function (event)	
										{
											event = event? event:window.event;
											if((event.keyCode == 69  || event.keyCode == 83 || event.keyCode == 68  || event.keyCode == 67 || event.keyCode == 82 ) && IndexRightButtonRow != null)
											{
												this.blur();
												return false;
											}
										}
									}
								}
								else
								{
									obj.btr.getElementsByTagName('td')[FieldLocation].getElementsByTagName('div')[0].style.display = 'block';
									obj.Action_small.edit_small.data.name.parentNode.removeChild(obj.Action_small.edit_small.data.name);

									obj.btr.getElementsByTagName('td')[SubPartLocation].getElementsByTagName('div')[0].style.display = 'block';
									obj.Action_small.edit_small.data.Sub_part_show.parentNode.removeChild(obj.Action_small.edit_small.data.Sub_part_show);

									obj.Action_small.edit_small.data  = null;
								}
							}
						}
					})(IndexItem[key])
				}

				

				var arr = [
					this.IndexItem[key].Action,
					C((NL > 1) ? C('td', {'rowSpan':NL}) : C('td'), 'In', C(C('div', {'className':'field_div'}), 'In', C('b', 'In', this.IndexItem[key].Key_name))) ,
					C((NL > 1) ? C('td', {'rowSpan':NL}) : C('td'), 'In', C(C('div', {'className':'field_div'}), 'In', this.IndexItem[key].Index_type + '&nbsp; | <i>' + this.IndexItem[key].type + '</i>')) ,
					C((NL > 1) ? C('td', {'rowSpan':NL}) : C('td'), 'In', (this.IndexItem[key].Non_unique == '0' ? L.Yes : L.No)) ,
					(exist_MuchRow) ? ( (NL > 1 || NL == 0 ) ? this.IndexItem[key].Action_small : C('td') ) : false,
					C('td', 'In', C('div', {'className': 'field_div', 'innerHTML':this.IndexItem[key].Column_name})) ,
					C('td', 'In', C('div', {'className': 'field_div', 'innerHTML' : (is_null(this.IndexItem[key].Sub_part) ? '<i>NULL</i>' : this.IndexItem[key].Sub_part)})),
					C('td', 'In', this.IndexItem[key].Seq_in_index) ,
					C('td', 'In', this.IndexItem[key].Collation) ,
					C('td', 'In', this.IndexItem[key].Cardinality) ,
					C('td', 'In', (is_null(this.IndexItem[key].Packed) ? '<i>NULL</i>' : this.IndexItem[key].Packed)) ,
					C('td', 'In', this.IndexItem[key].Null) ,
					C( (NL > 1) ? C('td', {'rowSpan':NL}) : C('td'), 'In', this.IndexItem[key].Comment)
				];
				
				if(NL == 0) // 为0就删除相关不必要的td 
				{
					arr.splice(0,4);
					arr.splice(exist_MuchRow ? 8 : 7,1);
				}

				this.IndexItem[key].btr = C('tr', 'In', arr);
				this.IndexItem[key].btr.className = (typeof(this.IndexItem[parseInt(key)-1]) != 'object' || this.IndexItem[parseInt(key)-1].btr.className == 'odd') ? '' : 'odd';
				if(NL == 0)	this.IndexItem[key].btr.className = this.IndexItem[parseInt(key)-1].btr.className;

				this.IndexItem[key].btr.key = parseInt(key);	// 当前key
				this.IndexItem[key].btr.marked = false;		// 默认没选上

				// tr 选择相关
				with(this)
				{
					IndexItem[key].btr.onmouseover = function ()
					{
						for (key in IndexItem)
						{
							if(IndexItem[key].Key_name == IndexItem[this.key].Key_name)
								IndexItem[key].btr.className = (IndexItem[key].btr.className != '') ?  IndexItem[key].btr.className + ' onmouseover' : 'onmouseover';
						}
					}
					IndexItem[key].btr.onmouseout = function ()
					{
						var temp_key = this.key;
						setTimeout(function ()
						{
							for (var key in IndexItem )
							{
								if (IndexItem[key].Key_name == IndexItem[temp_key].Key_name)
									IndexItem[key].btr.className = IndexItem[key].btr.className.replace(/onmouseover/, '');
							}
						}, 50);
					}

					IndexItem[key].btr.onmousedown = function (event)
					{
						// 按住Shift键
						event = event? event:window.event;
						if(event.button == 2 || (!document.all && event.button == 1) || event.button == 4) 
						{
							AddLineTag = false;
							if(event.button == 2) IndexRightButtonRow = this.key;
						}
						if((!document.all && event.button == 1) ||event.button == 4)  return;


						if(event.shiftKey==true && IndexData.StartTr != null)
						{
							IndexData.EndTr = this.key;
							var StartGo = IndexData.StartTr;					// 开始的Tr KEY
							var Sum = IndexData.StartTr - IndexData.EndTr;	// 个数
							if(Sum > 0) var StartGo = IndexData.EndTr;
							Sum = Math.abs(Sum);
							if(Sum < 1) return;
							var EndGo = Sum + StartGo +1;
							
							for (; StartGo < EndGo; ++StartGo)
								ClickTr(IndexItem[StartGo].btr, false, false , 'IndexShow');
							IndexData.SEstatus = false;
							return;
						}
						else
						{
							IndexData.StartTr = this.key;
							IndexData.SEstatus = true;
							if(event.button == 2) 		// 右键选择
								ClickTr(this, false, false , 'IndexShow');	// 只能选上	
							else
								ClickTr(this, true, false , 'IndexShow');	// 自由切换
						}
						
					}
					IndexItem[key].btr.onmouseup = function (event)
					{
						// 划拉选择处理
						event = event? event:window.event;

						if(event.button == 2 || (!document.all && event.button == 1) || event.button == 4) 
						{
							return;			// 禁止右键、中键划拉选择
						}

						if(!IndexData.SEstatus) return;
						IndexData.EndTr = this.key;
						var StartGo = IndexData.StartTr+1;			// 开始的Tr KEY
						var Sum = IndexData.StartTr - IndexData.EndTr;			// 个数
						if(Sum > 0) var StartGo = IndexData.EndTr;
						Sum = Math.abs(Sum);
						if(Sum < 1) return;
						var EndGo = Sum + StartGo;
						for (; StartGo < EndGo; ++StartGo)
						{
							if(!(typeof(IndexItem[StartGo-1]) == 'object' && IndexItem[StartGo].Key_name == IndexItem[StartGo-1].Key_name))
								 ClickTr(IndexItem[StartGo].btr, true, false , 'IndexShow');	// 不同Key_name才操作
						}
						IndexData.SEstatus = false;
					}
				}

				C(this.IndexData.table_tbody, 'In', this.IndexItem[key].btr);

				if(temp_arr[this.IndexItem[key].Key_name] > 1) 
					temp_arr[this.IndexItem[key].Key_name] = 0;		// 多列索引加完第一Tr, 其它Tr标记为0 
				
			}

			// 操作的tr
			with(this)
			{
				IndexData.table_tfoot.ActionTr.AllSelect = C('a','In', L.SelectAll);
				IndexData.table_tfoot.ActionTr.AllSelect.onclick = function ()
				{
					for (var i = 0; i < IndexItem.length; ++i)
						ClickTr(IndexItem[i].btr, false, false , 'IndexShow');	// 只能选上	
				}

				IndexData.table_tfoot.ActionTr.NoAllSelect = C('a','In',L.ClearAll);
				IndexData.table_tfoot.ActionTr.NoAllSelect.onclick = function ()
				{
					for (var i = 0; i < IndexItem.length; ++i)
						ClickTr(IndexItem[i].btr, false, true , 'IndexShow');	// 不选上	
				}

				IndexData.table_tfoot.ActionTr.OppositeSelect = C('a','In',L.InvertSelect);
				IndexData.table_tfoot.ActionTr.OppositeSelect.onclick = function ()
				{
					for (var i = 0; i < IndexItem.length; ++i)
						ClickTr(IndexItem[i].btr, true, false , 'IndexShow');	// 反选	
				}

				IndexData.table_tfoot.ActionTr.edit = C('a',{'innerHTML':L.Edit,'className':'ico ico_edit','title':L.EditSelectItem});
				IndexData.table_tfoot.ActionTr.edit.onclick = function (type)
				{
					type = typeof(type) == 'string' ? type : 'edit';
					for (var k in IndexItem)
					{
						if(IndexItem[k].Action.input.checked || type == 'CancelEdit')
						{	
							try{
								IndexItem[k].Action.edit.onclick(type);
							}catch(e){}
						}
					}
					if (type == 'CancelEdit')
					{
						for (var k in IndexItem)
						{
							if(IndexItem[k].Action_small)
							{	
								try{
									IndexItem[k].Action_small.edit_small.onclick('CancelEdit');
								}catch(e){}
							}
						}
					}
				}
				IndexData.table_tfoot.ActionTr.del = C('a',{'innerHTML':L.Del,'className':'ico ico_del','title':L.DeleteSelectedItem});
				IndexData.table_tfoot.ActionTr.del.onclick = function ()
				{
					var DelIndexSql = [];
					var DelIndexName = [];
					for (var k in IndexItem)
					{
						if(IndexItem[k].Action.input.checked)
						{
							if(('`' + DelIndexName.join('`,`') + '`').indexOf('`' + IndexItem[k].Key_name + '`') == -1)
							{
								DelIndexSql.push((IndexItem[k].Key_name == 'PRIMARY') ? ' DROP PRIMARY KEY' : ' DROP INDEX  `' + IndexItem[k].Key_name + '`');
								DelIndexName.push(IndexItem[k].Key_name);
							}
						}
					}
					if(DelIndexSql.length > 0)
					{
						SqlSubmitFormObject.ActionOperation.value = 1;
						SqlSubmitFormObject.operation_sql_text.value =  'ALTER TABLE `' + TableName + '` ' + DelIndexSql.join(', ');
						SqlSubmitFormObject.UpOperationSqlNotice(printf(L.ConfirmDelIndex, {'list': DelIndexName.join('; '), 'b':'<font color="red"><b>', '_b':'</b></font>'}), 0);
						SqlSubmitFormObject.confirm_sql.style.display = 'inline';
					}
					
				}
				IndexData.table_tfoot.ActionTr.save = C('a',{'innerHTML':L.Save,'className':'ico ico_save', 'title':L.SaveEditItem});
				IndexData.table_tfoot.ActionTr.save.onclick = function ()
				{
					var SaveSql = [];
					var FinalSql = [];
					for (var k in IndexItem )
					{
						if(typeof(SaveSql[IndexItem[k].Key_name]) != 'object') SaveSql[IndexItem[k].Key_name] = {};		// 以索引名称归类
						if(SaveSql[IndexItem[k].Key_name].length == 0) SaveSql[IndexItem[k].Key_name].IfSave = false;	// 是否有更新而进行保存
						
						SaveSql[IndexItem[k].Key_name].DelOldSql =  (IndexItem[k].Key_name == 'PRIMARY') ? ' DROP PRIMARY KEY' : ' DROP INDEX  `' + IndexItem[k].Key_name + '`';
						if(typeof(SaveSql[IndexItem[k].Key_name].Field) != 'object') SaveSql[IndexItem[k].Key_name].Field = [];
						if(typeof(SaveSql[IndexItem[k].Key_name].Sub_part) != 'object') SaveSql[IndexItem[k].Key_name].Sub_part = [];

						// 多列索引 ******************
						// 有编辑情况
						if(IndexItem[k].Action_small && IndexItem[k].Action_small.edit_small.data)
						{
							// 索引字段有改变
							var FieldId = IndexItem[k].Action_small.edit_small.data.name ? IndexItem[k].Action_small.edit_small.data.name.value : null;
							if(FieldId && Item[FieldId].Field != IndexItem[k].Column_name)
							{
								SaveSql[IndexItem[k].Key_name].IfSave = true;
								SaveSql[IndexItem[k].Key_name].Field.push(Item[FieldId].Field);
							}
							else
							{
								// 原先索引字段
							    SaveSql[IndexItem[k].Key_name].Field.push(IndexItem[k].Column_name);
							}
							
							
							// 索引大小有改变
							if((is_null(IndexItem[k].Sub_part) && IndexItem[k].Action_small.edit_small.data.Sub_part_null.checked == false) || (!is_null(IndexItem[k].Sub_part) && IndexItem[k].Action_small.edit_small.data.Sub_part.value != IndexItem[k].Sub_part))
								SaveSql[IndexItem[k].Key_name].IfSave = true;
							SaveSql[IndexItem[k].Key_name].Sub_part.push(IndexItem[k].Action_small.edit_small.data.Sub_part.value);
						}
						else if(IndexItem[k].Action_small)
						{
							// 原先索引字段、大小
							// 无编辑情况
							SaveSql[IndexItem[k].Key_name].Field.push(IndexItem[k].Column_name);
							SaveSql[IndexItem[k].Key_name].Sub_part.push(IndexItem[k].Sub_part);
						}

						
						// 单列索引 ******************
						if (IndexItem[k].Action.edit.data)
						{
							// 索引名字或类型有改变
							if(IndexItem[k].Action.edit.data.name.value != IndexItem[k].Key_name || IndexItem[k].Action.edit.data.IndexType.value != IndexItem[k].type)
 								SaveSql[IndexItem[k].Key_name].IfSave = true;

							// 新索引名字、类型
 							if(!SaveSql[IndexItem[k].Key_name].KeyName)
								SaveSql[IndexItem[k].Key_name].KeyName =  ' ADD ' + IndexItem[k].Action.edit.data.IndexType.value + ' `' + IndexItem[k].Action.edit.data.name.value + '`';

							// 索引字段有改变
							var FieldId = (IndexItem[k].Action.edit.data.FieldName) ? IndexItem[k].Action.edit.data.FieldName.value : null;
							if(FieldId && Item[FieldId].Field != IndexItem[k].Column_name)
							{
								SaveSql[IndexItem[k].Key_name].IfSave = true;
								SaveSql[IndexItem[k].Key_name].Field.push(Item[FieldId].Field);
							}
							else if (SaveSql[IndexItem[k].Key_name].Field.length == 0)
							{
								SaveSql[IndexItem[k].Key_name].Field.push(IndexItem[k].Column_name);
							}

							
							// 索引大小有改变
							if(IndexItem[k].Action.edit.data.Sub_part_null && (is_null(IndexItem[k].Sub_part) && IndexItem[k].Action.edit.data.Sub_part_null.checked == false) || (!is_null(IndexItem[k].Sub_part) && IndexItem[k].Action.edit.data.Sub_part.value != IndexItem[k].Sub_part))
								SaveSql[IndexItem[k].Key_name].IfSave = true;
							if(IndexItem[k].Action.edit.data.Sub_part)
								SaveSql[IndexItem[k].Key_name].Sub_part.push(IndexItem[k].Action.edit.data.Sub_part.value);
						}
						else
						{
							// 原先索引名字、类型
							if(!SaveSql[IndexItem[k].Key_name].KeyName)
 								SaveSql[IndexItem[k].Key_name].KeyName =  ' ADD ' + IndexItem[k].type + ' `' + IndexItem[k].Key_name + '`';
						}

						
					}
					// 组成保存SQL
					for (var k in SaveSql )
					{
						if(SaveSql[k].IfSave)
						{
							FinalSql.push(SaveSql[k].DelOldSql);

							var TempField = [];
							for (var FK in SaveSql[k].Field)
								TempField.push('`' + SaveSql[k].Field[FK] + '`' + ((SaveSql[k].Sub_part[FK] && SaveSql[k].Sub_part[FK] != '') ? ' (' + SaveSql[k].Sub_part[FK] + ') ':''));
							
							FinalSql.push(SaveSql[k].KeyName + ' (' + TempField.join(',') + ') ');
						}
					}

					if(FinalSql.length == 0)
					{
						alert(L.NoChangeIndex);
						return;
					}
					var sql = 'ALTER TABLE `' + TableName + '`' + FinalSql.join(',');
					SqlSubmitFormObject.ConfirmSqlSubmit(null, sql);
				}

			}

			C(this.IndexData.table_tfoot.ActionTr.td, 'In', 
				[C('a', {'innerHTML':L.Selects,'className': 'ico ico_select'}),
				this.IndexData.table_tfoot.ActionTr.AllSelect, 
				C('span','In','/'),
				this.IndexData.table_tfoot.ActionTr.NoAllSelect, 
				C('span','In','/'),
				this.IndexData.table_tfoot.ActionTr.OppositeSelect,
				C('span','In',' &nbsp; &nbsp; ' + L.SelectItems + ': '),
				this.IndexData.table_tfoot.ActionTr.edit,
				this.IndexData.table_tfoot.ActionTr.del,
				this.IndexData.table_tfoot.ActionTr.save]
			)
		}
		else
		{
			this.IndexData.notice = C('div');
			this.IndexData.notice.className = 'notice';
			C(this.IndexData.notice, 'In', C('b', {'className':'ico ico_sqlError'}));
			C(this.IndexData.notice, 'In', C('font', 'In', L.NoIndex));
			this.IndexData.table_tbody.appendChild( C(C('tr', {'className':'odd'}), 'In', C(C('td', {'colSpan': '12'}), 'In', this.IndexData.notice)) );
				
		}

		this.IndexData.table_tfoot.ActionTr.td.colSpan = exist_MuchRow ? th_title.length+2 : th_title.length;
		this.IndexData.table_tfoot.ActionTr.td.align = 'left';
		C(this.IndexData.table_tfoot.ActionTr, 'In', this.IndexData.table_tfoot.ActionTr.td);
		C(this.IndexData.table_tfoot, 'In', this.IndexData.table_tfoot.ActionTr);

		C(this.IndexData.table, 'In', [this.IndexData.table_thead, this.IndexData.table_tbody, this.IndexData.table_tfoot]);
		this.list.appendChild(C(C('div', {'id':'ShowIndex'}), 'In', this.IndexData.table));
	
		this.IndexMenu();	// 加载右键菜单
	}

	// Tr点击函数
	this.ClickTr = function (Tr, status, ParentStatus, type)
	{
		
		if ((Tr.marked && status) || ParentStatus)
		{
			// 不选上
			Tr.className = Tr.className.replace(/marked/, '');
			if(type != 'IndexShow')
			{
				this.Item[Tr.key].input.checked = false;
				Tr.marked = false;
			}
			else
			{
				for (key in this.IndexItem)
				{
					if(this.IndexItem[key].Key_name == this.IndexItem[Tr.key].Key_name)
					{
						this.IndexItem[key].Action.input.checked = false;
						this.IndexItem[key].btr.className = this.IndexItem[key].btr.className.replace(/marked/, '');
						this.IndexItem[key].btr.marked = false;
					}
				}
			}
			
		}
		else
		{
			// 选上
			Tr.className = Tr.className.replace(/marked/, '') + ' marked';
			if(type != 'IndexShow')
			{
				this.Item[Tr.key].input.checked = true;
				Tr.marked = true;
			}
			else
			{
				
			    for (key in this.IndexItem)
				{
					if(this.IndexItem[key].Key_name == this.IndexItem[Tr.key].Key_name)
					{
						this.IndexItem[key].btr.className = this.IndexItem[key].btr.className.replace(/marked/, '') + ' marked';
						this.IndexItem[key].Action.input.checked = true;
						this.IndexItem[key].btr.marked = true;
					}
				}
			}
			
		}
	}

	// 结构右键菜单
	this.Menu = function ()
	{
		(function (o)
		{
			AmysqlMenuObject.add(
			{
				'MenuId':'AmysqlTableMenu', 'AreaDomID':'TableBlockStructure',
				'MenuList':[
					{'id':'Sedit', 'name':L.Edit, 'KeyCodeTag':'E', 'ico':'ico_edit2', 'functions':function (){
						o.Item[o.RightButtonRow].edit.onclick('edit');
					}},
					{'id':'SEditAll', 'name':L.EditSelects, 'functions':function (){
						o.ActionTr.edit.onclick('edit');
					}},
					{'className':'separator'},
					{'id':'Ssaves', 'name':L.Save, 'KeyCodeTag':'S', 'ico':'ico_save2', 'functions':function (){
						o.ActionTr.SaveEdit();
					}},
					{'className':'separator'},
					{'id':'Sdel', 'name':L.Del, 'KeyCodeTag':'D', 'ico':'ico_del2', 'functions':function (){
						o.Item[o.RightButtonRow].del.onclick();
					}},	
					{'id':'SDelAll', 'name':L.DeleteSelectedItems, 'functions':function (){
						o.ActionTr.del.onclick();
					}},	
					{'id':'SPrimeKey', 'name':L.SetPrimeKey, 'ico':'ico_PrimeKey2', 'functions':function (){
						o.Item[o.RightButtonRow].PrimeKey.onclick();
					}},	
					{'id':'Sonly', 'name':L.SetOnly, 'ico':'ico_only2', 'functions':function (){
						o.Item[o.RightButtonRow].only.onclick();
					}},	
					{'id':'Sindex', 'name':L.SetIndex, 'ico':'ico_index2', 'functions':function (){
						o.Item[o.RightButtonRow].index.onclick();
					}},	
					{'className': 'separator'},
					{'id':'SCancelEdit', 'name':L.CanceledEdit, 'KeyCodeTag':'C', 'functions':function (){
						o.ActionTr.edit.onclick('CancelEdit');
					}},
					{'id':'SCancelSelect', 'name':L.UncheckItem, 'functions':function (){
						o.ActionTr.NoAllSelect.onclick();
					}},
					{'className':'separator'},
					{'id':'Srenovate', 'name':L.ReloadStructureData, 'KeyCodeTag':'R', 'ico':'ico_renovate2', 'functions':function (){
						o.ActionTr.Srenovate();
					}},
				],
				'initial': function ()	// 菜单初始化函数
				{
					var TableObjectTempItem = false;	// 是否有添加新字段
					for (var k in o.TempItem)
					{
						TableObjectTempItem = true;
						break;
					}
					var EditSum = 0;					// 结构表是否有编辑项
					for (var k in o.Item ) 
					{ 
						if(o.Item[k].edit.data.length > 0) 
						{
							EditSum = 1;
							break;
						}
					}
					// !o.AddLineTag 不是新添加字段
					var ActionSet = (CanEditStructure && !o.AddLineTag && o.RightButtonRow != null) ? true : false;		// 是否能操作
					
					this.get('SCancelEdit').className = (EditSum && CanEditStructure && !o.AddLineTag) ? 'item' : 'item2';
					this.get('Ssaves').className = ((EditSum && CanEditStructure) || TableObjectTempItem) ? 'item' : 'item2'; 
					this.get('Sedit').className = ActionSet ? 'item' : 'item2'; 
					this.get('SEditAll').className = ActionSet ? 'item' : 'item2'; 
					this.get('Sdel').className = ActionSet ? 'item' : 'item2'; 
					
					this.get('SDelAll').className = ActionSet ? 'item' : 'item2'; 
					this.get('SPrimeKey').className = ActionSet ? 'item' : 'item2'; 
					this.get('Sonly').className = ActionSet ? 'item' : 'item2'; 
					this.get('Sindex').className = ActionSet ? 'item' : 'item2'; 
				},
				'close':function ()
				{
					o.RightButtonRow = null;		// 表格数据右击菜单标识清空
					o.AddLineTag = false;			// 右击、添加新字段标识清空
				}
			});
		})
		(this);
	}

	// 索引右键菜单
	this.IndexMenu = function ()
	{
		(function (o)
		{
			AmysqlMenuObject.add(
			{
				'MenuId':'AmysqlTableIndexMenu', 'AreaDomID':'ShowIndex',
				'MenuList':[
					{'id':'SIedit', 'name':L.Edit, 'KeyCodeTag':'E', 'ico':'ico_edit2', 'functions':function (){
						o.IndexItem[o.IndexRightButtonRow].Action.edit.onclick('edit');
					}},
					{'id':'SIEditAll', 'name':L.EditSelects, 'functions':function (){
						o.IndexData.table_tfoot.ActionTr.edit.onclick();
					}},
					{'className':'separator'},
					{'id':'SIsaves', 'name':L.Save, 'KeyCodeTag':'S', 'ico':'ico_save2', 'functions':function (){
						o.IndexData.table_tfoot.ActionTr.save.onclick();
					}},
					{'className':'separator'},
					{'id':'SIdel', 'name':L.Del, 'KeyCodeTag':'D', 'ico':'ico_del2', 'functions':function (){
						o.IndexItem[o.IndexRightButtonRow].Action.del.onclick();
					}},	
					{'id':'SIDelAll', 'name':L.DeleteSelectedItems, 'functions':function (){
						o.IndexData.table_tfoot.ActionTr.del.onclick();
					}},	
					{'className': 'separator'},
					{'id':'SICancelEdit', 'name':L.CanceledEdit, 'KeyCodeTag':'C', 'functions':function (){
						o.IndexData.table_tfoot.ActionTr.edit.onclick('CancelEdit');
					}},
					{'id':'SICancelSelect', 'name':L.UncheckItem, 'functions':function (){
						if(o.IndexData.table_tfoot.ActionTr.NoAllSelect)
							o.IndexData.table_tfoot.ActionTr.NoAllSelect.onclick();
					}},
					{'className':'separator'},
					{'id':'SIrenovate', 'name':L.ReloadIndexData, 'KeyCodeTag':'R', 'ico':'ico_renovate2', 'functions':function (){
						o.ActionTr.Srenovate();
					}},
				],
				'initial': function ()	// 菜单初始化函数
				{
					var EditSum = 0;					// 结构表是否有编辑项
					for (var k in o.IndexItem ) 
					{ 
						if(o.IndexItem[k].Action.edit.data || (o.IndexItem[k].Action_small && o.IndexItem[k].Action_small.edit_small.data)) 
						{
							EditSum = 1;
							break;
						}
					}
					
					var ActionSet = (CanEditStructure  && o.IndexRightButtonRow != null) ? true : false;		// 是否能操作
					this.get('SICancelEdit').className = (EditSum && CanEditStructure) ? 'item' : 'item2';
					this.get('SIsaves').className = (EditSum && CanEditStructure) ? 'item' : 'item2'; 
					this.get('SIedit').className = ActionSet ? 'item' : 'item2'; 
					this.get('SIEditAll').className = ActionSet ? 'item' : 'item2'; 
					this.get('SIdel').className = ActionSet ? 'item' : 'item2'; 
					this.get('SIDelAll').className = ActionSet ? 'item' : 'item2'; 
				},
				'close':function ()
				{
					o.IndexRightButtonRow = null;		// 表格数据右击菜单标识清空
				}
			});
		})
		(this);
	}
}
