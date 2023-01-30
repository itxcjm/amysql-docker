/************************************************
 *
 * Amysql AMS
 * Amysql.com 
 * @param Object 
 * AmysqlTableAdd  
 *
 */
var AmysqlTableAddObject;

//*****************************************
ExtendArray.push({
	'_Events':[
		{'_Event':
			{'load':function ()
				{
					// 新建表
					AmysqlTableAddObject = new AmysqlTableAdd();
					NavigationObject.add({
						'id':'N_TableAdd', 'text':L.TableAdd, 'defaults':false, 'content':'AmysqlTableAddForm', 
						'functions':function ()
						{
							AmysqlTableAddObject.show();
						}
					});
					// End **

				}
			},
		'_EventObj':window
		}
	],
	'_ExtendInfo':{
			'ExtendId':'TableAdd',
			'ExtendName':L.TableAdds,
			'ExtendAbout':L.TableAddsAbout,
			'Version':'1.00',
			'Date':'2012-04-06',
			'WebSite':'https://amh.sh',
			'PoweredBy':'Amysql'
	}
})
// ExtendArray End *****************

// 新增数据表
var AmysqlTableAdd = function ()
{
	this.AmysqlTableAddForm = C('form', {'id':'AmysqlTableAddForm'});
	this.Iline = new Array();																		// 数据行
	this.Ilist = C('div', {'id':'AmysqlTableAdd'});													// 表格块

	this.AddTableName = C('input', {'type':'text'});
	this.AddTableComment = C('input', {'type':'text'});
	this.AddTableEngines = C(CreatesSelect(StorageEngines));
	this.AddTableCollations = C(CreatesSelect(Collations));
	this.TIsubmit = C('input', {'type':'Submit', 'value':L.Save});

	this.AddTableLineText = C('input', {'type':'text', 'value':'1'}, {'width':'30px'});
	this.AddTableLine = C('input', {'type':'button', 'value':L.Add});
	this.SetLineAddTitleText = C('input', {'type':'text', 'value':5, 'id':'SetLineAddTitleText'});	//	多少记录显示标题
	this.SetLineNumText = C('input', {'type':'text', 'value': 3, 'id':'SetLineNum'});				//	插入记录条数
	this.SetLineNumButton = C('input', {'type':'button', 'value':L.Set});
	this.SetStatus = false;																			// 焦点是否在设置行的那一块
	this.RightButtonRow = null;																		// 当前右键记录
	this.RightButtonRowTab = null;																		
	this._IfShow = false;

	C(DatabaseMainObject.ContentBlock, 'In', C(this.AmysqlTableAddForm, 'In', this.Ilist));

	this.hide = function ()
	{
		this.AmysqlTableAddForm.style.display = 'none';
	}
	
	// 增加标题
	this.add_title = function ()
	{
		var htr = C('tr');
		C(htr, 'In', C('th'));
		for (key in  this.IItem)
		{
 			C(htr, 'In', C('th', {'innerHTML':this.IItem[key].name,'title':this.IItem[key].title ? this.IItem[key].title : ''}));
		}
 		this.table_tbody.appendChild(htr);
	}

	// 增加字段行
	this.add_line = function (i)
	{
		
		this.Iline[i] = C('tr');
		this.Iline[i].key = i;			

		this.Iline[i].del = C('a', {'innerHTML':L.Del, 'className':'ico2 ico_del2','title':L.DelThisField});
		with(this)
		{
			(function (obj)
			{
				obj.del.onclick = function ()
				{
					if(obj.IInput['Field'].value != '' || obj.IInput['ColumnTypes'].ColumnLength.value != '' || obj.IInput['Default'].ValueInput.value != '' || obj.IInput['Comment'].value != '')  
					{
						if(!confirm(L.RemoveFieldRow)) 
							return false;
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
		for (var key in this.IItem)
		{
			if(typeof(this.Iline[i].IInput) != 'object') this.Iline[i].IInput = {};
			
			var k = this.IItem[key].id;
			this.Iline[i].IInput[k] = {};


			switch (k)
			{
				case 'Field':
					this.Iline[i].IInput[k] = C('input', {'type':'text'});
				break;
				case 'ColumnTypes':
					this.Iline[i].IInput[k] = C('span');
					this.Iline[i].IInput[k].ColumnTypes = C(CreatesSelect(ColumnTypes), '', {'width':'150px'});
					this.Iline[i].IInput[k].ColumnLength = C('input' , {'type':'text'}, {'width':'50px'});
					C(this.Iline[i].IInput[k], 'In', new Array(this.Iline[i].IInput[k].ColumnTypes, C('i', 'In', ' - '),this.Iline[i].IInput[k].ColumnLength));
				break;
				case 'Collations':
					this.Iline[i].IInput[k] = C(CreatesSelect(Collations), '', {'width':'170px'});
					this.Iline[i].IInput[k].disabled = true;
				break;
				case 'Null':
					this.Iline[i].IInput[k] = C('input', {'type':'checkbox'});
				break;
				case 'Default':
					this.Iline[i].IInput[k] = C('span');
					this.Iline[i].IInput[k].NullInput = C('input', {'type':'checkbox'});
					this.Iline[i].IInput[k].ValueInput = C('input',  {'type':'text'});
					C(this.Iline[i].IInput[k], 'In', new Array(C('i', 'In', 'NULL:'), this.Iline[i].IInput[k].NullInput,this.Iline[i].IInput[k].ValueInput));
				break;
				case 'AUTO_INCREMENT':
					this.Iline[i].IInput[k] = C('input', {'type':'checkbox'});
				break;
				case 'TextOperators':
					this.Iline[i].IInput[k] = C(CreatesSelect(TextOperators), '', {'width':'170px'});
				break;
				case 'Comment':
					this.Iline[i].IInput[k] = C('input', {'type':'text'});
				break;
				case 'ColumnIndex':
					this.Iline[i].IInput[k] = C(CreatesSelect(ColumnIndex), '',{'width':'100px'});
				break;
			
			}
			

			C(this.Iline[i], 'In', C('td', 'In', this.Iline[i].IInput[k]));
		}

		(function (o)
		{
			o['ColumnTypes'].ColumnTypes.onchange = function ()
			{
				var c = this.options[this.selectedIndex].parentNode.getAttribute('label') // 大分类
				if(c == 'NUMERIC' || this.value == 'INT' ||  c == 'DATE and TIME'  || this.value == 'DATE')
				{
					o['Collations'].value = '';
					o['Collations'].disabled = true;
				}
				else
					o['Collations'].disabled = false;

				if(c == 'DATE and TIME' || this.value == 'DATE')
				{
					o['ColumnTypes'].ColumnLength.value = '';
					o['ColumnTypes'].ColumnLength.disabled = true;
				}
				else
					o['ColumnTypes'].ColumnLength.disabled = false;
			}

			o['Default'].NullInput.onclick = function ()
			{
				if(this.checked) 
				{
					o['Null'].checked = true;
					o['Default'].ValueInput.value = '';
				}
			}
			o['Default'].ValueInput.onkeyup = function ()
			{
				if(this.value != '') o['Default'].NullInput.checked = false;
			}
			o['Null'].onclick = function ()
			{
				if(!this.checked) o['Default'].NullInput.checked = false;
			}

		})
		(this.Iline[i].IInput);

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
			Iline[i].onmousedown = function (event)
			{
				// 划拉选择处理
				event = event? event:window.event;
				if(event.button == 2) RightButtonRow = this.key;
			}
			Iline[i].onmouseup = function (event)
			{
				// 划拉选择处理
				event = event? event:window.event;
				if(event.button == 2 || (!document.all && event.button == 1) || event.button == 4) 
				{
					return;			// 禁止右键、中键划拉选择
				}
			}
		}

		if(i%2) this.Iline[i].className = 'odd';
		this.table_tbody.appendChild(this.Iline[i]);

	}

	// 显示加载
	this.show = function (NewAdd)
	{
		if (NewAdd)	// 重置提醒
		{
			var end = false;
			for (var dk in  this.Iline)
			{
				var obj = this.Iline[dk];
				if(obj.IInput['Field'].value != '' || obj.IInput['ColumnTypes'].ColumnLength.value != '' || obj.IInput['Default'].ValueInput.value != '' || obj.IInput['Comment'].value != '')  
				{
					if(!confirm(L.ConfirmResetField))  
					{
						this.SetLineNumText.blur();
						this.SetLineAddTitleText.blur();
						return false;
					}
					break;
				}
			}
		}

		if(this._IfShow && !NewAdd) return;
 		this.IItem = [{'id':'Field', 'name':L.FieldName}, {'id':'ColumnTypes', 'name':L.Type}, {'id':'Collations', 'name':L.Collations}, {'id':'Null', 'name':L.AllowNull}, {'id':'Default', 'name':L.DefaultVal}, {'id':'AUTO_INCREMENT', 'name': L.AUTO_INCREMENT, 'title':'AUTO_INCREMENT'}, {'id':'TextOperators', 'name':L.Attribute}, {'id':'Comment', 'name':L.Comment}, {'id':'ColumnIndex', 'name':L.Index}];
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
						C('font', 'In', new Array(C('font', 'In', ' &nbsp; ' + L.ResetField + ': '), this.SetLineAddTitleText, C('font', 'In', ' ' + L.AddLineTitle + ','))),
						C('font', 'In', ' ' + L.SetFieldNumber + ' : '),
						this.SetLineNumText,	
						this.SetLineNumButton
					));
	
		this._IfShow = true;	// 已运行
		this.AmysqlTableAddForm.style.display = 'block';
		this.Ilist.innerHTML = '';
		this.table = C('table', {'className':'table'});	// 表格
		this.table_thead = C('thead');					// 表格头部
		this.table_tbody = C('tbody');					// 表格内容
		this.table_tfoot = C('tfoot');					// 表格底部
		this.ActionTr =  C('tr');						// 操作的TR

 		for (var i = 0; i < this.SetLineNumText.value; ++i)
		{
			if(i%this.SetLineAddTitleText.value == 0) this.add_title();		// 每6行加个标题
			this.add_line(i);												// 增加一行
		}

		this.ActionTr.td = C('td','In','');
		this.ActionTr.td.className = 'ActionTd';
		this.ActionTr.td.colSpan = this.IItem.length + 1;

		C(this.ActionTr.td, 'In', [C('font', 'In', L.AddField + ': '), this.AddTableLineText , this.AddTableLine, this.SetLine, C('br'),C('br'), C('font', 'In', L.TableName + ' : '), this.AddTableName,  C('font', 'In', ' ' + L.Engines + ' : '), this.AddTableEngines,  C('font', 'In', '&nbsp;' + L.Collations + ' : '), this.AddTableCollations, C('font', 'In', '&nbsp;' + L.Comment + ' : '),  this.AddTableComment, C('br'),C('p' , 'In', this.TIsubmit)]);

		this.ActionTr.appendChild(this.ActionTr.td);
		this.table_tfoot.appendChild(this.ActionTr);
		
		C(this.table, 'In', [this.table_thead, this.table_tbody, this.table_tfoot]);
		this.Ilist.appendChild(this.table);


		with(this)
		{
			table.onkeydown = function (event)	// 避免输入文本框右击菜单的快捷键字母
			{
				event = event? event:window.event;
				if((event.keyCode == 69  || event.keyCode == 83 || event.keyCode == 68  || event.keyCode == 67 || event.keyCode == 82 || event.keyCode == 84 ) && (RightButtonRow != null || RightButtonRowTab != null))
					return false;
			}
		}

	}

	with(this)
	{
		// 增加字段
		AddTableLine.onclick = function (line)
		{
			var sum = (typeof(line) == 'number') ? line : AddTableLineText.value;
			for (var i=0; i<sum; i++)
			{
				add_line(Iline.length);
			}
			
		}
		// 重置字段
		SetLineNumButton.onclick = function ()
		{
 			show(true);
		}

		AmysqlTableAddForm.onsubmit = function ()
		{
			// 字段重置 **************************
			if (AmysqlTableAddObject.SetStatus)
			{
				AmysqlTableAddObject.show(true);
				AmysqlTableAddObject.SetStatus = false;
				return false;
			}
			
			// 提交保存 **************************
			if(AddTableName.value == '')
			{
				alert(L.TableNameNotEmpty);
				AddTableName.focus();
				return false;
			}
			
			var SqlArr = [];
			var Index = {};
			Index.PRIMARYArr = [];
			Index.PRIMARYArr.name = 'PRIMARY KEY';
			Index.INDEXArr = [];
			Index.INDEXArr.name = 'INDEX';
			Index.UNIQUEArr = [];
			Index.UNIQUEArr.name = 'UNIQUE ';
			Index.FULLTEXTArr = [];
			Index.FULLTEXTArr.name = 'FULLTEXT';

			for (var key in Iline)
			{
				if(Iline[key].IInput['Field'].value != '')
				{
					var FieldName = Iline[key].IInput['Field'].value.replace(/`/g, '``');
					var ColumnLength_SQL = (Iline[key].IInput['ColumnTypes'].ColumnLength.value == '') ? '' : "( " + Iline[key].IInput['ColumnTypes'].ColumnLength.value + " ) ";
					var COLLATE_SQL = (Iline[key].IInput['Collations'].value != '' ) ? ' CHARACTER SET ' + Iline[key].IInput['Collations'].options[Iline[key].IInput['Collations'].selectedIndex].parentNode.getAttribute('label') +  ' COLLATE ' + Iline[key].IInput['Collations'].value : '';
					var NULL_SQL = (Iline[key].IInput['Null'].checked) ? ' NULL ' : ' NOT NULL ';
					var DEFAULT_STR = (Iline[key].IInput['ColumnTypes'].ColumnTypes.value == 'TIMESTAMP' && Iline[key].IInput['Default'].ValueInput.value == 'CURRENT_TIMESTAMP') ?  Iline[key].IInput['Default'].ValueInput.value : "'" + Iline[key].IInput['Default'].ValueInput.value + "'";
					var DEFAULT_SQL = (Iline[key].IInput['Default'].NullInput.checked) ? ' DEFAULT NULL ' :  ((Iline[key].IInput['Default'].ValueInput.value != '') ? " DEFAULT " + DEFAULT_STR : '');
					
					var AUTO_INCREMENT_SQL = '';
					if (Iline[key].IInput['AUTO_INCREMENT'].checked)
					{
						var AUTO_INCREMENT_SQL = ' AUTO_INCREMENT ';
						Index.PRIMARYArr.push(FieldName);
					}
					var COMMENT_SQL = (Iline[key].IInput['Comment'].value != '')? ' COMMENT \'' + Iline[key].IInput['Comment'].value + '\'' : '';
					var PROPERTY_SQL = (Iline[key].IInput['TextOperators'].value != '') ?  ' ' + Iline[key].IInput['TextOperators'].value : '';
					
					var SqlLine = "`" + FieldName + "` " +  Iline[key].IInput['ColumnTypes'].ColumnTypes.value + ColumnLength_SQL + PROPERTY_SQL + COLLATE_SQL +  NULL_SQL + DEFAULT_SQL + AUTO_INCREMENT_SQL + COMMENT_SQL;
					
					if (Iline[key].IInput['ColumnIndex'].value != '')
					{
						if (Iline[key].IInput['ColumnIndex'].value == 'PRIMARY')
							Index.PRIMARYArr.push('`' + FieldName + '`');
						else if (Iline[key].IInput['ColumnIndex'].value == 'UNIQUE')
							Index.UNIQUEArr.push('`' + FieldName + '`');
						else if (Iline[key].IInput['ColumnIndex'].value == 'INDEX')
							Index.INDEXArr.push('`' + FieldName + '`');
						else if (Iline[key].IInput['ColumnIndex'].value == 'FULLTEXT')
							Index.FULLTEXTArr.push('`' + FieldName + '`');
					}
					SqlArr.push(SqlLine);
				}
			}
			
			if(SqlArr.length == 0)
			{
				alert(L.NoField);
				Iline[0].IInput['Field'].focus();
				return false;
			}

			// 字段行
			var sql = 'CREATE TABLE `' + SqlKeyword(DatabaseName) + '`.`' + SqlKeyword(AddTableName.value) + '`' + "(\n" + SqlArr.join(",\n") + " \n";
			
			// 索引行
			for (var Ik in Index)
			{
				if(Index[Ik].length > 0)
					sql += ",\n" + Index[Ik].name + '(' + Index[Ik].join(',') + ')';
			}
			// 表修饰
			sql += " ) ENGINE = " + AddTableEngines.value;
			if(AddTableComment.value != '') sql += " COMMENT = '" + AddTableComment.value.replace(/\'/g, "''") + "'";
			if(AddTableCollations.value != '' )  sql += ' CHARACTER SET ' + AddTableCollations.options[AddTableCollations.selectedIndex].parentNode.getAttribute('label') +  ' COLLATE ' + AddTableCollations.value ;


			SqlSubmitFormObject.ConfirmSqlSubmit(null, sql);
			ActiveSetID = 'N_TableAdd';	// 激活本版块	
			return false;	// 借助SqlForm表单来提交 返回false本表单不提交
		}
	}


	// 右键菜单
	this.Menu = function ()
	{
		(function (o)
		{
			AmysqlMenuObject.add(
			{
				'MenuId':'AmysqlTableAddFormMenu', 'AreaDomID':'AmysqlTableAddForm',
				'MenuList':[
					{'id':'TAedit', 'name':L.AddAField, 'ico':'ico_edit2', 'functions':function (){
						o.AddTableLine.onclick(1);
					}},
					{'id':'TAdel', 'name':L.Del, 'KeyCodeTag':'D', 'ico':'ico_del2', 'functions':function (){
						o.Iline[o.RightButtonRow].del.onclick();
					}},					
					{'className':'separator'},
					{'id':'TAsaves', 'name':L.Save, 'KeyCodeTag':'S', 'ico':'ico_save2', 'functions':function (){
						o.SetStatus = false;
						o.AmysqlTableAddForm.onsubmit();
					}},
					{'className': 'separator'},
					{'id':'TArenovate', 'name':L.ResetField, 'KeyCodeTag':'R', 'ico':'ico_renovate2', 'functions':function (){
						o.SetLineNumButton.onclick();
					}},
				],
				'initial': function ()	// 菜单初始化函数
				{
					o.RightButtonRowTab = true;
					this.get('TAsaves').className = o.AddTableName.value != '' ? 'item' : 'item2'; 
					this.get('TAdel').className = o.RightButtonRow != null ? 'item' : 'item2'; 
				},
				'close':function ()
				{
					o.RightButtonRow = null;		// 表格数据右击菜单标识清空
					o.RightButtonRowTab = null;
				}
			});
		})
		(this);
	}

	this.Menu();


}