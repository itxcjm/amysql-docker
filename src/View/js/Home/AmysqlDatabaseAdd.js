/************************************************
 *
 * Amysql AMS
 * Amysql.com 
 * @param Object 
 * AmysqlDatabaseAdd  
 *
 */
var AmysqlDatabaseAddObject;

//*****************************************
ExtendArray.push({
	'_Events':[
		{'_Event':
			{'load':function ()
				{
					// 新建表
					AmysqlDatabaseAddObject = new AmysqlDatabaseAdd();
					NavigationObject.add({
						'id':'N_DatabaseAdd', 'text':L.DatabaseAdd, 'defaults':false, 'content':'AmysqlDatabaseAddForm', 
						'functions':function ()
						{
							AmysqlDatabaseAddObject.show();
						}
					});
					// End **

				}
			},
		'_EventObj':window
		}
	],
	'_ExtendInfo':{
			'ExtendId':'DatabaseAdd',
			'ExtendName':L.DatabaseAdds,
			'ExtendAbout':L.DatabaseAddsInfo,
			'Version':'1.00',
			'Date':'2012-04-06',
			'WebSite':'https://amh.sh',
			'PoweredBy':'Amysql'
	}
})
// ExtendArray End *****************

// 新增数据表
var AmysqlDatabaseAdd = function ()
{
	this.AmysqlDatabaseAddForm = C('form', {'id':'AmysqlDatabaseAddForm'});
	this.Iline = new Array();																		// 数据行
	this.Ilist = C('div', {'id':'AmysqlDatabaseAdd'});													// 表格块

	this.TIsubmit = C('input', {'type':'Submit', 'value':L.Save});

	this.AddTableLineText = C('input', {'type':'text', 'value':'1'}, {'width':'30px'});
	this.AddTableLine = C('input', {'type':'button', 'value':L.Add});
	this.SetLineAddTitleText = C('input', {'type':'text', 'value':5, 'id':'SetLineAddTitleText'});	//	多少记录显示标题
	this.SetLineNumText = C('input', {'type':'text', 'value': 1, 'id':'SetLineNum'});				//	插入记录条数
	this.SetLineNumButton = C('input', {'type':'button', 'value':L.Set});
	this.SetStatus = false;																			// 焦点是否在设置行的那一块
	this.RightButtonRow = null;																		// 当前右键记录
	this.RightButtonRowTab = null;																		
	this._IfShow = false;

	C(HomeMainObject.ContentBlock, 'In', C(this.AmysqlDatabaseAddForm, 'In', this.Ilist));

	this.hide = function ()
	{
		this.AmysqlDatabaseAddForm.style.display = 'none';
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

	// 增加数据库行
	this.add_line = function (i)
	{
		
		this.Iline[i] = C('tr');
		this.Iline[i].key = i;			

		this.Iline[i].del = C('a', {'innerHTML':L.Del, 'className':'ico2 ico_del2','title':L.DeleteThisDatabase});
		with(this)
		{
			(function (obj)
			{
				obj.del.onclick = function ()
				{
					if(obj.IInput['DatabaseName'].value != '')  
					{
						if(!confirm(L.RemoveDatabaseRow)) 
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
				case 'DatabaseName':
					this.Iline[i].IInput[k] = C('input', {'type':'text'}, {'width':'180px'});
				break;
				case 'DatabaseCollations':	
					this.Iline[i].IInput[k] = C(CreatesSelect(parent.AmysqlCollations), '', {'width':'200px'});
				break;
			
			}
			C(this.Iline[i], 'In', C('td', 'In', this.Iline[i].IInput[k]));
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
				this.className = this.className.replace(/onmouseover/, '');
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
				if(obj.IInput['DatabaseName'].value != '')  
				{
					if(!confirm(L.ConfirmResetDatabase))  
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
 		this.IItem = [{'id':'DatabaseName', 'name':L.DatabaseName}, {'id':'DatabaseCollations', 'name':L.Collations}];
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
						C('font', 'In', new Array(C('font', 'In', ' &nbsp; ' + L.Resets + ': '), this.SetLineAddTitleText, C('font', 'In', L.AddLineTitle + ' ,'))),
						C('font', 'In', ' ' + L.SetDatabaseNumberOf + ': '),
						this.SetLineNumText,	
						this.SetLineNumButton
					));
	
		this._IfShow = true;	// 已运行
		this.AmysqlDatabaseAddForm.style.display = 'block';
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

		C(this.ActionTr.td, 'In', [C('font', 'In', L.NewDatabase + ': '), this.AddTableLineText , this.AddTableLine, this.SetLine,  this.TIsubmit]);

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
		// 增加数据库
		AddTableLine.onclick = function (line)
		{
			var sum = (typeof(line) == 'number') ? line : AddTableLineText.value;
			for (var i=0; i<sum; i++)
			{
				add_line(Iline.length);
			}
			
		}
		// 重置数据库
		SetLineNumButton.onclick = function ()
		{
 			show(true);
		}

		AmysqlDatabaseAddForm.onsubmit = function ()
		{
			// 数据库重置 **************************
			if (AmysqlDatabaseAddObject.SetStatus)
			{
				AmysqlDatabaseAddObject.show(true);
				AmysqlDatabaseAddObject.SetStatus = false;
				return false;
			}
			
			var SqlArr = [];
			for (var dk in Iline)
			{
				if(Iline[dk].IInput['DatabaseName'].value != '')
				{
					var DatabaseCollations = '';
					if(Iline[dk].IInput['DatabaseCollations'].value != '')
						DatabaseCollations = ' DEFAULT CHARACTER SET ' + Iline[dk].IInput['DatabaseCollations'].options[Iline[dk].IInput['DatabaseCollations'].selectedIndex].parentNode.getAttribute('label') +  ' COLLATE ' + Iline[dk].IInput['DatabaseCollations'].value ;
					SqlArr.push('CREATE DATABASE `' + SqlKeyword(Iline[dk].IInput['DatabaseName'].value) + '`' + DatabaseCollations);
				}
			}

			if(SqlArr.length == 0)
			{
				alert(L.NoNewDatabase);
				Iline[0].IInput['DatabaseName'].focus();
				return false;
			}
			
			SqlSubmitFormObject.ConfirmSqlSubmit(null, SqlArr.join(";\n"));
			ActiveSetID = 'N_DatabaseAdd';	// 激活本版块	
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
				'MenuId':'AmysqlDatabaseAddFormMenu', 'AreaDomID':'AmysqlDatabaseAddForm',
				'MenuList':[
					{'id':'DAedit', 'name':L.AddADatabase, 'ico':'ico_edit2', 'functions':function (){
						o.AddTableLine.onclick(1);
					}},
					{'id':'DAdel', 'name':L.Del, 'KeyCodeTag':'D', 'ico':'ico_del2', 'functions':function (){
						o.Iline[o.RightButtonRow].del.onclick();
					}},					
					{'className':'separator'},
					{'id':'DAsaves', 'name':L.Save, 'KeyCodeTag':'S', 'ico':'ico_save2', 'functions':function (){
						o.SetStatus = false;
						o.AmysqlDatabaseAddForm.onsubmit();
					}},
					{'className': 'separator'},
					{'id':'DArenovate', 'name':L.ResetList, 'KeyCodeTag':'R', 'ico':'ico_renovate2', 'functions':function (){
						o.SetLineNumButton.onclick();
					}},
				],
				'initial': function ()	// 菜单初始化函数
				{
					o.RightButtonRowTab = true;
					this.get('DAdel').className = o.RightButtonRow != null ? 'item' : 'item2'; 
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