/************************************************
 *
 * Amysql AMS
 * Amysql.com 
 * @param Object 
 * AmysqlTableData  
 *
 */
var TableDataObject;
var PageObject;
var TableIndexOrder = {};

// SQL *********
var OrderByType = 'DESC';					// 首次排序方式
var limit = '';								// SQL Limit
var OrderBy = {};							// 排序的对象
var SqlEdit = {};							// 编辑sql对象



//*****************************************
ExtendArray.push({
	'_Events':[
		{'_Event':
			{'scroll':function ()
				{
					// 获取更多数据
					if((getScrollTop() + getClientHeight() > getScrollHeight() - 300) || (getScrollTop() + getClientHeight() == getScrollHeight()))
					{
						if(typeof(TableDataObject) == 'object' && TableDataObject.TableDataMainBlock.style.display != 'none')
							TableDataObject.show('More');
					}
					// 浮动分页页码
					if (getScrollTop() > G("ListPageOffsetTop").offsetTop+55)
					{
						PageObject.listT.style.bottom = '-30px';
						PageObject.listT.style.top = 'auto';
					}
					else
					{
						PageObject.listT.style.top = '-33px';
						PageObject.listT.style.bottom = 'auto';
					}
				},
				'load':function ()
				{
					CreateTableIndexOrder();

					// 表数据 
					TableDataObject = new TableData();
					TableDataObject.ThItem = TableDataFieldList;
					if(CanEdit && !sqlField_IN_TableField(TableDataObject.ThItem)) CanEdit = false;
					TableDataObject.AddItem(TableDataArray);
					NavigationObject.add({
						'id':'N_browse', 'text':L.Browse, 'defaults': DefaultActive.TableData ? true:false, 'content':'TableDataMainBlock', 
						'functions':function ()
						{
							TableDataObject.show();
						}
					});
					// 分页处理
					PageObject = new PageList('PageListTop');
					PageObject.set(page, PageSum);
					PageObject.show();
					// End **
				}
			},
		'_EventObj':window
		},
		{'_Event':
			{
				'keyup':function (e)
				{
					e = e ? e : window.event;
					if (TableKeyDownGoPage && typeof(document.activeElement.value) == 'undefined')
					{
						if(e.keyCode == 37 || e.keyCode == 39)
						{
							PageObject.SubmitPage(page+e.keyCode-38);
							document.documentElement.scrollLeft = 0;
							document.body.scrollLeft = 0;
						}
					}
				}
			},
		'_EventObj':document
		}
	],
	'_ExtendInfo':{
			'ExtendId':'TableData',
			'ExtendName':L.TableData,
			'ExtendAbout':L.TableDataAbout,
			'Version':'1.00',
			'Date':'2012-04-06',
			'WebSite':'https://amh.sh',
			'PoweredBy':'Amysql'
	}
})
// ExtendArray End *****************


// 判断sql的字段是否都在当前数据表的字段当中
var sqlField_IN_TableField = function (arr)
{
	var table_field_arr = new Array();
	for (key in TableFieldList )
		table_field_arr.push(TableFieldList[key].COLUMN_NAME);
	for (key in arr )
	{
		if(('`' + table_field_arr.join('`,`') + '`').indexOf('`' + arr[key].name + '`') == -1 || TableName != arr[key].table) 
			return false;
	}
	return true;
}

