/************************************************
 *
 * Amysql AMS
 * Amysql.com 
 * @param Object 
 * AmysqlTableSearch  
 *
 */

var TableSearchObject;

//*****************************************

ExtendArray.push({
	'_Events':[
		{'_Event':
			{'load':function ()
				{
					// 表搜索数据 
					TableSearchObject = new TableSearch();
					NavigationObject.add({
						'id':'N_search', 'text':L.Search, 'defaults':DefaultActive.TableSearch, 'content':'TableSearchForm', 
						'functions':function ()
						{
							TableSearchObject.show();
						}
					});
					// End **
					
					// 结构更新时重新加载
					StructureUpdateRun.push(
						function ()
						{
							TableSearchObject._IfShow = false;
						}	
					);
				}
			},
		'_EventObj':window
		}
	],
	'_ExtendInfo':{
			'ExtendId':'TableSearch',
			'ExtendName':L.SearchTable,
			'ExtendAbout':L.SearchTableAbout,
			'Version':'1.00',
			'Date':'2012-04-06',
			'WebSite':'https://amh.sh',
			'PoweredBy':'Amysql'
	}
})
// ExtendArray End *****************


// 表格数据搜索
var TableSearch = function ()
{
	this.TableSearchForm = C('form', {'id':'TableSearchForm', 'target':'GetTableData', 'method':'POST'});
	this.Slist =  C('div', {'id':'TableSearch'});			// 表格块
	this.TSsubmit = C('input', {'type':'Submit', 'value':L.Search});
	this.TSPage = C('input', {'type':'hidden', 'name':'page', 'value':'1'});
	this.TSSql = C('input', {'type':'hidden', 'name':'sql'});
	this._IfShow = false;
	this.StartTr = null;	// 开始的Tr
	this.EndTr = null;		// 结束的Tr
	this.SEstatus = false;
	this.RightButtonRow = null;

	C(TableMainObject.ContentBlock, 'In', C(this.TableSearchForm, 'In', [this.Slist, this.TSSql, this.TSPage]));

	this.hide = function ()
	{
		this.TableSearchForm.style.display = 'none';
	}
	this.show = function ()
	{
		if(this._IfShow) return;
		this.SItem = TableFieldList;
		this._IfShow = true;	// 已运行
		this.TableSearchForm.style.display = 'block';
		this.Slist.innerHTML = '';
		this.table = C('table',{'className':'table'});	// 表格
		this.table_thead = C('thead');					// 表格头部
		this.table_tbody = C('tbody');					// 表格内容
		this.ActionTr =  C('tr');;						// 操作的TR

		var htr = C('tr', 'In', new Array(C('th','In',L.Selects), C('th','In',L.Field), C('th','In',L.Type), C('th','In',L.Collations),C('th','In',L.DefaultVal),C('th','In',L.Operator),C('th','In',L.Value)));
		this.table_thead.appendChild(htr);

		var ItemSum = this.SItem.length;
		
		for (var i = 0; i < ItemSum; ++i)
		{
			var SelectArr = new Array();
			SelectArr['default'] = CreatesSelect(NumOperators);
			SelectArr['text'] = CreatesSelect(StrOperators);

			var SOtd = C('td');
			this.SItem[i].SelectOption = (ColumnTypes[6][1].toString().toLowerCase().indexOf(this.SItem[i].DATA_TYPE + ',') != -1) ? SelectArr['text'] : SelectArr['default'];
			SOtd.appendChild(this.SItem[i].SelectOption)

			var Default =  (is_null(this.SItem[i].COLUMN_DEFAULT) && this.SItem[i].IS_NULLABLE == 'YES') ? '<i>NULL</i>' : this.SItem[i].COLUMN_DEFAULT;
			this.SItem[i].Input = C('input',{'className':'search_input'});
			if(IsTimeType(this.SItem[i].DATA_TYPE)) 
			{
				(function (obj, i)
				{
					obj.Input.onclick = function ()
					{
						WdatePicker({dateFmt:IsTimeType(TableFieldList[i].DATA_TYPE)});
					}
				})
				(this.SItem[i], i)
			}

			var Length = (this.SItem[i].Length != '') ? ' (' + this.SItem[i].Length + ')' : '';
			this.SItem[i].SelectI = C('input', {'type': 'checkbox'});
			this.SItem[i].Sbtr = C('tr','In',new Array(
				C(C('td', 'In', this.SItem[i].SelectI), {'align':'center'}),
				C('td','In',C('b','In', this.SItem[i].COLUMN_NAME)),
				C('td', 'In', this.SItem[i].DATA_TYPE +  Length ),
				C('td', 'In', (is_null(this.SItem[i].COLLATION_NAME) ? '<i>NULL</i>' : this.SItem[i].COLLATION_NAME)),
				C('td', 'In', Default),
				SOtd,
				C('td', 'In', this.SItem[i].Input)
			));
			
			
			
			this.SItem[i].Sbtr.key = i;			
			this.SItem[i].Sbtr.marked = false;

			// 增加事件
			with(this)
			{
				(function (Sbtr)
				{
					
					Sbtr.onmouseover = function ()
					{
						this.className = (this.className != '') ?  this.className + ' onmouseover' : 'onmouseover';
					}
					Sbtr.onmouseout = function ()
					{
						var temp_obj = this;
						setTimeout(function ()
						{
							temp_obj.className = temp_obj.className.replace(/onmouseover/, '');
						}, 50);
					}

					Sbtr.onkeydown = function (event)	// 避免输入文本框右击菜单的快捷键字母
					{
						event = event? event:window.event;
						if( event.keyCode == 83  && RightButtonRow != null)
						return false;
					}

					for (var td_i = 0 ; td_i < 7 ; td_i++)
					{
						if (td_i != 0 && td_i != 5 && td_i != 6)
						{
							Sbtr.getElementsByTagName("td")[td_i].onmousedown = function (event)
							{
								// 按住Shift键
								event = event? event:window.event;
								if((!document.all && event.button == 1) ||event.button == 4)  return;

								if(event.shiftKey==true && StartTr != null)
								{
									EndTr = Sbtr.key;
									var StartGo = StartTr;				// 开始的Tr KEY
									var Sum = StartTr - EndTr;			// 个数
									if(Sum > 0) var StartGo = EndTr;
									Sum = Math.abs(Sum);
									if(Sum < 1) return;
									var EndGo = Sum + StartGo +1;
									for (; StartGo < EndGo; ++StartGo)
									{
										ClickTr(SItem[StartGo].Sbtr, false);
									}
									SEstatus = false;
									return;
								}
								else
								{
									StartTr = Sbtr.key;
									SEstatus = true;
									if(event.button == 2) 		// 右键选择
										ClickTr(Sbtr, false);	// 只能选上	
									else
										ClickTr(Sbtr, true);	// 自由切换
								}
								
							}

							Sbtr.getElementsByTagName("td")[td_i].onmouseup = function (event)
							{
								// 划拉选择处理
								event = event? event:window.event;
								if(event.button == 2 || (!document.all && event.button == 1) || event.button == 4) 
								{
									return;			// 禁止右键、中键划拉选择
								}

								if(!SEstatus) return;
								EndTr = Sbtr.key;
								var StartGo = StartTr+1;			// 开始的Tr KEY
								var Sum = StartTr - EndTr;			// 个数
								if(Sum > 0) var StartGo = EndTr;
								Sum = Math.abs(Sum);
								if(Sum < 1) return;
								var EndGo = Sum + StartGo;
								for (; StartGo < EndGo; ++StartGo)
								{
									ClickTr(SItem[StartGo].Sbtr, true);
								}
								SEstatus = false;
							}
						}
					}
				})
				(this.SItem[i].Sbtr)
			}

			if(i%2) this.SItem[i].Sbtr.className = 'odd';
			this.table_tbody.appendChild(this.SItem[i].Sbtr);
			

		}
		// 操作的Tr ****************************************
		this.ActionTr.AllSelect = C('a','In',L.SelectAll);
		with(this)
		{
			ActionTr.AllSelect.onclick = function ()
			{
				for (var i = 0; i < ItemSum; ++i)
				{
					ClickTr(SItem[i].Sbtr, false);
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
					ClickTr(SItem[i].Sbtr, false, true);
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
					ClickTr(SItem[i].Sbtr, true);
				}
			}
		}
		this.ActionTr.ListSelect = C('a',{'innerHTML':L.Selects,'className':'ico ico_select'});

		this.ActionTr.td = C('td','In','');
		this.ActionTr.td.className = 'ActionTd';
		this.ActionTr.td.colSpan = '7';
		this.ActionTr.td.align = 'left';

		C(this.ActionTr.td, 'In', new Array(this.ActionTr.ListSelect, this.ActionTr.AllSelect,C('span','In','/'), this.ActionTr.NoAllSelect, C('span','In','/'),this.ActionTr.OppositeSelect, this.TSsubmit));

		this.ActionTr.appendChild(this.ActionTr.td);
		this.table_tbody.appendChild(this.ActionTr);
		
		this.table.appendChild(this.table_thead);
		this.table.appendChild(this.table_tbody);
		this.Slist.appendChild(this.table);
		
		/*
		for (key in  this.SItem)
		{
			this.SItem[key].SelectI.checked = true;
		}
		*/
	}


	// Tr点击函数
	this.ClickTr = function (Tr, status, ParentStatus)
	{
		if ((Tr.marked && status) || ParentStatus)
		{
			// 不选上
			this.SItem[Tr.key].SelectI.checked = false;
			Tr.marked = false;
			Tr.className = Tr.className.replace(/marked/, '');
		}
		else
		{
			// 选上
			this.SItem[Tr.key].SelectI.checked = true;
			Tr.marked = true;
			Tr.className = Tr.className.replace(/marked/, '') + ' marked';
		}
	}

	// 搜索表单提交
	this.TableSearchForm.onsubmit = function ()
	{
		OrderBy = {};			// 搜索不会有OrderBy
		var SqlArr = new Array();
		var FromField = new Array();
		var FromFieldStr = ' * ';
		for (key in TableSearchObject.SItem )
		{
			// 选了那些字段
			if (TableSearchObject.SItem[key].SelectI.checked == true)
			{
				FromField.push(TableSearchObject.SItem[key].COLUMN_NAME.replace(/`/g, '``'));
			}
			var S_val = TableSearchObject.SItem[key].SelectOption.value;
			var val = TableSearchObject.SItem[key].Input.value;
			var S_Field = '`' + TableSearchObject.SItem[key].COLUMN_NAME.replace(/`/g, '``') + '`';
			var nullsql = (S_val == 'IS NULL' || S_val == 'IS NOT NULL' || S_val == "!= ''" || S_val == "= ''") ? true : false;
			if(val != '' || nullsql)
			{
				val = val.replace(/\\/g, '\\\\');
				val = val.replace(/\'/g, "''");
				var Addsql = '';
				if(TableSearchObject.SItem[key].DATA_TYPE != 'int') Addsql = "'";

				if(S_val == 'LIKE %...%')
					SqlArr.push(S_Field + ' LIKE \'%' +  val +  '%\' ');
				else if (nullsql)
					SqlArr.push(S_Field + ' ' +  S_val );
				else
					SqlArr.push(S_Field + ' ' + S_val + ' ' + Addsql +  val + Addsql + ' ');
			}
		}
		if(FromField.length != TableSearchObject.SItem.length && FromField.length > 0) FromFieldStr = "`" + FromField.join("` , `") + "` ";
		if(FromField.length != TableSearchObject.SItem.length && FromField.length > 6) FromFieldStr += "\r\n";
		var Sql = 'SELECT ' + FromFieldStr + 'FROM `' + TableName + '`';
		if(SqlArr.length > 0) 
		{
			Sql += "\r\n" + 'WHERE ';
			Sql += SqlArr.join("\r\n" + 'AND ');
		}

		SqlSubmitFormObject.SqlformoOriginal.value = TableSearchObject.TSSql.value = SqlSubmitFormObject.sql_post.value = Sql;
		SqlEdit.setValue(Sql);
		TableSearchObject.TSPage.value = 1;
		SqlSubmitFormObject.SqlForm.onsubmit(1);
		return false;
	}

	// 右键菜单
	this.Menu = function ()
	{
		(function (o)
		{
			AmysqlMenuObject.add(
			{
				'MenuId':'TableSearchFormMenu', 'AreaDomID':'TableSearchForm',
				'MenuList':[
					{'id':'TSedit', 'name':L.Search, 'KeyCodeTag':'S', 'ico':'ico_search2', 'functions':function (){
						o.TableSearchForm.onsubmit();
					}}
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


