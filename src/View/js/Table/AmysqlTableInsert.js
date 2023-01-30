/************************************************
 *
 * Amysql AMS
 * Amysql.com 
 * @param Object 
 * AmysqlTableInsert  
 *
 */
var TableInsertObject;

//*****************************************
ExtendArray.push({
	'_Events':[
		{'_Event':
			{'load':function ()
				{
					// 表插入数据 
					TableInsertObject = new TableInsert();
					NavigationObject.add({
						'id':'N_insert', 'text':L.Insert, 'defaults':DefaultActive.TableInsert, 'content':'TableInsertForm', 
						'functions':function ()
						{
							TableInsertObject.show();
						}
					});
					// End **

					// 结构更新时重新加载
					StructureUpdateRun.push(
						function ()
						{
							TableInsertObject._IfShow = false;
						}	
					);
				}
			},
		'_EventObj':window
		}
	],
	'_ExtendInfo':{
			'ExtendId':'TableInsert',
			'ExtendName':L.TableInsertData,
			'ExtendAbout':L.TableInsertDataAbout,
			'Version':'1.00',
			'Date':'2012-04-06',
			'WebSite':'https://amh.sh',
			'PoweredBy':'Amysql'
	}
})
// ExtendArray End *****************

// 新增表格数据 
var TableInsert = function ()
{
	this.TableInsertForm = C('form', {'id':'TableInsertForm'});
	this.Iline = new Array();								// 数据行
	this.Ilist = C('div', {'id':'TableInsert'});			// 表格块
	this.TIsubmit = C('input', {'type':'Submit', 'value':L.Save});
	this.SetLineAddTitleText = C('input', {'type':'text', 'value':6, 'id':'SetLineAddTitleText'});	//	多少记录显示标题
	this.SetLineNumText = C('input', {'type':'text', 'value': 1, 'id':'SetLineNum'});					//	插入记录条数
	this.SetLineNumButton = C('input', {'type':'button', 'value':L.Resets2});
	this.SetStatus = false;						// 焦点是否在设置行的那一块
	this._IfShow = false;

	C(TableMainObject.ContentBlock, 'In', C(this.TableInsertForm, 'In', this.Ilist));

	this.hide = function ()
	{
		this.TableInsertForm.style.display = 'none';
	}
	
	with(this)
	{
		this.SetLineNumButton.onclick = function ()
		{
 			show(true);
		}
	}
	this.add_title = function ()
	{
		var htr = C('tr');
		C(htr, 'In', C('th'));
		for (key in  this.IItem)
		{
 			C(htr, 'In', C('th', 'In',this.IItem[key].COLUMN_NAME));
		}
 		this.table_tbody.appendChild(htr);
		var htr = C('tr');
		C(htr, 'In', C('td'));
		for (key in  this.IItem)
		{
			var Length = (this.IItem[key].Length != '') ? ' (' + this.IItem[key].Length + ')' : '';
 			C(htr, 'In', C('td', 'In',this.IItem[key].DATA_TYPE +  Length));
		}
		this.table_tbody.appendChild(htr);
	}
	this.show = function (NewAdd)
	{
		if (NewAdd)	// 重置提醒
		{
			var end = false;
			for (var dk in  this.Iline)
			{
				for (var dki in  this.IItem)
				{
					if(this.Iline[dk].IInput[dki].type == 'text' && this.Iline[dk].IInput[dki].value != '' && this.Iline[dk].IInput[dki].value != this.IItem[dki].COLUMN_DEFAULT)  
					{
						if(!confirm(L.ConfirmResetLine))  
						{
							this.SetLineNumText.blur();
							this.SetLineAddTitleText.blur();
							return false;
						}
						end = true;
						break;
					}
				}
				if(end) break;
			}
		}


		if(this._IfShow && !NewAdd) return;
 		this.IItem = TableFieldList;
		this.Iline = new Array();
		// 状态设置 在设置块回车提交就更新行数
		with (this)
		{
			SetLineNumText.onclick = function ()
			{
				SetStatus = true;
			}
			SetLineNumText.onblur = function ()
			{
				SetStatus = false;
			}
			SetLineAddTitleText.onclick = function ()
			{
				SetStatus = true;
			}
			SetLineAddTitleText.onblur = function ()
			{
				SetStatus = false;
			}
		}
		
		this.SetLine = C('font', 'In', new Array(
						C('font', 'In', printf(L.InsertAddTitle, {'line':this.SetLineAddTitleText}, 'font')),
						C('font', 'In', ' ' + L.InsertRowNumber + ' : '),
						this.SetLineNumText,	
						this.SetLineNumButton
					));
	
		this._IfShow = true;	// 已运行
		this.TableInsertForm.style.display = 'block';
		this.Ilist.innerHTML = '';
		this.table = C('table', {'className':'table'});	// 表格
		this.table_thead = C('thead');					// 表格头部
		this.table_tbody = C('tbody');					// 表格内容
		this.ActionTr =  C('tr');						// 操作的TR

 		for (var i = 0; i < this.SetLineNumText.value; ++i)
		{
			if(i%this.SetLineAddTitleText.value == 0) this.add_title();				// 每6行加个标题
			this.Iline[i] = C('tr');
			this.Iline[i].key = i;			

			this.Iline[i].del = C('a', {'innerHTML':L.Del, 'className':'ico2 ico_del2','title':L.DelThisRow});
			with(this)
			{
				(function (obj)
				{
					obj.del.onclick = function ()
					{
					
						for (key2 in obj.IInput )	// 已输入新数据 就提示是否移除
						{
							if(obj.IInput[key2].value != '' && obj.IInput[key2].value != IItem[key2].COLUMN_DEFAULT) 
							{
								if(!confirm(L.ConfirmRemoveLine))
									return false;
								break;
							}
						}
						
						obj.parentNode.removeChild(obj);
						Iline.splice(obj.key, 1);
						// 删除后更新key
						var _i = 0;
						for (var tk in Iline )
						{
							Iline[tk].key = _i;
							++_i;
						}
					}
				})
				(this.Iline[i])
			}

			C(this.Iline[i], 'In', C('td', 'In', this.Iline[i].del));
			for (key in  this.IItem)
			{
				if(typeof(this.Iline[i].IInput) != 'object') this.Iline[i].IInput = new Array();
				this.Iline[i].IInput[key] = (this.IItem[key].DATA_TYPE == 'text') ? C('textarea', {'className':'insert_textarea'}) : ((this.IItem[key].DATA_TYPE == 'int') ? C('input', {'className':'insert_input_int'}) : C('input', {'className':'insert_input'}));
				this.Iline[i].IInput[key].value = is_null(this.IItem[key].COLUMN_DEFAULT) ? '' : this.IItem[key].COLUMN_DEFAULT;

				(function (obj, key)
				{
					if(is_null(TableFieldList[key].COLUMN_DEFAULT) && TableFieldList[key].IS_NULLABLE == 'YES')	// 默认为空时加个复选框
					{
						obj.input_null = C('input', {'type':'checkbox'});
						obj.input_null.onclick = function ()
						{
							if (this.checked)
								obj.value = '';
							else
							{
								if(obj.value == '' && TableFieldList[key].DATA_TYPE == 'int') this.checked = true;
							}
						}
						obj.input_font = C('font', 'In', new Array(C('I', 'In', 'NULL: ') , obj.input_null));
						
					}

					obj.onkeyup = function ()	// 文本框为空与字段为Int类型时 勾选上框
					{	
						if(typeof(obj.input_null) == 'object')
						{
							if(TableFieldList[key].DATA_TYPE == 'int') 
								obj.input_null.checked = (obj.value == '') ? true : false; 
							else 
								if(obj.value != '') obj.input_null.checked = false;
						}
					}
					if(IsTimeType(TableFieldList[key].DATA_TYPE)) 
					{
						obj.onclick = function ()
						{
							WdatePicker({dateFmt:IsTimeType(TableFieldList[key].DATA_TYPE)});
						}
					}
				})
				(this.Iline[i].IInput[key], key)

				C(this.Iline[i], 'In', C('td', 'In', (typeof(this.Iline[i].IInput[key].input_font) == 'object')  ? new Array(this.Iline[i].IInput[key].input_font, this.Iline[i].IInput[key])  : this.Iline[i].IInput[key]));
			}
			this.table_tbody.appendChild(this.Iline[i]); 

			
			
			
			this.Iline[i].marked = false;

			// 增加事件
			with(this)
			{
				Iline[i].onmouseover = function ()
				{
					this.className = (this.className != '') ?  this.className + ' onmouseover' : 'onmouseover';
				}
				Iline[i].onmouseout = function ()
				{
					var temp_obj = this;
					setTimeout(function ()
					{
						temp_obj.className = temp_obj.className.replace(/onmouseover/, '');
					}, 50);
				}
			}

			if(i%2) this.Iline[i].className = 'odd';
			this.table_tbody.appendChild(this.Iline[i]);

		}

		this.ActionTr.td = C('td','In','');
		this.ActionTr.td.className = 'ActionTd';
		this.ActionTr.td.colSpan = this.IItem.length + 1;
		
		C(this.ActionTr.td, 'In', [this.SetLine, this.TIsubmit]);

		this.ActionTr.appendChild(this.ActionTr.td);
		this.table_tbody.appendChild(this.ActionTr);
		
		this.table.appendChild(this.table_thead);
		this.table.appendChild(this.table_tbody);
		this.Ilist.appendChild(this.table);

		// 勾选NULL框 兼容IE6
		for (i in this.Iline)
		{
			for (key in this.Iline[i].IInput)
			{
				if(typeof(this.Iline[i].IInput[key].input_null) == 'object') this.Iline[i].IInput[key].input_null.checked = true;
			}
			
		}

		with(this)
		{
			table_tbody.onkeydown = function (event)	// 避免输入文本框右击菜单的快捷键字母
			{
				event = event? event:window.event;
				if((event.keyCode == 69  || event.keyCode == 83 || event.keyCode == 68  || event.keyCode == 67 || event.keyCode == 82 || event.keyCode == 84 ) && RightButtonRow != null)
				return false;
			}
		}
	}

	this.TableInsertForm.onsubmit = function ()
	{
		if (TableInsertObject.SetStatus)
		{
			TableInsertObject.show(true);
			TableInsertObject.SetStatus = false;
			return false;
		}
		
		var Field_all = new Array();	// 所有字段
		var Value_all_sql = new Array();
		for (key in TableInsertObject.Iline )
		{
			var Value_all = new Array();	// 一行所有值
			for (i in TableInsertObject.Iline[key].IInput)
			{
				if(key == 0) Field_all.push(TableInsertObject.IItem[i].COLUMN_NAME.replace(/`/g, '``'));
				if (typeof(TableInsertObject.Iline[key].IInput[i].input_null) == 'object' && TableInsertObject.Iline[key].IInput[i].input_null.checked)
					Value_all.push('NULL');
				else
					Value_all.push((TableInsertObject.IItem[i].DATA_TYPE == 'int' || (TableInsertObject.IItem[i].DATA_TYPE == 'timestamp' && TableInsertObject.Iline[key].IInput[i].value == 'CURRENT_TIMESTAMP')) ? TableInsertObject.Iline[key].IInput[i].value :  "'" + TableInsertObject.Iline[key].IInput[i].value.replace("'", "''") + "'" );
			}
			Value_all_sql.push('(' + Value_all.join(',') + ')');	// 组成sql
			
		}
		var sql = 'INSERT INTO `' + DatabaseName + '`.`' + TableName + '` (`' + Field_all.join('`,`') + '`) VALUES ' + Value_all_sql.join(', ');
		SqlSubmitFormObject.ConfirmSqlSubmit(null, sql);
		NavigationObject.ActiveSet(NavigationObject.Item['N_browse']);
		return false;	// 借助SqlForm表单来提交 返回false本表单不提交
	}

	// 右键菜单
	this.Menu = function ()
	{
		(function (o)
		{
			AmysqlMenuObject.add(
			{
				'MenuId':'TableInsertFormMenu', 'AreaDomID':'TableInsertForm',
				'MenuList':[
					{'id':'TIedit', 'name':L.Save, 'KeyCodeTag':'S', 'ico':'ico_save2', 'functions':function (){
						o.TableInsertForm.onsubmit();
					}},
					{'className': 'separator'},
					{'id':'TArenovate', 'name':L.ResetLine, 'KeyCodeTag':'R', 'ico':'ico_renovate2', 'functions':function (){
						o.SetLineNumButton.onclick();
					}},
				],
				'initial': function ()	// 菜单初始化函数
				{
					o.RightButtonRow = true;
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