// 设置sql WHERE 字段标识
var SetWhereMarked = function ()
{
 	var sql = SqlSubmitFormObject.sql_post.value;	// SQL  
	sql = sql.toUpperCase();
	var sql_arr = trim(sql.split(' '));		// 分割SQL成数组
	var sql_keyword = new Array('=', '>', '>=', '<', '<=', '!=', 'LIKE', 'NO LIKE', 'IS NULL', 'IS NOT NULL');	// sql where 关键字

	for (key in TableDataObject.ThItem )
	{
 		var val = TableDataObject.ThItem[key].name.toUpperCase();
		var table = TableDataObject.ThItem[key].table.toUpperCase();
		var keyword = (CanEdit) ? val : table + '.' + val;
		var keyword2 = (CanEdit) ? '`' + val + '`' : '`' + table + '`.`' + val + '`';

		if (sql.indexOf(keyword) != -1)		// 判断是否存在字段于sql中
		{
			for (sql_arr_key in sql_arr)
			{
				if(sql_arr[sql_arr_key] == keyword || sql_arr[sql_arr_key] == keyword2 )
				{
 					if(sql_keyword.join(' ').indexOf(sql_arr[parseInt(sql_arr_key)+1]) != -1)	// 判断字段的下个值是否为sql where 关键字
					TableDataObject.ThItem[key].WhereMarked = true;
				}
			}
		}
	}

}
// 设置SQL ORDER BY *********
var SetOrderBy = function (obj, OrderByTypeNew)
{
	OrderBy = obj;
	//var sql = SqlSubmitFormObject.sql_post.value.replace(/(\r|\n)/g, '');	// SQL 
	// var sql = OriginalSql;
	var temp_sql = sql.toUpperCase();
	var temp_location = temp_sql.lastIndexOf('ORDER BY');
	var sql1 = sql.substr(0, temp_location);		// ORDER BY 前段
	var sql2 = sql.substr(temp_location);			// ORDER BY 后段
		sql2 = sql2.replace(/`/g, '');	

	if(temp_location == -1)
	{
		// SQL没有 ORDER BY 
		limit = '';
		var temp_arr =  sql.split(/limit/i);
		if(temp_arr.length > 1)
		{
			sql = temp_arr[0];
			limit = ' LIMIT ' + trim(temp_arr[1]);
		}
		sql = sql + ' ORDER BY `' + obj.table + '`.`' + obj.name + '` ' + (OrderByTypeNew ? OrderByTypeNew : OrderByType) + limit;
	}
	else
	{
		var temp_sql2 = sql2.toUpperCase();
		var temp_location = sql2.lastIndexOf(' AS ');
		if(temp_location != -1)
		{
			// 后段有AS 重取新SQL1
			var sql2_A = sql2.substr(0, temp_location);
			sql1 = sql1 + sql2_A;

			sql2 = sql2.substr(temp_location);
		}

		limit = '';		// 如有Limit重取新Sql2
		var temp_arr =  sql2.split(/limit/i);
		if(temp_arr.length > 1)
		{
			sql2 = temp_arr[0];
			limit = ' LIMIT ' + trim(temp_arr[1]);
		}
		sql2 = trim(sql2);
		if(temp_location != -1) sql1 += ' ' + sql2;

		var sql_order_by_arr = trim(sql2.split(' '));
		var sql_order_by_type = trim(sql_order_by_arr[sql_order_by_arr.length-1]);		// 排序类型
		var sql_order_by_field = trim(sql_order_by_arr[sql_order_by_arr.length-2]);		// 排序的字段
		
		if(sql_order_by_field == obj.table + '.' + obj.name) 
			OrderByType = sql_order_by_type == 'DESC' ? 'ASC' : 'DESC';
	    sql = trim(sql1) + ' ORDER BY `' + obj.table + '`.`' + obj.name + '` ' + (OrderByTypeNew ? OrderByTypeNew : OrderByType) + limit;

	}
	return sql;
}
// 获取SQL ORDER BY *********
var GetOrderBy = function ()
{
	var sql = SqlSubmitFormObject.sql_post.value;
	var temp_sql = sql.toUpperCase();
	var temp_location = temp_sql.lastIndexOf('ORDER BY');
	var sql1 = sql.substr(0, temp_location);		// ORDER BY 前段
	var sql2 = sql.substr(temp_location);			// ORDER BY 后段
		sql2 = sql2.replace(/`/g, '');	
	if(temp_location == -1)
	{
		OrderBy = {};
	}
	else
	{
		var temp_arr =  sql2.split(/limit/i);
		if(temp_arr.length > 1)  sql2 = temp_arr[0]; 
		sql2 = trim(sql2);

		var sql_order_by_arr = trim(sql2.split(' '));
	    OrderByType = trim(sql_order_by_arr[sql_order_by_arr.length-1].toUpperCase());	// 排序类型
		var sql_order_by_field = trim(sql_order_by_arr[sql_order_by_arr.length-2]);		// 排序的字段
		if(sql_order_by_field.indexOf('.') != -1) 
		{
			var sql_order_by_field_arr = sql_order_by_field.split('.');
			OrderBy = {'val':sql_order_by_field_arr[1], 'table':sql_order_by_field_arr[0]}; 
		}
		else
		{
			OrderBy = {'val':sql_order_by_field}; 
		}
		TableIndexOrder.dom.value = TableIndexOrder.OrderData[OrderBy.val + '_' + OrderByType] ? OrderBy.val + '_' + OrderByType : '';
	}

}
// 返回字段信息 **********
var _TableFieldList = {};	// 字段信息快速返回
var GetFieldInfo = function (name)
{
	if(_TableFieldList[name]) return _TableFieldList[name];
	for (key in TableFieldList )
	{
		// 查找名字为name的字段信息存至_TableFieldList以便下次直接返回。
		if (TableFieldList[key].COLUMN_NAME == name)
		{
			_TableFieldList[name] = TableFieldList[key];
			return TableFieldList[key];
		}
	}
	return {'Type':'null'};
}

var _TableDataFieldList = {};	// SQL字段信息快速返回
var GetSqlFieldInfo = function (name)
{
	if(_TableDataFieldList[name]) return _TableDataFieldList[name];
	for (key in TableDataFieldList )
	{
		if (TableDataFieldList[key].name == name)
		{
			_TableDataFieldList[name] = TableDataFieldList[key];
			return TableDataFieldList[key];
		}
	}
	return {'Type':'null'};
}


// 创建索引排序
var CreateTableIndexOrder = function ()
{
	TableIndexOrder.SelectData = [];
	TableIndexOrder.OrderData = {};

	TableIndexOrder.SelectData.push('(Select Field)|');
	for (var k in TableIndexItem)
	{
		if (TableIndexOrder.SelectData.toString().indexOf(TableIndexItem[k].Column_name) == -1)
		{
			var val = TableIndexItem[k].Column_name + '_ASC';
			TableIndexOrder.SelectData.push(TableIndexItem[k].Column_name + ' (' + TableIndexItem[k].type + ') - ASC' + '|' + val);
			TableIndexOrder.OrderData[val] = {'name':TableIndexItem[k].Column_name, 'OrderBy':'ASC'};

			val = TableIndexItem[k].Column_name + '_DESC';
			TableIndexOrder.SelectData.push(TableIndexItem[k].Column_name + ' (' + TableIndexItem[k].type + ') - DESC' + '|' + val);
			TableIndexOrder.OrderData[val] = {'name':TableIndexItem[k].Column_name, 'OrderBy':'DESC'};
		}
	}
	TableIndexOrder.dom = C(CreatesSelect([['Order BY',TableIndexOrder.SelectData]], TableIndexOrder.SelectData[0]), {'id':'TableIndexOrder'});
	TableIndexOrder.dom.onchange = function ()
	{
		if(this.value != '')
		{
			GetSqlFieldInfo(TableIndexOrder.OrderData[this.value].name).ATag.onclick(TableIndexOrder.OrderData[this.value].OrderBy);
		}
	}
}

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
	this.ThItem = new Array();								// 字段数组
	this.Item = new Array();
	this.TableDataMainBlock = C('div', {'id':'TableDataMainBlock'});
	this.list = C('div', {'id':'TableDataBlock'});			// 表格块

	this.table = null;			// 表格
	this.table_thead = null;	// 表格头部
	this.table_tbody = null;	// 表格内容
	this.table_tfoot = null;	// 表格脚部
	this.ActionTr =  C('tr');	// 操作的TR

	this.SEstatus = false;
	this.StartTr = null;
	this.EndTr = null;
	this.StartRead = 0;								// 起读点
	this.OnceShow = parseInt(30);					// 一屏显示条数
	this.RightButtonRow = null;						// 当前右键记录
	this._IfShow = false;

	this.ListData = C('div', {'id':'ListData','className':'ListData'});
	// Dom
	if(TableDataObject) TableMainObject.ContentBlock.removeChild(TableDataObject.TableDataMainBlock);	
	C(this.TableDataMainBlock, 'In', [ C('div', {'id':'ListPageOffsetTop'}), C(this.ListData, 'In', [C('div', {'id':'PageListTop'}), this.list]) ])
	C(TableMainObject.ContentBlock, 'In', this.TableDataMainBlock);

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
	this.show = function (status)
	{
		_TableFieldList = {};	// 清除字段信息快速返回数据
		if(this.Item.length == 0) this.TableDataMainBlock.style.display = 'none';
		if(this._IfShow && !status) return;
		this._IfShow = true;	// 已运行
		GetOrderBy();							// 取得SQL ORDER BY
		var ItemSum = this.Item.length;			// 数据总数
		var ThItemSum = this.ThItem.length;		// 字段总数
		var empty = true;	// 默认
		if(status == 'More') empty = false;

		this.list.style.display = 'block';
		if(empty)
		{
			this.list.innerHTML = '';
			this.table = C('table', {'className':'table'});
			this.table.style.width = 'auto';
			this.table_thead = C('thead');
			this.table_tbody = C('tbody');
			this.table_tfoot = C('tfoot');
			
			// ***** 表格标题 ***************************************************************************************************
			this.htr = C('tr');
			this.htr.appendChild(C('th', {'innerHTML':'ActionHidden','className':'td1_1'}));
			for (var i = 0; i < ThItemSum; ++i)
			{
				// var val = this.ThItem[i].split('.');
				// this.ThItem[i] = {};
				this.ThItem[i].key = CanEdit ? i+1 : i;		// 下标
				//this.ThItem[i].table = val[0];
				//this.ThItem[i].name = val[1];

				var title = CanEdit ? this.ThItem[i].name : this.ThItem[i].table + '.' + this.ThItem[i].name;
				this.ThItem[i].ATag = C('A','In', title);										// 标题文字
				var ATag = (CanEdit) ? new Array(this.ThItem[i].ATag, C('font', 'In', TableFieldList[i].COLUMN_COMMENT)) : this.ThItem[i].ATag;
				this.ThItem[i].ThTag = C('th','In', ATag );					// 标题块
				this.ThItem[i].Click = false;								// 是否已 marked
				this.ThItem[i].WhereMarked = false;							// Sql Where 条件　marked
				
				// 有OrderBy 增加图标
				var order_by_title = OrderByType == 'DESC' ? L.DESC : L.ASC;
				var add_OrderBy_ico = CanEdit ? (this.ThItem[i].name == OrderBy.val ? true : false) : (this.ThItem[i].table == OrderBy.table && this.ThItem[i].name == OrderBy.val ? true: false); 
				if(add_OrderBy_ico)  C(this.ThItem[i].ATag, 'In', C('a', {'className':'ico2 ico_' + OrderByType, 'title':order_by_title}));
				
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

						// 排序
						obj.ATag.onclick = function (OrderByTypeVal)
						{
							OrderByTypeVal = typeof(OrderByTypeVal) == 'string' ? OrderByTypeVal : null;
							SqlSubmitFormObject.sql_post.value = SetOrderBy(obj, OrderByTypeVal);	// 给sql 设置OrderBy
							SqlEdit.setValue(SqlSubmitFormObject.sql_post.value + "\n\n\n");
							G("SqlForm").onsubmit(parseInt(G("SqlformPage").value));
						}
					})(ThItem[i]);

				}

				this.htr.appendChild(this.ThItem[i].ThTag);
			}
			if(empty) this.table_thead.appendChild(this.htr);	//  加表格Th标题

			SetWhereMarked();  // 设置SQL Where marked
		}

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
		this.ActionTr.edit = C('a', {'innerHTML':L.Edit,'className':'ico ico_edit','title':L.EditSelect});
		this.ActionTr.del = C('a', {'innerHTML':L.Del,'className': 'ico ico_del','title':L.DeleteSelectedItem});
		this.ActionTr.save = C('a',{'innerHTML':L.Save,'className':'ico ico_save', 'title':L.SaveEditItem});

		with(this)
		{
			// 选中行删除 ************************
			ActionTr.del.onclick = function ()
			{
				var all_sql = '';
				for (key in Item)
				{
					if (Item[key].input.checked)
					{
						var  sql = 'DELETE FROM `' + TableName + '` WHERE ' + Item[key].del.Where.join(' AND ');

						sql = sql.replace(/\\/g, '\\\\');	// SQL\ = \\
						sql = sql.replace(/\r/g, '\\r');
						sql = sql.replace(/\n/g, '\\n');

						all_sql += sql + ' LIMIT 1;\r\n';
					}
				}
				if(all_sql == '') return false;
				SqlSubmitFormObject.operation_sql_text.value = all_sql;
				SqlSubmitFormObject.UpOperationSqlNotice(L.ConfirmDelData , 0);
				SqlSubmitFormObject.confirm_sql.style.display = 'inline';
			}
			// 选中行编辑 ************************
			ActionTr.edit.onclick = function (type)
			{
				// if (type == 'CancelEdit') ActionTr.NoAllSelect.onclick();	同时取消选择

				type = typeof(type) == 'string' ? type : 'edit';
				for (key in Item)
				{
					if (Item[key].input.checked || type == 'CancelEdit')
					{
						try{
							Item[key].edit.onclick(type);
						}catch(e){return;}
					}
				}
			}

			// 编辑保存 ************************
			ActionTr.save.onclick = function ()
			{
				var sum_SqlSet = 0;
				var all_sql = '';
				for (key in Item)
				{
					if(Item[key].textarea.length > 0)					// 哪些行有编辑
					{
						var SqlSet = new Array();						// 更改数据SQL的Set数组
						for (var SEi = 0; SEi < ThItemSum; ++SEi)		// 哪些数据有变化
						{
							var field_name = ThItem[SEi].name.replace(/`/g, '``');
							var field_val = Item[key].textarea[SEi].value.replace(/'/g, "''");
							if(typeof(Item[key].textarea[SEi].input_null) == 'object') 
							{
								// 勾选上  // TableFieldList[SEi].DATA_TYPE == 'int'
								if(Item[key].textarea[SEi].input_null.checked)
								{
									// 原先字段值不等于NULL
									if (!is_null(Item[key].arr[SEi]))	SqlSet.push('`' + field_name + "` = NULL");
								}
								else if(Item[key].textarea[SEi].value != Item[key].arr[SEi])
								{
									SqlSet.push('`' + field_name + "` = '" + field_val + "'");
								}
							}
							else if(Item[key].textarea[SEi].value != Item[key].arr[SEi])
							{
								if(TableFieldList[SEi].DATA_TYPE.indexOf('blob') == -1)	// 不为blob类型字段的数据才保存
								{
									if (TableFieldList[SEi].DATA_TYPE == 'timestamp' && Item[key].textarea[SEi].value == 'CURRENT_TIMESTAMP')
										SqlSet.push('`' + field_name + "` = " + field_val);
									else
										SqlSet.push('`' + field_name + "` = '" + field_val + "'");
								}
							}


						}
						if(SqlSet.length > 0)	// 有变化数据才加SQl
						{
							var  sql = 'UPDATE `' + TableName + '` SET ' + SqlSet.join(' , ') + ' WHERE ' + Item[key].del.Where.join(' AND ');
							sql = sql.replace(/\\/g, '\\\\');	// SQL\ = \\
							sql = sql.replace(/\r/g, '\\r');
							sql = sql.replace(/\n/g, '\\n');
							all_sql += sql + ' LIMIT 1;\r\n';
							sum_SqlSet += SqlSet.length;
						}
					}
				}
				if(!sum_SqlSet)
				{
					alert(L.NoChangeData);
					return true;	// 没任何更改返回吧。
				}

				SqlSubmitFormObject.ConfirmSqlSubmit(null, all_sql);	// 提交Sql
			}
			
			// 保存为新记录 ************************
			ActionTr.SaveToNew = function ()
			{
				var all_sql = '';
				var Sqlfield = new Array();						// 所有字段
				var Sqlvalues  = new Array();					// 字段所有记录行
				for (SEkey in Item)
				{
					if(Item[SEkey].textarea.length > 0)			// 哪些行有编辑
					{
						var SqlRowV = new Array();						// 初始一行记录字段值　
						for (var SEi = 0; SEi < ThItemSum; ++SEi)		 
						{
							var field_val = Item[SEkey].textarea[SEi].value.replace(/'/g, "''");
							if(Sqlfield.length < ThItem.length) Sqlfield.push(ThItem[SEi].name.replace(/`/g, '``'));	// 所有字段
							
							var table_info_tmp = GetFieldInfo(ThItem[SEi].name);	 // 取字段信息
							// var table_info_tmp = TableFieldList[SEi];		 // 取字段信息

							if (table_info_tmp.COLUMN_TYPE == 'timestamp' && Item[SEkey].textarea[SEi].value == 'CURRENT_TIMESTAMP')
							{
								SqlRowV.push(field_val);
							}
 							else if(table_info_tmp.COLUMN_TYPE != 'int') 
							{
								SqlRowV.push("'" + field_val + "'");
							} 
							else
							{
								if(Item[SEkey].textarea[SEi].value != '')
									SqlRowV.push(field_val);
								else
									SqlRowV.push('NULL');
							}
  						}
						Sqlvalues.push("(" + SqlRowV.join(',') + ")" );  // 一行记录

 					}
				}
				var  sql = 'INSERT INTO `' + TableName + '` ( `' + Sqlfield.join('` , `') + '` ) VALUES  ' + Sqlvalues.join(' , ');
				sql = sql.replace(/\\/g, '\\\\');	// SQL\ = \\
				sql = sql.replace(/\r/g, '\\r');
				sql = sql.replace(/\n/g, '\\n');
				sql = sql + ';';
			
				SqlSubmitFormObject.ConfirmSqlSubmit(null, sql);	// 提交Sql
			}
		}
		// 每屏加一个操作TR行
		if(!empty && this.StartRead < ItemSum && !this.htr.del)
		{
			this.ActionTr.td = C('td','In',new Array(
				C('span','In','<i>' + (this.StartRead - this.OnceShow) + ' ~ ' + this.StartRead + '</i>'),
				this.ActionTr.edit,
				this.ActionTr.del,
				this.ActionTr.save
			));

			this.ActionTr.td.className = 'ActionTd';
			this.ActionTr.td.colSpan = ThItemSum + 1;
			this.ActionTr.td.align = 'left';

			this.ActionTr.appendChild(this.ActionTr.td);

			this.table_tbody.appendChild(this.ActionTr);	// 加表格操作的TR
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
			
			this.Item[i].edit = C('a', {'innerHTML':L.Edit,'className':'ico2 ico_edit2','title':L.EditThisRow});
			this.Item[i].del = C('a', {'innerHTML':L.Del,'className':'ico2 ico_del2','title':L.DelThisRow});
			this.Item[i].edit.key = i;	// 下标
			this.Item[i].del.key = i;	// 下标
			
			
			this.Item[i].btr = C('tr');
			this.Item[i].btr.key = i;

			this.Item[i].btr.BtrAction = C('td','In',new Array(
				C(this.Item[i].input,'checked',''),
				this.Item[i].edit,
				this.Item[i].del
			));
			this.Item[i].btr.BtrAction.align = 'center';
			this.Item[i].btr.appendChild(this.Item[i].btr.BtrAction);
			
			var PRI_OR_UNI = new Array();	// 唯一字段
			var Where = new Array();		// Del语句
								
			for (var Thi = 0; Thi < ThItemSum; ++Thi)
			{
				//  var table_info_tmp = TableFieldList[Thi];				// 取字段信息 (因为单独取某字段记录就与标题字段不对应了 )
				var table_info_tmp = GetFieldInfo(this.ThItem[Thi].name);	// 取字段信息
				var field_val = this.Item[i].arr[Thi];
				if (this.Item[i].arr[Thi] != null && this.Item[i].arr[Thi].length > TableResultContentLimit)
				{
					this.Item[i].btr.MoreContent = true;
					field_val = this.Item[i].arr[Thi].substr(0,TableResultContentLimit) + '...';
				}
				if(CanEdit)
					var field_div = (table_info_tmp.COLUMN_TYPE.indexOf('text') == -1) ? C('div', 'In', HTMLEnCode(field_val) + '&nbsp;') : C('div', {'innerHTML':HTMLEnCode(field_val)}, {'overflowY': 'auto', 'width':'380px','whiteSpace':'normal'});
				else
				    var field_div = C('div', {'innerHTML':HTMLEnCode(field_val) + '&nbsp;'}, {'overflowX': 'hidden', 'overflowY': 'auto'});

				if(table_info_tmp.COLUMN_TYPE && table_info_tmp.COLUMN_TYPE.indexOf('blob') != -1) C(field_div, '', {'fontStyle':'italic'});	// blob类型的数据
				field_div.className = 'field_div';
				field_div.id = 'FieldData' + i + '' + Thi;	// 每行各字段值ID(行号+列号)
				var td = C('td', 'In', field_div);
				if(CanEdit && table_info_tmp.COLUMN_TYPE.indexOf('text') == -1) td.noWrap = 'noWrap';	// 非txt类型不换行
				td.className = this.ThItem[Thi].Click ? td.className + ' marked' : td.className.replace(/marked/, '');
				if(this.ThItem[Thi].WhereMarked) td.className = td.className + ' where_mark';
				this.Item[i].btr.appendChild(td);						// #### 加字段数据到TR #########

				// 删除数据行相关 *******************************
				if(CanEdit)
				{	
					if(table_info_tmp.COLUMN_TYPE.indexOf('blob') == -1)	// blob类型字段的数据不能做为删除where
					{
						if(is_null(this.Item[i].arr[Thi]))
							var sql = '`' + this.ThItem[Thi].name.replace(/`/g, '``') + '`' + ' IS NULL ';	// NULL
						else
						{
							var Addsql = (table_info_tmp.COLUMN_TYPE != 'int') ? "'" : '';					// 不是整型的加单引
							var sql =  '`' + this.ThItem[Thi].name.replace(/`/g, '``') + '` = ' + Addsql +  this.Item[i].arr[Thi].replace(/'/g, "''") + Addsql;	// 删除的SQL SQL' = ''
						}
						if (table_info_tmp.COLUMN_KEY == 'PRI' || table_info_tmp.COLUMN_KEY == 'UNI' )
							PRI_OR_UNI.push(sql);			// 主键或唯一字段
						else
							Where.push(sql);	// 普通字段删除的SQL
					}
				}
				
			}

			// 删除数据行相关 *******************************
			if(CanEdit)
			{
				if(PRI_OR_UNI.length > 0 ) 
				{
					this.Item[i].del.Where = PRI_OR_UNI;	 // 有主键或唯一的就用这个
					this.Item[i].del.notice = '\n\r' + L.DelLineData;
				}
				else
				{
					this.Item[i].del.Where = Where;	 // 有主键或唯一的就用这个
					this.Item[i].del.notice = '\n\r' + L.LackKeyConfirmDel;	 
				}

				with(this)
				{
					Item[i].input.onclick = function ()
					{
						return false;
					}

					// 删除记录操作
					Item[i].del.onclick = function ()
					{
						var  sql = 'DELETE FROM `' + TableName + '` WHERE ' + Item[this.key].del.Where.join(' AND ');

						sql = sql.replace(/\\/g, '\\\\');	// SQL\ = \\
						sql = sql.replace(/\r/g, '\\r');
						sql = sql.replace(/\n/g, '\\n');
						sql += ' LIMIT 1 ';

						SqlSubmitFormObject.ConfirmSqlSubmit(Item[this.key].del.notice + L.ConfrimAction + " \n\r" + sql, sql);
					}
					// 编辑记录操作
					Item[i].edit.onclick = function (type)
					{
						// type = edit只能切换成编辑    type = CancelEdit只能取消编辑  type = null 可相互切换
						if(Item[this.key].textarea.length == 0 && type != 'CancelEdit')
						{
							for (var Thi = 0; Thi < ThItemSum; ++Thi)
							{
								var table_info_tmp = GetFieldInfo(ThItem[Thi].name);		// 正确取字段信息
								// var table_info_tmp = TableFieldList[Thi];			// 取字段信息

								if(table_info_tmp.COLUMN_TYPE.indexOf('blob') != -1)	// blob类型编辑
								{
									Item[this.key].textarea[Thi] = C('span', {'id':this.key + '' + Thi,'value':'0'});	// id (行号+列号)
									Item[this.key].textarea[Thi].MaxSize = BlobSize[table_info_tmp.COLUMN_TYPE];		// 最大大小
									Item[this.key].textarea[Thi].MaxSizeDom = C('i', 'In', L.UploadMaxSize + ': ' + Item[this.key].textarea[Thi].MaxSize);
									Item[this.key].textarea[Thi].UpBlobDom = C('span', {'id':'UpBlobId' + this.key + '' + Thi}, {'display':'block'});			 // 上传进度
									Item[this.key].textarea[Thi].UpButtonDom = C('span', {'id':'UpBlobButtonId' + this.key + '' + Thi, 'innerHTML' : L.SelectFile}, {'display':'block'});	 // 上传按钮
									C(Item[this.key].textarea[Thi], 'In', [Item[this.key].textarea[Thi].UpButtonDom, Item[this.key].textarea[Thi].UpBlobDom, Item[this.key].textarea[Thi].MaxSizeDom]);
								}
								else
								{
									// 计算textarea样式 ****** text类型字段编辑默认380px 高度为DIV面积/380 + 20
									if(table_info_tmp.COLUMN_TYPE.indexOf('text') != -1) 
										var offsetHeight = Item[this.key].btr.getElementsByClassName('field_div')[Thi].scrollHeight * Item[this.key].btr.getElementsByClassName('field_div')[Thi].scrollWidth / 380 + 20;
									
									var textarea_height = (table_info_tmp.COLUMN_TYPE.indexOf('text') == -1) ? Item[this.key].btr.getElementsByClassName('field_div')[Thi].scrollHeight - 4 + 'px' : offsetHeight + 'px' ;
									var textarea_width = (table_info_tmp.COLUMN_TYPE.indexOf('text') == -1) ? Item[this.key].btr.getElementsByClassName('field_div')[Thi].scrollWidth - 12 + 'px'  : '380px';
									if(IsTimeType(table_info_tmp.COLUMN_TYPE))
									{
										Item[this.key].textarea[Thi] =  C('input', {'className':'edit_textarea_time'});
									}
									else
									{
										Item[this.key].textarea[Thi] = C('textarea', {'className':'edit_textarea'});
										Item[this.key].textarea[Thi].style.height = textarea_height;
										Item[this.key].textarea[Thi].style.width = textarea_width;
									}

									Item[this.key].textarea[Thi].value = is_null(Item[this.key].arr[Thi]) ? '' : Item[this.key].arr[Thi];
									Item[this.key].textarea[Thi].name = ThItem[Thi].name + '[]';
								}
  
								
								(function (obj, table_info_tmp, Linei, Thi)
								{ 
									// blob类型点击切换上传AmysqlUpObjectId
									obj.onmouseover = function ()
									{
										if(obj.UpBlobDom)
											AmysqlUpObjectId = obj.id;
									}
									obj.onkeydown = function (event)	// 避免输入文本框右击菜单的快捷键字母
									{
										event = event? event:window.event;
										if((event.keyCode == 69  || event.keyCode == 83 || event.keyCode == 68  || event.keyCode == 67 || event.keyCode == 82 ) && RightButtonRow != null)
										return false;
									}

									obj.onkeyup = function ()	// 文本框为空与字段为Int类型时 勾选上框
									{	
										if(typeof(obj.input_null) == 'object')
										{
											if(table_info_tmp.COLUMN_TYPE == 'int' || IsTimeType(table_info_tmp.COLUMN_TYPE)) 
												obj.input_null.checked = (obj.value == '') ? true : false; 
											else 
												if(obj.value != '') obj.input_null.checked = false;
										}
									}

									if(is_null(table_info_tmp.COLUMN_DEFAULT) && table_info_tmp.IS_NULLABLE == 'YES')	// 默认为空时加个复选框
									{
										obj.input_null = C('input', {'type':'checkbox'});
										obj.input_null.onclick = function ()
										{
											if (this.checked)
												obj.value = '';
											else
											{
 											    if(obj.value == '' && table_info_tmp.COLUMN_TYPE == 'int') this.checked = true;
											}
										}

										obj.input_font = C('font', 'In', new Array(C('I', 'In', 'NULL: ') , obj.input_null, C('br')));
										Item[Linei].btr.childNodes[Thi+1].appendChild(Item[Linei].textarea[Thi].input_font);
										if(is_null(Item[Linei].arr[Thi])) obj.input_null.checked = true;
									}
									
									// 时间控件
									if(IsTimeType(table_info_tmp.COLUMN_TYPE)) 
									{
										obj.onclick = function ()
										{
											WdatePicker({dateFmt:IsTimeType(table_info_tmp.COLUMN_TYPE)});
										}
									}

								})(Item[this.key].textarea[Thi], table_info_tmp, this.key, Thi)

								
								Item[this.key].btr.childNodes[Thi+1].appendChild(Item[this.key].textarea[Thi]);

								// blob添加上传按钮
								if(Item[this.key].textarea[Thi].UpBlobDom)
								{
									var url = 'index.php?c=ams&a=UpBlobData&FieldName=' + encodeURIComponent(ThItem[Thi].name) + '&TableName=' + encodeURIComponent(TableName) + '&DatabaseName=' + encodeURIComponent(DatabaseName) + '&where=' + encodeURIComponent(Item[this.key].del.Where.join(' AND '));
									upload_file(Item[this.key].textarea[Thi].id, url, Item[this.key].textarea[Thi].MaxSize, Item[this.key].textarea[Thi].UpButtonDom.id, Item[this.key].textarea[Thi].UpBlobDom.id, 'FieldData'+Item[this.key].textarea[Thi].id)
									// 唯一id, 上传URL, 最大大小, 按钮id, 进度id, 返回数据处理id
								}
							}
							for (var i = 0; i < Item[this.key].btr.getElementsByClassName('field_div').length ; ++i)
							{
									Item[this.key].btr.getElementsByClassName('field_div')[i].style.display = 'none';
							}
						}
						else if(type != 'edit')
						{
							for (key in Item[this.key].textarea )
							{

								if(typeof(Item[this.key].textarea[key].input_font) == 'object') Item[this.key].textarea[key].parentNode.removeChild(Item[this.key].textarea[key].input_font);
  								Item[this.key].textarea[key].parentNode.removeChild(Item[this.key].textarea[key]);
							}
						    Item[this.key].textarea = new Array();
							for (var i = 0; i < Item[this.key].btr.getElementsByTagName('div').length ; ++i)
							{
								Item[this.key].btr.getElementsByTagName('div')[i].style.display = 'block';
							}
						}

					}
				}
			}
			else
			{
				// 把操作的那块TD去掉
			    this.Item[i].btr.removeChild(this.Item[i].btr.childNodes[0]);
				if(!this.htr.del)this.htr.removeChild(this.htr.childNodes[0]);
				this.htr.del = true;	// 已删掉
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
					/*
					if(this.MoreContent && this.marked == false) 
					{
						for (var i = 0; i < Item[this.key].btr.getElementsByTagName('div').length ; ++i)
						{
							if(Item[this.key].arr[i] != null && Item[this.key].arr[i].length > TableResultContentLimit)
							{
								C(Item[this.key].btr.getElementsByTagName('div')[i], '', {'height':'auto'});
								Item[this.key].btr.getElementsByTagName('div')[i].innerHTML = HTMLEnCode(Item[this.key].arr[i].substr(0,TableResultContentLimit)) + '...';
							}
						}
					}*/
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

					if(this.MoreContent && this.marked == true) 
					{
						if (!this.MaxHeight)
						{
							var HeightArr = [];
							for (var i = 0; i < Item[this.key].btr.getElementsByClassName('field_div').length ; ++i)
								HeightArr.push(Item[this.key].btr.getElementsByClassName('field_div')[i].scrollHeight);
							HeightArr.sort(function SortNumber(a, b){
								return a-b;
							});
							this.MaxHeight = HeightArr[HeightArr.length-1];
						}

						for (var i = 0; i < Item[this.key].btr.getElementsByClassName('field_div').length ; ++i)
						{
							if(Item[this.key].arr[i] != null  && Item[this.key].arr[i].length > TableResultContentLimit)
							{
								C(Item[this.key].btr.getElementsByClassName('field_div')[i], '', {'height':this.MaxHeight - 8 + 'px'});
								Item[this.key].btr.getElementsByClassName('field_div')[i].innerHTML = HTMLEnCode(Item[this.key].arr[i]);
							}
						}
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
		
		if(empty)
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
				C('span','In',' &nbsp; &nbsp; ' + L.SelectItems + ' : '),
				this.ActionTr.edit,
				this.ActionTr.del,
				this.ActionTr.save
				));
			}
			this.ActionTr.td.className = 'ActionTd';
			this.ActionTr.td.colSpan = ThItemSum + 1;
			this.ActionTr.td.align = 'left';
			this.ActionTr = C(this.ActionTr,'In', this.ActionTr.td);

			this.table_tfoot.appendChild(this.ActionTr);

			this.table.appendChild(this.table_thead);
			this.table.appendChild(this.table_tbody);
			this.table.appendChild(this.table_tfoot);

			this.list.appendChild(this.table);
		}

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
				'MenuId':'AmysqlTableDataMenu', 'AreaDomID':'TableDataBlock',
				'MenuList':[
					{'id':'edit', 'name':L.Edit, 'KeyCodeTag':'E', 'ico':'ico_edit2', 'functions':function (){
						o.Item[o.RightButtonRow].edit.onclick('edit');
					}},
					{'id':'EditAll', 'name':L.EditSelectEdit, 'functions':function (){
						o.ActionTr.edit.onclick('edit');
					}},
					{'className':'separator'},
					{'id':'saves', 'name':L.Save, 'KeyCodeTag':'S', 'ico':'ico_save2', 'functions':function (){
						o.ActionTr.save.onclick();
					}},
					{'id':'SaveToNew', 'name':L.SaveTonNewRow, 'functions':function (){
						o.ActionTr.SaveToNew();
					}},
					{'className':'separator'},
					{'id':'del', 'name':L.Del, 'KeyCodeTag':'D', 'ico':'ico_del2', 'functions':function (){
						o.Item[o.RightButtonRow].del.onclick();
					}},			
					{'id':'DelAll', 'name':L.DelSelectRow, 'functions':function (){
						o.ActionTr.del.onclick();
					}},	
					{'className': 'separator'},
					{'id':'CancelEdit', 'name':L.CanceledEdit, 'KeyCodeTag':'C', 'functions':function (){
						o.ActionTr.edit.onclick('CancelEdit');
					}},
					{'id':'CancelSelect', 'name':L.CancelSelectRow, 'functions':function (){
						o.ActionTr.NoAllSelect.onclick();
					}},
					{'className':'separator'},
					{'id':'renovate', 'name':L.ReloadPageData, 'KeyCodeTag':'R', 'ico':'ico_renovate2', 'functions':function (){
						SqlSubmitFormObject.sql_post.value = SqlSubmitFormObject.SqlformoOriginal.value;
						G("SqlForm").onsubmit(parseInt(G("SqlformPage").value)) 
					}},
				],
				'initial': function ()	// 菜单初始化函数
				{
					var EditSum = 0;	// 数据表是否有编辑项
					for (var k in o.Item )
					{
						if(o.Item[k].textarea.length > 0)
						{
							EditSum = 1;
							break;
						}
					}
					var ActionSet = o.RightButtonRow != null ? true : false;		// 是否能操作

					this.get('edit').className = (CanEdit && ActionSet) ? 'item' : 'item2';
					this.get('del').className = (CanEdit && ActionSet) ? 'item' : 'item2'; 
					this.get('CancelEdit').className = (CanEdit && EditSum) ? 'item' : 'item2'; 
					this.get('saves').className = (CanEdit && EditSum) ? 'item' : 'item2'; 
					this.get('SaveToNew').className = (CanEdit && EditSum) ? 'item' : 'item2'; 
					
					// 计算是否有选择的记录
					this.get('EditAll').className = (CanEdit && ActionSet) ? 'item' : 'item2'; 
					this.get('DelAll').className = (CanEdit && ActionSet) ? 'item' : 'item2'; 

				},
				'close':function ()
				{
					o.RightButtonRow = null;		// 表格数据右击菜单标识清空
				}
			});
		})
		(this);
	}

	this.Menu();
	
}
