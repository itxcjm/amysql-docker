/************************************************
 *
 * Amysql AMS
 * Amysql.com 
 * @param Object 
 * AmysqlPrivileges
 *
 */
var PrivilegesDataObject;
var PrivilegesDataFieldList;
var PrivilegesDataArray;
var SqlPrivilegesSum;
var PrivilegesCanEdit = true;
var sql;
var SqlStatus = true;
var AmysqlLeftWindow = parent.parent.window.frames.AmysqlLeft;

// 数据库与数据表
var SelectDData = ['*'];
var SelectDTData = ['*'];
for (var k in AmysqlLeftWindow.AmysqlLeftList.list.Item )
{
	var arr = [];
	arr[0] = AmysqlLeftWindow.AmysqlLeftList.list.Item[k].name;
	arr[1] = [];
	for (var k2 in AmysqlLeftWindow.AmysqlLeftList.list.Item[k].ChildItemData )
		arr[1].push(AmysqlLeftWindow.AmysqlLeftList.list.Item[k].ChildItemData[k2].name);
	SelectDTData.push(arr);
	SelectDData.push(arr[0]);
}
// 权限字段
var data_field = {
	'all':['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'FILE', 'Select All'], 
	'db':['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'Select All'], 
	'dt':['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'Select All']
};
var structure_field = {
	'all':['CREATE', 'ALTER', 'INDEX', 'DROP', 'CREATE TEMPORARY TABLES', 'SHOW VIEW', 'CREATE ROUTINE', 'ALTER ROUTINE', 'EXECUTE', 'CREATE VIEW', 'Select All'], 
	'db':['CREATE', 'ALTER', 'INDEX', 'DROP', 'CREATE TEMPORARY TABLES', 'SHOW VIEW', 'CREATE ROUTINE', 'ALTER ROUTINE', 'EXECUTE', 'CREATE VIEW', 'Select All'], 
	'dt':['CREATE', 'ALTER', 'INDEX', 'DROP','SHOW VIEW','CREATE VIEW', 'Select All']
};
var administration_field = {
	'all':['SUPER', 'PROCESS', 'RELOAD', 'SHUTDOWN', 'SHOW DATABASES', 'REFERENCES', 'LOCK TABLES', 'REPLICATION SLAVE', 'REPLICATION CLIENT', 'CREATE USER', 'Select All'], 
	'db':['REFERENCES', 'LOCK TABLES', 'Select All'], 
	'dt':['REFERENCES', 'Select All']
};

ExtendArray.push({
	'_Events':[
		{'_Event':
			{'load':function ()
				{
					PrivilegesDataObject = new PrivilegesData();
					PrivilegesDataObject.ThItem = PrivilegesDataFieldList;
					PrivilegesDataObject.AddItem(PrivilegesDataArray);
					// AmysqlPrivileges 
					NavigationObject.add({
						'id':'N_Privileges', 'text':L.Privileges, 'defaults':false, 'content':'PrivilegesDataMainBlock', 
						'functions':function ()
						{
							if(SqlSubmitFormObject.ActiveSetIng) return;	// 为激活操作直接返回，不重复提交
							ActiveSetID = 'N_Privileges';					// 激活本版块
							FromObjectName = 'PrivilegesDataObject';
							SqlSubmitFormObject.SqlForm.action = 'index.php?c=privileges';
							SqlSubmitFormObject.SqlForm.onsubmit(1);
						}
					});
					// End **
				}
			},
		'_EventObj':window
		}
	],
	'_ExtendInfo':{
			'ExtendId':'Privileges',
			'ExtendName':L.MysqlPrivileges,
			'ExtendAbout':L.MysqlPrivilegesAbout,
			'Version':'1.00',
			'Date':'2021-01-01',
			'WebSite':'https://amh.sh',
			'PoweredBy':'Amysql'
	}
})
// ExtendArray End *****************


var PrivilegesDataItem = function (arr)
{
	this.arr = arr;					// 行数据的数组
	this.input = C('input');
	this.input.type = 'checkbox';
	this.textarea = new Array();	// 编辑文本框数组
	this.btr = null;				// 表格行
}
var PrivilegesData = function ()
{
	this.ThItem = new Array();								// 数据库名称集合
	this.Item = new Array();
	this.TempItem = new Array();
	this.TableDataMainBlock = C('div', {'id':'PrivilegesDataMainBlock'});
	this.list = C('div', {'id':'PrivilegesDataBlock'});		// 表格块

	this.table = null;			// 表格
	this.table_thead = null;	// 表格头部
	this.table_tbody = null;	// 表格内容
	this.table_tfoot = null;	// 表格脚部
	this.ActionTr =  C('tr');	// 操作的TR

	this.SEstatus = false;
	this.StartTr = null;
	this.EndTr = null;
	this.StartRead = 0;				// 起读点
	this.RightButtonRow = null;		// 当前右键记录
	this._IfShow = false;
	this._width = {};
	this.LeftTdNumber = 6;			// 多行合并左列数量
	this.ExistUser = {};			// 记录是否存在用户
	this.ExistAndGrantsUser = {};				// 记录是否存在用户与对应的权限
	this.AllUserName = [L.NewUserName + '|'];		// 所有用户
	this.MySQLVersion = null;

	this.ListData = C('div', {'id':'ListData2','className':'ListData'},{'margin':'0px'});
	// Dom
	if(PrivilegesDataObject) HomeMainObject.ContentBlock.removeChild(PrivilegesDataObject.TableDataMainBlock);	
	C(this.TableDataMainBlock, 'In', [ C('div', {'id':'ListPageOffsetTop'}), C(this.ListData, 'In', this.list) ])
	C(HomeMainObject.ContentBlock, 'In', this.TableDataMainBlock);

	
	this.AddItem = function (arr)
	{
		for (var k in arr)
			this.Item.push(new PrivilegesDataItem(arr[k]));
	}

	this.hide = function ()
	{
		this.TableDataMainBlock.style.display = 'none';
	}

	// 改变Privileges(Data/Structure/Administration)
	this.Change_Data_Structure_Administration = function (SetGM, obj)
	{
		var GM = (obj.edit.data.Database.value == '*' && obj.edit.data.Table.value == '*') ? 'all' : ((obj.edit.data.Table.value == '*') ? 'db' : 'dt');
		if(SetGM) GM = SetGM;
		obj.GM = GM;

		if(obj.edit.data.data_field) obj.edit.data.data_field.parentNode.removeChild(obj.edit.data.data_field);
		if(obj.edit.data.structure_field) obj.edit.data.structure_field.parentNode.removeChild(obj.edit.data.structure_field);
		if(obj.edit.data.administration_field) obj.edit.data.administration_field.parentNode.removeChild(obj.edit.data.administration_field);

		// 权限列表
		obj.edit.data.data_field = C('ul');
		obj.edit.data.data_field.arr = [];
		obj.edit.data.structure_field = C('ul');
		obj.edit.data.structure_field.arr = [];
		obj.edit.data.administration_field = C('ul');
		obj.edit.data.administration_field.arr = [];
		
		// Privileges.Data
		obj.grants_list.Data.div.style.display = 'none';
		for (var k in data_field[GM])
		{
			var v = "'" + data_field[GM][k] + "'";
			var checked = (obj.arr['grants_list'] == 'ALL PRIVILEGES' || ("'" + obj.arr.grants_list.join("','") + "'").indexOf(v)  != -1) ? true:false;
			var temp = obj.edit.data.data_field.arr[k] = C('ul');
			temp.text = C('label', {'innerHTML':data_field[GM][k], 'htmlFor': 'DF' + obj.btr.key + '_checkbox_' + data_field[GM][k]});
			temp.input = C('input', {'type':'checkbox', 'id':'DF' + obj.btr.key + '_checkbox_' + data_field[GM][k],  'name':data_field[GM][k], 'checked':checked});
			C(temp, 'In', [temp.input, temp.text]);
			C(obj.edit.data.data_field, 'In', obj.edit.data.data_field.arr[k]);

			if (data_field[GM][k] == 'Select All')
			{
				obj.edit.data.data_field.arr[k].text.style.fontWeight = 'bold';
				obj.edit.data.data_field.arr[k].input.onclick = function ()
				{
					for (var k in obj.edit.data.data_field.arr)
					{
						if(obj.edit.data.data_field.arr[k].input != this) 
							obj.edit.data.data_field.arr[k].input.checked = this.checked;
					}
				}
			}
		}
		C(obj.grants_list.Data, 'In', obj.edit.data.data_field);

		// Privileges.Structure
		obj.grants_list.Structure.div.style.display = 'none';
		for (var k in structure_field[GM])
		{
			var v = "'" + structure_field[GM][k] + "'";
			var checked = (obj.arr['grants_list'] == 'ALL PRIVILEGES' || ("'" + obj.arr.grants_list.join("','") + "'").indexOf(v)  != -1) ? true:false;
			var temp = obj.edit.data.structure_field.arr[k] = C('ul');
			temp.text = C('label', {'innerHTML':structure_field[GM][k], 'htmlFor':'SF' + obj.btr.key + '_checkbox_' + structure_field[GM][k]});
			temp.input = C('input', {'type':'checkbox', 'id':'SF' + obj.btr.key + '_checkbox_' + structure_field[GM][k], 'name':structure_field[GM][k], 'checked':checked});
			C(temp, 'In', [temp.input, temp.text]);
			C(obj.edit.data.structure_field, 'In', obj.edit.data.structure_field.arr[k]);

			if (structure_field[GM][k] == 'Select All')
			{
				obj.edit.data.structure_field.arr[k].text.style.fontWeight = 'bold';
				obj.edit.data.structure_field.arr[k].input.onclick = function ()
				{
					for (var k in obj.edit.data.structure_field.arr)
					{
						if(obj.edit.data.structure_field.arr[k].input != this) 
							obj.edit.data.structure_field.arr[k].input.checked = this.checked;
					}
				}
			}
		}
		C(obj.grants_list.Structure, 'In', obj.edit.data.structure_field);

		// Privileges.Administration
		obj.grants_list.Administration.div.style.display = 'none';
		for (var k in administration_field[GM])
		{
			var v = "'" + administration_field[GM][k] + "'";
			var checked = (obj.arr['grants_list'] == 'ALL PRIVILEGES' || ("'" + obj.arr.grants_list.join("','") + "'").indexOf(v)  != -1) ? true:false;
			var temp = obj.edit.data.administration_field.arr[k] = C('ul');
			temp.text = C('label', {'innerHTML':administration_field[GM][k], 'htmlFor':'AF' + obj.btr.key + '_checkbox_' + administration_field[GM][k]});
			temp.input = C('input', {'type':'checkbox', 'id':'AF' + obj.btr.key + '_checkbox_' + administration_field[GM][k], 'name':administration_field[GM][k], 'checked':checked});
			C(temp, 'In', [temp.input, temp.text]);
			C(obj.edit.data.administration_field, 'In', obj.edit.data.administration_field.arr[k]);

			if (administration_field[GM][k] == 'Select All')
			{
				obj.edit.data.administration_field.arr[k].text.style.fontWeight = 'bold';
				obj.edit.data.administration_field.arr[k].input.onclick = function ()
				{
					for (var k in obj.edit.data.administration_field.arr)
					{
						if(obj.edit.data.administration_field.arr[k].input != this) 
							obj.edit.data.administration_field.arr[k].input.checked = this.checked;
					}
				}
			}
		}
		C(obj.grants_list.Administration, 'In', obj.edit.data.administration_field);
	
	}


	// 显示数据 ********* empty 是否清空 ***********
	this.show = function ()
	{
		this.ThItem = [];

		for (var k in PrivilegesDataFieldList )
			this.ThItem[PrivilegesDataFieldList[k].name] = {};


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
		this.htr2 = C('tr');
		if(PrivilegesCanEdit)
		{
			this.htr.appendChild(C('th', {'innerHTML':' DATABASES','className':'td1_1', 'rowSpan':'2'}));
			this.htr.appendChild(C('th',{'innerHTML':L.AmysqlHome.Id, 'rowSpan':'2'},{'padding':'5px'}));
		}

		var i = PrivilegesCanEdit ? 2 : 0;
		for (var k in this.ThItem)
		{
			this.ThItem[k].key = i;											// 下标
			this.ThItem[k].ATag = C('span',{'innerHTML': L.AmysqlHome[k] ? L.AmysqlHome[k] : k});				// 标题文字
			this.ThItem[k].ThTag = C('th','In', this.ThItem[k].ATag );		// 标题块
			if(k != 'Privileges')
			{
				C(this.ThItem[k].ThTag, {'rowSpan':'2'});
			}
			else
			{
				C(this.ThItem[k].ThTag, {'colSpan':'3'});
				this.ThItem[k].ThTag2 = [C('th', 'In', L.AmysqlHome['Data']), C('th', 'In', L.AmysqlHome['Structure']), C('th', 'In', L.AmysqlHome['Administration'])];
			}
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
							var tdk = (exist_MuchRow && obj.key > LeftTdNumber-1) ? obj.key + 1 : obj.key; // Database字段加1td
							tdk = (obj.key > LeftTdNumber+3) ? (tdk+2) : tdk;			// Privileges字段加2td
							var ThTemp = Item[Tkey].NL != 0 ? Item[Tkey].btr.childNodes[tdk] : Item[Tkey].btr.childNodes[tdk-LeftTdNumber];
							if(!Item[Tkey].btr || !ThTemp) continue;
							if(obj.Click)
								ThTemp.className = ThTemp.className + ' marked';
							else
								ThTemp.className = ThTemp.className.replace(/marked/, '');
						}
					}
					// 一列 焦点高亮
					obj.ThTag.onmouseout = function ()
					{
						for (Tkey in Item)
						{
							var tdk = (exist_MuchRow && obj.key > LeftTdNumber-1) ? obj.key + 1 : obj.key;
							tdk = (obj.key > LeftTdNumber+3) ? (tdk+2) : tdk;
							var ThTemp = Item[Tkey].NL != 0 ? Item[Tkey].btr.childNodes[tdk] : Item[Tkey].btr.childNodes[tdk-LeftTdNumber];
							if(!Item[Tkey].btr || !ThTemp) continue;
							ThTemp.className = ThTemp.className.replace(/onmouseover/, '');
						}
					}
					obj.ThTag.onmouseover = function ()
					{
						for (Tkey in Item)
						{
							var tdk = (exist_MuchRow && obj.key > LeftTdNumber-1) ? obj.key + 1 : obj.key;
							tdk = (obj.key > LeftTdNumber+3) ? (tdk+2) : tdk;
							var ThTemp = Item[Tkey].NL != 0 ? Item[Tkey].btr.childNodes[tdk] : Item[Tkey].btr.childNodes[tdk-LeftTdNumber];
							if(!Item[Tkey].btr || !ThTemp) continue;
							ThTemp.className = (ThTemp.className != '') ?  ThTemp.className + ' onmouseover' : 'onmouseover';
						}
					}

					
				})(ThItem[k]);

			}

			this.htr.appendChild(this.ThItem[k].ThTag);
			if(this.ThItem[k].ThTag2) C(this.htr2, 'In', this.ThItem[k].ThTag2);
			++i;
			++ThItemSum;
		}
		this.table_thead.appendChild(this.htr);		// 加表格Th标题
		this.table_thead.appendChild(this.htr2);



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
		this.ActionTr.edit = C('a', {'innerHTML':L.Edit,'className': 'ico ico_edit','title':L.EditSelect});
		this.ActionTr.del = C('a', {'innerHTML':L.Del,'className': 'ico ico_del','title':L.DeleteSelectedItem});
		this.ActionTr.save = C('a',{'innerHTML':L.Save,'className':'ico ico_save', 'title':L.SaveEditItem});
		// this.ActionTr.exports = C('a',{'innerHTML':L.Export,'className':'ico ico_export', 'title':L.ExportGrants});
		this.ActionTr.exports = C('input', {'type':'button', 'value':L.ExportGrants});
		this.ActionTr.NewUser = C('input', {'type':'button', 'value':L.NewUser});

		if(PrivilegesCanEdit)
		{
			with(this)
			{
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
							}catch(e){}
						}
					}
				}

				// 选中行删除
				ActionTr.del.onclick = function ()
				{
					var DelUser = [];
					var DelSql = [];
					for (key in Item)
					{
						if (Item[key].input.checked && DelUser.indexOf(Item[key].arr.User) == -1)
						{
							DelUser.push(SqlKeyword(Item[key].arr.User));
							DelSql.push("DROP USER '" + SqlKeyword(Item[key].arr.User) + "'@'" + SqlKeyword(Item[key].arr.Host) + "'");
						}
					}
					if(DelUser.length == 0) return false;
					SqlSubmitFormObject.operation_sql_text.value = DelSql.join(";\n");
					SqlSubmitFormObject.UpOperationSqlNotice(printf(L.ConfirmdeletionUser, {'list':DelUser.join(' , '), 'del':'<font color="red"><b> ' + L.Del + ' </b></font>'}) , 0);
					SqlSubmitFormObject.confirm_sql.style.display = 'inline';
				}
				
				// 导出权限
				ActionTr.exports.onclick = function ()
				{
					var ExportArr = [];
					for (key in Item)
					{
						if (Item[key].input.checked)
						{
							ExportArr.push(Item[key].arr.grants_sql);
						}
					}
					if (ExportArr.length == 0)
					{
						alert(L.PleaseSelectUser);
						return;
					}
					else
					{
					    prompt(L.ExportUserGrant + "\n\r" + ExportArr.join("\n\r"), ExportArr.join("; "));
					}
				}
				
				// 新建用户
				ActionTr.NewUser.onclick = function ()
				{
					var obj = {};
					obj.arr = [];
					obj.arr['grants_list'] = 'ALL PRIVILEGES';
					obj.key = TempItem.length;
					obj.del = C('a', {'innerHTML':L.Del,'className':'ico2 ico_del2'});
					obj.GM = 'all';

					obj.edit = {};
					obj.edit.MainData = {};
					obj.edit.MainData.User = C('span');
					obj.edit.MainData.User.select = CreatesSelect(AllUserName, '');
					obj.edit.MainData.User.select.onchange = function ()
					{
						obj.edit.MainData.User.text.value = this.value;
						if(this.value == '') obj.edit.MainData.User.text.focus();
						obj.edit.MainData.User.text.onkeyup();
					}
					obj.edit.MainData.User.text = C('input', {'type':'text', 'value':''}, {'display':'block'});
					C(obj.edit.MainData.User, 'In', [obj.edit.MainData.User.select, obj.edit.MainData.User.text]);

					obj.edit.MainData.Host = C('span');
					obj.edit.MainData.Host.select = CreatesSelect([L.AnyLocal+'|%', L.local+'|localhost', L.UseText+'|']);
					obj.edit.MainData.Host.select.value = 'localhost';
					obj.edit.MainData.Host.select.onchange = function ()
					{
						obj.edit.MainData.Host.text.value = this.value;
						if(this.value == '') obj.edit.MainData.Host.text.focus();
						obj.edit.MainData.User.text.onkeyup();
					}
					obj.edit.MainData.Host.text = C('input', {'type':'text', 'value':'localhost'}, {'display':'block'});
					C(obj.edit.MainData.Host, 'In', [obj.edit.MainData.Host.select, obj.edit.MainData.Host.text]);

					obj.edit.MainData.pass = C('span');
					obj.edit.MainData.pass.select = CreatesSelect([L.OldPassword+'|1', L.NewPassword+'|2', L.NoPassword+'|3']);
					obj.edit.MainData.pass.select.value = '2';
					obj.edit.MainData.pass.select.onchange = function ()
					{
						obj.edit.MainData.pass.text.disabled = (this.value == '2') ? false :true;
						if(this.value == '2') obj.edit.MainData.pass.text.focus();
					}
					obj.edit.MainData.pass.text = C('input', {'type':'password'}, {'display':'block'});
					C(obj.edit.MainData.pass, 'In', [obj.edit.MainData.pass.select, obj.edit.MainData.pass.text]);

					obj.edit.MainData.max_questions = C('input', {'type':'text', 'value':'0'});
					obj.edit.MainData.max_updates = C('input', {'type':'text', 'value':'0'});
					obj.edit.MainData.max_connections = C('input', {'type':'text', 'value':'0'});
					obj.edit.MainData.max_user_connections = C('input', {'type':'text', 'value':'0'});

					obj.edit.data = {};
					// 权限数据库
					obj.edit.data.Database = CreatesSelect(SelectDData, '*');
					obj.edit.data.Database.onchange = function ()
					{
						var SelectDTData_item = ['*'];
						for (var key in SelectDTData)
						{
							if(SelectDTData[key][0] == this.value)
							for (var k in SelectDTData[key][1] )
								SelectDTData_item.push(SelectDTData[key][1][k]);
						}
						var tmp = obj.edit.data.Table.parentNode;
						tmp.removeChild(obj.edit.data.Table);
						obj.edit.data.Table = CreatesSelect(SelectDTData_item);
						tmp.appendChild(obj.edit.data.Table);
						obj.edit.data.Table.onchange = function ()
						{
							Change_Data_Structure_Administration(null, obj);
						}

						Change_Data_Structure_Administration(null, obj);
					}
					
					// 权限数据表
					var SelectDTData_item = ['*'];
					obj.edit.data.Table = CreatesSelect(SelectDTData_item, '*');
					obj.edit.data.Table.onchange = function ()
					{
						Change_Data_Structure_Administration(null, obj);
					}
					
					// 授权
					obj.edit.data.Grant =  C('input', {'type':'checkbox','checked':true});
					// exist_MuchRow

					// 权限
					obj.grants_list = {};
					obj.grants_list.Data = C('td');
					obj.grants_list.Structure = C('td');
					obj.grants_list.Administration = C('td');

					obj.grants_list.Data.div = C('div', {'innerHTML': ''});
					C(obj.grants_list.Data, 'In', obj.grants_list.Data.div);

					obj.grants_list.Structure.div = C('div', {'innerHTML': ''});
					C(obj.grants_list.Structure, 'In', obj.grants_list.Structure.div);

					obj.grants_list.Administration.div = C('div', {'innerHTML': ''});
					C(obj.grants_list.Administration, 'In', obj.grants_list.Administration.div);

					var arr = [
						C('td', 'In', obj.del),
						C('td', 'In', '-'),
						C('td', 'In', obj.edit.MainData.User),
						C('td', 'In', obj.edit.MainData.Host),
						C('td', 'In', obj.edit.MainData.pass),
						C('td', 'In', C('div', 'In', 'mysql_native')),
						(exist_MuchRow) ?  C('td') : false,
						C('td', 'In', obj.edit.data.Database),
						C('td', 'In', obj.edit.data.Table),
						C('td', 'In', obj.edit.data.Grant),
						obj.grants_list.Data,
						obj.grants_list.Structure,
						obj.grants_list.Administration,
						C('td', 'In', obj.edit.MainData.max_questions),
						C('td', 'In', obj.edit.MainData.max_updates),
						C('td', 'In', obj.edit.MainData.max_connections),
						C('td', 'In', obj.edit.MainData.max_user_connections),
					];
					obj.btr = C('tr', 'In', arr);
					obj.btr.key = obj.key;
					
					(function (o)
					{
						o.btr.onmouseup = function (event)
						{
							event = event? event:window.event;
							if(event.button == 2) AddLineTag = true;
						}
						o.edit.MainData.User.text.onkeyup = function ()
						{
							// 找到旧用户
							if(ExistUser[o.edit.MainData.Host.text.value+o.edit.MainData.User.text.value])
							{
								o.edit.MainData.pass.text.disabled = true;
								o.edit.MainData.pass.select.value = '1';
							}
							else
							{
								o.edit.MainData.pass.text.disabled = false;
								o.edit.MainData.pass.select.value = '2';
							}
								
						}
						o.edit.MainData.Host.text.onkeyup = o.edit.MainData.User.text.onkeyup;
						o.del.onclick = function ()
						{
							o.btr.parentNode.removeChild(o.btr);
							TempItem.splice(o.key, 1);			// 删除一条
							New_i = 0;
							for (var dk in TempItem )
							{
								TempItem[dk].i = New_i;		// 重新更新key
								++New_i;
							}
						}
					})
					(obj)

					TempItem[obj.key] = obj;
					table_tbody.appendChild(TempItem[obj.key].btr);
					Change_Data_Structure_Administration(obj.GM, obj);
					obj.edit.MainData.User.text.focus();

					// 避免输入文本框右击菜单的快捷键字母
					for (var ik in [obj.edit.MainData, obj.edit.data] )
					{
						for (var ikm in [obj.edit.MainData, obj.edit.data][ik] )
						{
							[obj.edit.MainData, obj.edit.data][ik][ikm].onkeydown = function (event)	
							{
								event = event? event:window.event;
								if((event.keyCode == 69  || event.keyCode == 83 || event.keyCode == 68  || event.keyCode == 67 || event.keyCode == 82 ) && AddLineTag != null)
									return false;
							}
						}
						
					}
				}

				// 保存
				ActionTr.save.onclick = function ()
				{
					var SqlArr = [];
					var NewUser = false;
					var NewOption = false;

					// 原先用户数据
					for (var key in Item )
					{
						var GD = Item[key].arr.grants_database == '*' ? Item[key].arr.grants_database : '`' + SqlKeyword(Item[key].arr.grants_database) + '`';
						var GT = Item[key].arr.grants_table == '*' ? Item[key].arr.grants_table : '`' + SqlKeyword(Item[key].arr.grants_table) + '`';
						var User = SqlKeyword(Item[key].arr.User);
						var Host = SqlKeyword(Item[key].arr.Host);
						var Pass = SqlKeyword(Item[key].arr.Password);
						var PassP = Item[key].arr.PassPlugin;
						var Grant = Item[key].arr.grant;
						var MQ = Item[key].arr.max_questions;
						var MU = Item[key].arr.max_updates;
						var MC = Item[key].arr.max_connections;
						var MUC = Item[key].arr.max_user_connections;

						if (Item[key].edit.data)
						{
							var GD_new = Item[key].edit.data.Database.value == '*' ? Item[key].edit.data.Database.value : '`' + SqlKeyword(Item[key].edit.data.Database.value) + '`';
							var GT_new = Item[key].edit.data.Table.value == '*' ? Item[key].edit.data.Table.value : '`' + SqlKeyword(Item[key].edit.data.Table.value) + '`';
							var Grant_new = Item[key].edit.data.Grant.checked ? 'Yes' : 'No';
						}
						
						// 主要数据部分
						if (Item[key].edit.MainData)
						{
							var User_new = Item[key].edit.MainData.User.value;
							var Host_new = Item[key].edit.MainData.Host.text.value;
							var Pass_new = Item[key].edit.MainData.pass.text.value;
							var MQ_new = Item[key].edit.MainData.max_questions.value;
							var MU_new = Item[key].edit.MainData.max_updates.value;
							var MC_new = Item[key].edit.MainData.max_connections.value;
							var MUC_new = Item[key].edit.MainData.max_user_connections.value;
							
							// 用户改变，删除旧用户增加新用户 ||  数据库、数据表权限改变删除旧权限
							if ( (User != User_new || Host != Host_new) || ((GD_new && GD != GD_new) || (GT_new && GT != GT_new)) )
							{
								NewUser = true;
								SqlArr.push("REVOKE ALL PRIVILEGES ON " + GD + "." + GT + " FROM  '" + User + "'@'" + Host + "'");
								if(Grant == 'Yes')
									SqlArr.push("REVOKE GRANT OPTION ON " + GD + "." + GT + " FROM  '" + User + "'@'" + Host + "'");
								SqlArr.push("DROP USER '" + User + "'@'" + Host + "'");
								SqlArr.push("CREATE USER '" + User_new + "'@'" + Host_new + "'"); //  IDENTIFIED BY '" + Pass_new + "'"
							}
							if(MQ != MQ_new || MU != MU_new || MC != MC_new || MUC != MUC_new)
							{
								NewOption = true;
								MQ = MQ_new; MU = MU_new; MC = MC_new; MUC = MUC_new;
							}

							// 原有密码更改为无密码、新密码无值
							if(MySQLVersion > 50700)
							{
								if ((Item[key].edit.MainData.pass.select.value == '3' && Pass != '')|| (Item[key].edit.MainData.pass.select.value == '2' && Pass_new == ''))
									SqlArr.push("ALTER USER '" + User_new + "'@'" + Host_new + "' identified with " + PassP + " by ''");
								else if (Item[key].edit.MainData.pass.select.value == '2')
									SqlArr.push("ALTER USER '" + User_new + "'@'" + Host_new + "' identified with " + PassP + " by '" + Pass_new + "'");
								else if(NewUser)
									SqlArr.push("ALTER USER '" + User_new + "'@'" + Host_new + "' identified with " + PassP + " as '" + Pass + "'");
								SqlArr.push("ALTER USER '" + User_new + "'@'" + Host_new + "' WITH MAX_QUERIES_PER_HOUR " + MQ + " MAX_UPDATES_PER_HOUR " + MU + " MAX_CONNECTIONS_PER_HOUR " + MC + " MAX_USER_CONNECTIONS " + MUC);
							}
							else
							{
								if ((Item[key].edit.MainData.pass.select.value == '3' && Pass != '')|| (Item[key].edit.MainData.pass.select.value == '2' && Pass_new == ''))
									SqlArr.push("SET PASSWORD FOR '" + User_new + "'@'" + Host_new + "' = ''");
								else if (Item[key].edit.MainData.pass.select.value == '2')
									SqlArr.push("SET PASSWORD FOR '" + User_new + "'@'" + Host_new + "' = PASSWORD('" + Pass_new + "')");
								else if(NewUser)
									SqlArr.push("SET PASSWORD FOR '" + User_new + "'@'" + Host_new + "' = '" + Pass + "'");	// 新用户保持原密码
							}
						}
						
						// 权限数据部分更改
						if (Item[key].edit.data)
						{
							
							var GRANT_OPTION  = '';
							
							// 旧用户才删除权限
							if(!NewUser) SqlArr.push("REVOKE ALL PRIVILEGES ON " + GD + "." + GT + " FROM  '" + User + "'@'" + Host + "'");
							if(!NewUser && Grant_new == 'No')
								SqlArr.push("REVOKE GRANT OPTION ON " + GD + "." + GT + " FROM  '" + User + "'@'" + Host + "'");
							else 
								GRANT_OPTION = ' GRANT OPTION ';
							

							// 统计全部权限数量
							var PrivilegesSum = data_field[Item[key].GM].length + structure_field[Item[key].GM].length + administration_field[Item[key].GM].length - 3;
							var PrivilegesArr = [];
							for (var dfk in Item[key].edit.data.data_field.arr )
							{
								if(Item[key].edit.data.data_field.arr[dfk].input.checked && Item[key].edit.data.data_field.arr[dfk].input.name != 'Select All')
									PrivilegesArr.push(Item[key].edit.data.data_field.arr[dfk].input.name);
							}

							for (var sfk in Item[key].edit.data.structure_field.arr )
							{
								if(Item[key].edit.data.structure_field.arr[sfk].input.checked && Item[key].edit.data.structure_field.arr[sfk].input.name != 'Select All')
									PrivilegesArr.push(Item[key].edit.data.structure_field.arr[sfk].input.name);
							}

							for (var afk in Item[key].edit.data.administration_field.arr )
							{
								if(Item[key].edit.data.administration_field.arr[afk].input.checked && Item[key].edit.data.administration_field.arr[afk].input.name != 'Select All')
									PrivilegesArr.push(Item[key].edit.data.administration_field.arr[afk].input.name);
							}

							if(PrivilegesArr.length == 0)
							{
								PrivilegesArr = ['USAGE'];	// 无权限
							}
							else if (PrivilegesSum == PrivilegesArr.length)
							{
								PrivilegesArr = ['ALL PRIVILEGES'];	// 有所有权限
							}
							
							if(MySQLVersion > 50700)
								SqlArr.push("GRANT " + PrivilegesArr.join(',') + " ON " + (GD_new ? GD_new : GD)  + "." + (GT_new ? GT_new : GT) + " TO  '" + (User_new ? User_new : User) + "'@'" + (Host_new ? Host_new : Host) + "'" +  ( GRANT_OPTION != '' ? " WITH " + GRANT_OPTION : ''));
							else
								SqlArr.push("GRANT " + PrivilegesArr.join(',') + " ON " + (GD_new ? GD_new : GD)  + "." + (GT_new ? GT_new : GT) + " TO  '" + (User_new ? User_new : User) + "'@'" + (Host_new ? Host_new : Host) + "' WITH " + GRANT_OPTION + "  MAX_QUERIES_PER_HOUR " + MQ + " MAX_UPDATES_PER_HOUR " + MU + " MAX_CONNECTIONS_PER_HOUR " + MC + " MAX_USER_CONNECTIONS " + MUC);
						}
						else if (Item[key].edit.MainData && (NewUser || NewOption))	// 新用户或新选项(无编辑权限的情况)
						{
						    for (var key2 in Item )
							{
								if (Item[key2].arr.User == User)	// 找出旧用户权限
								{
									var	GRANT_OPTION = (Item[key2].arr.grant == 'Yes') ? ' GRANT OPTION ' : '';
									if(MySQLVersion > 50700)
										SqlArr.push("GRANT " + Item[key2].arr.grants_list.join(',') + " ON " + Item[key2].arr.grants_database  + "." + Item[key2].arr.grants_table + " TO  '" + User_new + "'@'" + Host_new + "'" +  ( GRANT_OPTION != '' ? " WITH " + GRANT_OPTION : ''));
									else
										SqlArr.push("GRANT " + Item[key2].arr.grants_list.join(',') + " ON " + Item[key2].arr.grants_database  + "." + Item[key2].arr.grants_table + " TO  '" + User_new + "'@'" + Host_new + "' WITH " + GRANT_OPTION + "  MAX_QUERIES_PER_HOUR " + MQ + " MAX_UPDATES_PER_HOUR " + MU + " MAX_CONNECTIONS_PER_HOUR " + MC + " MAX_USER_CONNECTIONS " + MUC);
								}
							}
						}
					}
					
					// 添加新用户权限
					for (var key in TempItem )
					{
						if (TempItem[key].edit.MainData)
						{
							var User_new = TempItem[key].edit.MainData.User.text.value;
							var Host_new = TempItem[key].edit.MainData.Host.text.value;
							var Pass_new = TempItem[key].edit.MainData.pass.text.value;
							var MQ = TempItem[key].edit.MainData.max_questions.value;
							var MU = TempItem[key].edit.MainData.max_updates.value;
							var MC = TempItem[key].edit.MainData.max_connections.value;
							var MUC = TempItem[key].edit.MainData.max_user_connections.value;
							var GD_new = TempItem[key].edit.data.Database.value == '*' ? TempItem[key].edit.data.Database.value : '`' + SqlKeyword(TempItem[key].edit.data.Database.value) + '`';
							var GT_new = TempItem[key].edit.data.Table.value == '*' ? TempItem[key].edit.data.Table.value : '`' + SqlKeyword(TempItem[key].edit.data.Table.value) + '`';
							var Grant_new = TempItem[key].edit.data.Grant.checked ? 'Yes' : 'No';
							
							// 不存在用户
							if (!ExistUser[Host_new + User_new])
							{
								SqlArr.push("CREATE USER '" + User_new + "'@'" + Host_new + "'"); //  IDENTIFIED BY '" + Pass_new + "'"
							}
							
							// 存在旧权限
							if(ExistAndGrantsUser[Host_new + User_new + TempItem[key].edit.data.Database.value + TempItem[key].edit.data.Table.value])
							{
								SqlArr.push("REVOKE ALL PRIVILEGES ON " + GD_new + "." + GT_new + " FROM  '" + User_new + "'@'" + Host_new + "'");
								if(Grant_new == 'No') SqlArr.push("REVOKE GRANT OPTION ON " + GD_new + "." + GT_new + " FROM  '" + User_new + "'@'" + Host_new + "'");
							}
							// 原有密码更改为无密码、新密码无值
							if(MySQLVersion > 50700)
							{
								if ((TempItem[key].edit.MainData.pass.select.value == '3')|| (TempItem[key].edit.MainData.pass.select.value == '2' && Pass_new == ''))
									SqlArr.push("ALTER USER '" + User_new + "'@'" + Host_new + "' identified with mysql_native_password by ''");
								else if (TempItem[key].edit.MainData.pass.select.value == '2')
									SqlArr.push("ALTER USER '" + User_new + "'@'" + Host_new + "' identified with mysql_native_password by '" + Pass_new + "'");
								SqlArr.push("ALTER USER '" + User_new + "'@'" + Host_new + "' WITH MAX_QUERIES_PER_HOUR " + MQ + " MAX_UPDATES_PER_HOUR " + MU + " MAX_CONNECTIONS_PER_HOUR " + MC + " MAX_USER_CONNECTIONS " + MUC);
							}
							else
							{
								if ((TempItem[key].edit.MainData.pass.select.value == '3')|| (TempItem[key].edit.MainData.pass.select.value == '2' && Pass_new == ''))
									SqlArr.push("SET PASSWORD FOR '" + User_new + "'@'" + Host_new + "' = ''");
								else if (TempItem[key].edit.MainData.pass.select.value == '2')
									SqlArr.push("SET PASSWORD FOR '" + User_new + "'@'" + Host_new + "' = PASSWORD('" + Pass_new + "')");
							}
							
							var GRANT_OPTION = (Grant_new == 'No') ? '' : ' GRANT OPTION ';

							// 统计全部权限数量
							var PrivilegesSum = data_field[TempItem[key].GM].length + structure_field[TempItem[key].GM].length + administration_field[TempItem[key].GM].length - 3;
							var PrivilegesArr = [];
							for (var dfk in TempItem[key].edit.data.data_field.arr )
							{
								if(TempItem[key].edit.data.data_field.arr[dfk].input.checked && TempItem[key].edit.data.data_field.arr[dfk].input.name != 'Select All')
									PrivilegesArr.push(TempItem[key].edit.data.data_field.arr[dfk].input.name);
							}

							for (var sfk in TempItem[key].edit.data.structure_field.arr )
							{
								if(TempItem[key].edit.data.structure_field.arr[sfk].input.checked && TempItem[key].edit.data.structure_field.arr[sfk].input.name != 'Select All')
									PrivilegesArr.push(TempItem[key].edit.data.structure_field.arr[sfk].input.name);
							}

							for (var afk in TempItem[key].edit.data.administration_field.arr )
							{
								if(TempItem[key].edit.data.administration_field.arr[afk].input.checked && TempItem[key].edit.data.administration_field.arr[afk].input.name != 'Select All')
									PrivilegesArr.push(TempItem[key].edit.data.administration_field.arr[afk].input.name);
							}

							if(PrivilegesArr.length == 0)
							{
								PrivilegesArr = ['USAGE'];	// 无权限
							}
							else if (PrivilegesSum == PrivilegesArr.length)
							{
								PrivilegesArr = ['ALL PRIVILEGES'];	// 有所有权限
							}
							if(MySQLVersion > 50700)
								SqlArr.push("GRANT " + PrivilegesArr.join(',') + " ON " + GD_new  + "." + GT_new + " TO  '" + User_new + "'@'" + Host_new + "'" +  ( GRANT_OPTION != '' ? " WITH " + GRANT_OPTION : ''));
							else
								SqlArr.push("GRANT " + PrivilegesArr.join(',') + " ON " + GD_new  + "." + GT_new + " TO  '" + User_new + "'@'" + Host_new + "' WITH " + GRANT_OPTION + "  MAX_QUERIES_PER_HOUR " + MQ + " MAX_UPDATES_PER_HOUR " + MU + " MAX_CONNECTIONS_PER_HOUR " + MC + " MAX_USER_CONNECTIONS " + MUC);
						}
					}

					if (SqlArr.length > 0)
					{
						var Alerts = printf(L.ConfirmUpUserGrant, {'del':L.Del}) + " \n\r" + SqlArr.join(";\n\r");
						SqlSubmitFormObject.ConfirmSqlSubmit(Alerts, SqlArr.join(";\n\r"), 'index.php?c=privileges');
					}
					else
					{
					    alert(L.NoChangeGrant);
					}
				}
			}
		}
		


		// 循环记录行 **********************************************************************************************************
		var show_del_block = 1;		// 是否显示删除修改操作的TD

		var i = this.StartRead;		// 从哪读起
		var k = 1;
		var NoK = 0;

		var temp_arr = {};					// 统计分组
		var exist_MuchRow = false;			// 是否存在多列
		for (key in this.Item)
		{
			if(typeof(temp_arr[this.Item[key].arr['User']+this.Item[key].arr['Host']]) != 'number') 
				temp_arr[this.Item[key].arr['User']+this.Item[key].arr['Host']] = 0;
			++temp_arr[this.Item[key].arr['User']+this.Item[key].arr['Host']];
			if(temp_arr[this.Item[key].arr['User']+this.Item[key].arr['Host']] > 1) exist_MuchRow = true;
		}

		if (exist_MuchRow)
			this.ThItem['Database'].ThTag.colSpan = '2';

		for (; ; ++k)
		{
			if(k > this.OnceShow || i >= ItemSum) 
			{
				this.StartRead += this.OnceShow;
				break;	// 一次显示this.OnceShow条记录
			}
			
			
			this.Item[i].td = [];
				
			this.Item[i].del = C('a', {'innerHTML':L.Del,'className':'ico2 ico_del2'});
			this.Item[i].del.key = i;	// 下标
			this.Item[i].edit = C('a', {'innerHTML':L.Edit,'className':'ico2 ico_edit2'});
			this.Item[i].edit.key = i;	// 下标
			

			this.Item[i].BtrAction = C('td','In',new Array(
				C(this.Item[i].input,'checked',''),
				this.Item[i].edit,
				this.Item[i].del
			));
			this.Item[i].BtrAction.align = 'center';

			if (exist_MuchRow)
			{
				this.Item[i].Action_small = C('td');
				this.Item[i].Action_small.edit =  C('a', {'innerHTML':L.Edit,'className':'ico2 ico_edit2'});
				this.Item[i].Action_small.del =  C('a', {'innerHTML':L.Del,'className':'ico2 ico_del2'});
				C(this.Item[i].Action_small, 'In', [this.Item[i].Action_small.edit, this.Item[i].Action_small.del]);
			}

			var NL = temp_arr[this.Item[i].arr['User']+this.Item[i].arr['Host']];	// 是否多列
			this.Item[i].NL = NL;													// 大于1: 多列，等于1:单列, 等于0:多列非第一列

			// 权限模式(全局、数据库、数据表)
			if(this.Item[i].arr['grants_database'] == '*' && this.Item[i].arr['grants_table'] == '*')
				this.Item[i].GM = 'all';
			else if(this.Item[i].arr['grants_table'] == '*')
				this.Item[i].GM = 'db';
			else 
				this.Item[i].GM = 'dt';

			// 用户行数量
			if (NL != 0) ++NoK;

			// 权限
			this.Item[i].grants_list = {};
			this.Item[i].grants_list.Data = C('td');
			this.Item[i].grants_list.Structure = C('td');
			this.Item[i].grants_list.Administration = C('td');
			if (this.Item[i].arr['grants_list'] == 'ALL PRIVILEGES' || this.Item[i].arr['grants_list'] == 'USAGE')	// 全部权限或无权限
			{
				this.Item[i].grants_list.Data.div = C('div', {'innerHTML': this.Item[i].arr['grants_list']});
				C(this.Item[i].grants_list.Data, 'In', this.Item[i].grants_list.Data.div);

				this.Item[i].grants_list.Structure.div = C('div', {'innerHTML': this.Item[i].arr['grants_list']});
				C(this.Item[i].grants_list.Structure, 'In', this.Item[i].grants_list.Structure.div);

				this.Item[i].grants_list.Administration.div = C('div', {'innerHTML': this.Item[i].arr['grants_list']});
				C(this.Item[i].grants_list.Administration, 'In', this.Item[i].grants_list.Administration.div);
			}
			else
			{
				var temp_data_name = [];
				var temp_structure_name = [];
				var temp_administration_name = [];
				for (var k in this.Item[i].arr['grants_list'] )
				{
					var v = "'" + this.Item[i].arr['grants_list'][k] + "'";
					if(("'" + data_field[this.Item[i].GM].join("','") + "'").indexOf(v)  != -1)
						temp_data_name.push(this.Item[i].arr['grants_list'][k]);
					else if(("'" + structure_field[this.Item[i].GM].join("','") + "'").indexOf(v)  != -1)
						temp_structure_name.push(this.Item[i].arr['grants_list'][k]);
					else if(("'" + administration_field[this.Item[i].GM].join("','") + "'").indexOf(v)  != -1)
						temp_administration_name.push(this.Item[i].arr['grants_list'][k]);
				}
				
				this.Item[i].grants_list.Data.div = C('div', 'In', temp_data_name.join('<br/>'));
				C(this.Item[i].grants_list.Data, 'In', this.Item[i].grants_list.Data.div);

				this.Item[i].grants_list.Structure.div = C('div', 'In', temp_structure_name.join('<br/>'));
				C(this.Item[i].grants_list.Structure, 'In', this.Item[i].grants_list.Structure.div);

				this.Item[i].grants_list.Administration.div = C('div', 'In', temp_administration_name.join('<br/>'));
				C(this.Item[i].grants_list.Administration, 'In', this.Item[i].grants_list.Administration.div);
			}


			this.ExistUser[this.Item[i].arr['Host'] + this.Item[i].arr['User']] = true;
			this.ExistAndGrantsUser[this.Item[i].arr['Host'] + this.Item[i].arr['User'] + this.Item[i].arr['grants_database'] + this.Item[i].arr['grants_table']] = true;
			if(("'" + this.AllUserName.join("','") + "'").indexOf("'" + this.Item[i].arr['User'] + "'") == -1) 
				this.AllUserName.push(this.Item[i].arr['User']);

			var arr = [
					C((NL > 1) ? C('td', {'rowSpan':NL}) : C('td'), 'In', this.Item[i].BtrAction),
					C((NL > 1) ? C('td', {'rowSpan':NL}) : C('td'), 'In', '<i>' + NoK + '</i>'),
					C((NL > 1) ? C('td', {'rowSpan':NL}) : C('td'), 'In', C('div', {'className':'field_div', 'innerHTML':this.Item[i].arr['User']})),
					C((NL > 1) ? C('td', {'rowSpan':NL}) : C('td'), 'In', C('div', {'className':'field_div', 'innerHTML':this.Item[i].arr['Host']})),
					C((NL > 1) ? C('td', {'rowSpan':NL}) : C('td'), 'In', C('div', {'innerHTML':(this.Item[i].arr['Password'] != '') ? 'Yes' : '<font style="color:red;">No</font>', 'title':this.Item[i].arr['Password']})),
					C((NL > 1) ? C('td', {'rowSpan':NL}) : C('td'), 'In', C('div', {'className':'field_div', 'innerHTML':this.Item[i].arr['PassPlugin'].replace(/_password/, '')})),
					(exist_MuchRow) ? ( (NL > 1 || NL == 0 ) ? this.Item[i].Action_small : C('td') ) : false,
					C('td', 'In', C('div', {'className':'field_div', 'innerHTML':this.Item[i].arr['grants_database']}) ),
					C('td', 'In', C('div', {'className':'field_div', 'innerHTML':this.Item[i].arr['grants_table']}) ),
					C('td', 'In', C('div', {'className':'field_div', 'innerHTML':this.Item[i].arr['grant']}) ),
					this.Item[i].grants_list.Data,
					this.Item[i].grants_list.Structure,
					this.Item[i].grants_list.Administration,
					C((NL > 1) ? C('td', {'rowSpan':NL}) : C('td'), 'In', C('div', {'className':'field_div', 'innerHTML':this.Item[i].arr['max_questions']})),
					C((NL > 1) ? C('td', {'rowSpan':NL}) : C('td'), 'In', C('div', {'className':'field_div', 'innerHTML':this.Item[i].arr['max_updates']})),
					C((NL > 1) ? C('td', {'rowSpan':NL}) : C('td'), 'In', C('div', {'className':'field_div', 'innerHTML':this.Item[i].arr['max_connections']})),
					C((NL > 1) ? C('td', {'rowSpan':NL}) : C('td'), 'In', C('div', {'className':'field_div', 'innerHTML':this.Item[i].arr['max_user_connections']}))
			];
			if(NL == 0) // 为0就删除相关不必要的td 
			{
				arr.splice(0,this.LeftTdNumber);
				var del_start = exist_MuchRow ? this.LeftTdNumber : this.LeftTdNumber-1;
				del_start += 1;	// Privileges推移1td
				arr.splice(del_start,11);
			}
			this.Item[i].btr = C('tr', 'In', arr);
			this.Item[i].btr.name = this.Item[i].arr['User']+this.Item[i].arr['Host'];
			this.Item[i].btr.key = i;


			// 数据行操作相关 *******************************
			if(PrivilegesCanEdit)
			{
				with(this)
				{
					(function (obj)
					{
						// 一用户多权限
						if (obj.Action_small)
						{
							obj.Action_small.del.onclick = function ()
							{
								var GD = obj.arr.grants_database == '*' ? obj.arr.grants_database : '`' + SqlKeyword(obj.arr.grants_database) + '`';
								var GT = obj.arr.grants_table == '*' ? obj.arr.grants_table : '`' + SqlKeyword(obj.arr.grants_table) + '`';
								var sql = "REVOKE ALL PRIVILEGES ON " + GD + "." + GT + " FROM  '" + SqlKeyword(obj.arr.User) + "'@'" + SqlKeyword(obj.arr.Host) + "';\n\r";
								
								// 存在授权
								if(obj.arr.grant == 'Yes')
								{
									sql += "REVOKE GRANT OPTION ON " + GD + "." + GT + " FROM  '" + SqlKeyword(obj.arr.User) + "'@'" + SqlKeyword(obj.arr.Host) + "';";
								}
								var Alerts = printf(L.ConfirmdeletionUserGrant, {'list':obj.arr.User + ': ' + obj.arr.grants_database + '.' + obj.arr.grants_table, 'del':L.Del}) + " \n\r" + sql;
								SqlSubmitFormObject.ConfirmSqlSubmit(Alerts, sql, 'index.php?c=privileges');
							}
							obj.Action_small.edit.onclick = function (type)
							{
								var add_location = (obj.NL) ? LeftTdNumber+1 : 0;
								if (!obj.edit.data &&  type != 'CancelEdit')
								{
									obj.edit.data = {};
									// 权限数据库
									obj.edit.data.Database = CreatesSelect(SelectDData, obj.arr.grants_database);
									obj.btr.getElementsByTagName('td')[1+add_location].getElementsByTagName('div')[0].style.display = 'none';
									C(obj.btr.getElementsByTagName('td')[1+add_location], 'In', obj.edit.data.Database);
									obj.edit.data.Database.onchange = function ()
									{
										var SelectDTData_item = ['*'];
										for (var key in SelectDTData)
										{
											if(SelectDTData[key][0] == this.value)
											for (var k in SelectDTData[key][1] )
												SelectDTData_item.push(SelectDTData[key][1][k]);
										}
										var tmp = obj.edit.data.Table.parentNode;
										tmp.removeChild(obj.edit.data.Table);
										obj.edit.data.Table = CreatesSelect(SelectDTData_item);
										tmp.appendChild(obj.edit.data.Table);
										obj.edit.data.Table.onchange = function ()
										{
											Change_Data_Structure_Administration(null, obj);
										}

										Change_Data_Structure_Administration(null, obj);
									}
									
									// 权限数据表
									var SelectDTData_item = ['*'];
									for (var key in SelectDTData)
									{
										if(SelectDTData[key][0] == obj.arr.grants_database)
										for (var k in SelectDTData[key][1] )
											SelectDTData_item.push(SelectDTData[key][1][k]);
									}
									obj.edit.data.Table = CreatesSelect(SelectDTData_item, obj.arr.grants_table);
									obj.btr.getElementsByTagName('td')[2+add_location].getElementsByTagName('div')[0].style.display = 'none';
									C(obj.btr.getElementsByTagName('td')[2+add_location], 'In', obj.edit.data.Table);
									obj.edit.data.Table.onchange = function ()
									{
										Change_Data_Structure_Administration(null, obj);
									}
									
									// 授权
									obj.edit.data.Grant =  C('input', {'type':'checkbox','checked':((obj.arr.grant == 'Yes') ? true:false)});
									obj.btr.getElementsByTagName('td')[3+add_location].getElementsByTagName('div')[0].style.display = 'none';
									C(obj.btr.getElementsByTagName('td')[3+add_location], 'In', obj.edit.data.Grant);
									
									Change_Data_Structure_Administration(obj.GM, obj);

								}
								else if(type != 'edit')
								{
								    obj.btr.getElementsByTagName('td')[1+add_location].getElementsByTagName('div')[0].style.display = 'block';
									obj.edit.data.Database.parentNode.removeChild(obj.edit.data.Database);

									obj.btr.getElementsByTagName('td')[2+add_location].getElementsByTagName('div')[0].style.display = 'block';
									obj.edit.data.Table.parentNode.removeChild(obj.edit.data.Table);

									obj.btr.getElementsByTagName('td')[3+add_location].getElementsByTagName('div')[0].style.display = 'block';
									obj.edit.data.Grant.parentNode.removeChild(obj.edit.data.Grant);
									
									obj.grants_list.Data.div.style.display = 'block';
									obj.edit.data.data_field.parentNode.removeChild(obj.edit.data.data_field);
								
									obj.grants_list.Structure.div.style.display = 'block';
									obj.edit.data.structure_field.parentNode.removeChild(obj.edit.data.structure_field);

									obj.grants_list.Administration.div.style.display = 'block';
									obj.edit.data.administration_field.parentNode.removeChild(obj.edit.data.administration_field);

									obj.edit.data = null;
								}

								
							}	
						}
						
						obj.input.onclick = function ()
						{
							return false;
						}
						

						//  主要编辑
						obj.edit.onclick = function (type)
						{
							// 多权限非第一列不能编辑
							if(!obj.NL) return;
							var add_location = exist_MuchRow ? 1 : 0;
							if (!obj.edit.MainData &&  type != 'CancelEdit')
							{
								obj.edit.MainData = {};
								obj.edit.MainData.User = C('input', {'type':'text', 'value':obj.arr.User}, {'width':'80px'});
								C(obj.btr.getElementsByTagName('td')[3], 'In', obj.edit.MainData.User);
								obj.btr.getElementsByTagName('td')[3].getElementsByTagName('div')[0].style.display = 'none';

								obj.edit.MainData.Host = C('span');
								obj.edit.MainData.Host.select = CreatesSelect([L.AnyLocal+'|%', L.local+'|localhost', L.UseText+'|']);
								obj.edit.MainData.Host.select.value = obj.arr.Host;
								obj.edit.MainData.Host.select.onchange = function ()
								{
									obj.edit.MainData.Host.text.value = this.value;
									if(this.value == '') obj.edit.MainData.Host.text.focus();
								}
								obj.edit.MainData.Host.text = C('input', {'type':'text', 'value':obj.arr.Host}, {'display':'block'});
								C(obj.edit.MainData.Host, 'In', [obj.edit.MainData.Host.select, obj.edit.MainData.Host.text]);
								C(obj.btr.getElementsByTagName('td')[4], 'In', obj.edit.MainData.Host);
								obj.btr.getElementsByTagName('td')[4].getElementsByTagName('div')[0].style.display = 'none';

								obj.edit.MainData.pass = C('span');
								obj.edit.MainData.pass.select = CreatesSelect([L.OldPassword+'|1', L.NewPassword+'|2', L.NoPassword+'|3']);
								obj.edit.MainData.pass.select.value = (obj.arr.Password != '') ? '1' : '3';
								obj.edit.MainData.pass.select.onchange = function ()
								{
									obj.edit.MainData.pass.text.disabled = (this.value == '2') ? false :true;
									if(this.value == '2') obj.edit.MainData.pass.text.focus();
								}
								obj.edit.MainData.pass.text =C('input', {'type':'password', 'disabled':true}, {'display':'block'});
								C(obj.edit.MainData.pass, 'In', [obj.edit.MainData.pass.select, obj.edit.MainData.pass.text]);
								C(obj.btr.getElementsByTagName('td')[5], 'In', obj.edit.MainData.pass);
								obj.btr.getElementsByTagName('td')[5].getElementsByTagName('div')[0].style.display = 'none';


								obj.edit.MainData.max_questions = C('input', {'type':'text', 'value':obj.arr.max_questions});
								C(obj.btr.getElementsByTagName('td')[13+add_location], 'In', obj.edit.MainData.max_questions);
								obj.btr.getElementsByTagName('td')[13+add_location].getElementsByTagName('div')[0].style.display = 'none';

								obj.edit.MainData.max_updates = C('input', {'type':'text', 'value':obj.arr.max_updates});
								C(obj.btr.getElementsByTagName('td')[14+add_location], 'In', obj.edit.MainData.max_updates);
								obj.btr.getElementsByTagName('td')[14+add_location].getElementsByTagName('div')[0].style.display = 'none';

								obj.edit.MainData.max_connections = C('input', {'type':'text', 'value':obj.arr.max_connections});
								C(obj.btr.getElementsByTagName('td')[15+add_location], 'In', obj.edit.MainData.max_connections);
								obj.btr.getElementsByTagName('td')[15+add_location].getElementsByTagName('div')[0].style.display = 'none';

								obj.edit.MainData.max_user_connections = C('input', {'type':'text', 'value':obj.arr.max_user_connections});
								C(obj.btr.getElementsByTagName('td')[16+add_location], 'In', obj.edit.MainData.max_user_connections);
								obj.btr.getElementsByTagName('td')[16+add_location].getElementsByTagName('div')[0].style.display = 'none';


								// 单列单权限
								if (obj.NL == 1)
								{
									obj.edit.data = {};
									// 权限数据库
									obj.edit.data.Database = CreatesSelect(SelectDData, obj.arr.grants_database);
									obj.btr.getElementsByTagName('td')[7+add_location].getElementsByTagName('div')[0].style.display = 'none';
									C(obj.btr.getElementsByTagName('td')[7+add_location], 'In', obj.edit.data.Database);
									obj.edit.data.Database.onchange = function ()
									{
										var SelectDTData_item = ['*'];
										for (var key in SelectDTData)
										{
											if(SelectDTData[key][0] == this.value)
											for (var k in SelectDTData[key][1] )
												SelectDTData_item.push(SelectDTData[key][1][k]);
										}
										var tmp = obj.edit.data.Table.parentNode;
										tmp.removeChild(obj.edit.data.Table);
										obj.edit.data.Table = CreatesSelect(SelectDTData_item);
										tmp.appendChild(obj.edit.data.Table);
										obj.edit.data.Table.onchange = function ()
										{
											Change_Data_Structure_Administration(null, obj);
										}

										Change_Data_Structure_Administration(null, obj);
									}
									
									// 权限数据表
									var SelectDTData_item = ['*'];
									for (var key in SelectDTData)
									{
										if(SelectDTData[key][0] == obj.arr.grants_database)
										for (var k in SelectDTData[key][1] )
											SelectDTData_item.push(SelectDTData[key][1][k]);
									}
									obj.edit.data.Table = CreatesSelect(SelectDTData_item, obj.arr.grants_table);
									obj.btr.getElementsByTagName('td')[8+add_location].getElementsByTagName('div')[0].style.display = 'none';
									C(obj.btr.getElementsByTagName('td')[8+add_location], 'In', obj.edit.data.Table);
									obj.edit.data.Table.onchange = function ()
									{
										Change_Data_Structure_Administration(null, obj);
									}
									
									// 授权
									obj.edit.data.Grant =  C('input', {'type':'checkbox','checked':((obj.arr.grant == 'Yes') ? true:false)});
									obj.btr.getElementsByTagName('td')[9+add_location].getElementsByTagName('div')[0].style.display = 'none';
									C(obj.btr.getElementsByTagName('td')[9+add_location], 'In', obj.edit.data.Grant);

									Change_Data_Structure_Administration(obj.GM, obj);
								}


								// 避免输入文本框右击菜单的快捷键字母
								for (var ik in [obj.edit.MainData, obj.edit.data] )
								{
									for (var ikm in [obj.edit.MainData, obj.edit.data][ik] )
									{
										[obj.edit.MainData, obj.edit.data][ik][ikm].onkeydown = function (event)	
										{
											event = event? event:window.event;
											if((event.keyCode == 69  || event.keyCode == 83 || event.keyCode == 68  || event.keyCode == 67 || event.keyCode == 82 ) && RightButtonRow != null)
											return false;
										}
									}
									
								}
							}
							else if(type != 'edit')
							{
								obj.btr.getElementsByTagName('td')[3].getElementsByTagName('div')[0].style.display = 'block';
								obj.edit.MainData.User.parentNode.removeChild(obj.edit.MainData.User);

								obj.btr.getElementsByTagName('td')[4].getElementsByTagName('div')[0].style.display = 'block';
								obj.edit.MainData.Host.parentNode.removeChild(obj.edit.MainData.Host);

								obj.btr.getElementsByTagName('td')[5].getElementsByTagName('div')[0].style.display = 'block';
								obj.edit.MainData.pass.parentNode.removeChild(obj.edit.MainData.pass);

								obj.btr.getElementsByTagName('td')[13+add_location].getElementsByTagName('div')[0].style.display = 'block';
								obj.edit.MainData.max_questions.parentNode.removeChild(obj.edit.MainData.max_questions);

								obj.btr.getElementsByTagName('td')[14+add_location].getElementsByTagName('div')[0].style.display = 'block';
								obj.edit.MainData.max_updates.parentNode.removeChild(obj.edit.MainData.max_updates);

								obj.btr.getElementsByTagName('td')[15+add_location].getElementsByTagName('div')[0].style.display = 'block';
								obj.edit.MainData.max_connections.parentNode.removeChild(obj.edit.MainData.max_connections);

								obj.btr.getElementsByTagName('td')[16+add_location].getElementsByTagName('div')[0].style.display = 'block';
								obj.edit.MainData.max_user_connections.parentNode.removeChild(obj.edit.MainData.max_user_connections);

								obj.edit.MainData = null;


								if (obj.NL == 1)
								{
									obj.btr.getElementsByTagName('td')[7+add_location].getElementsByTagName('div')[0].style.display = 'block';
									obj.edit.data.Database.parentNode.removeChild(obj.edit.data.Database);

									obj.btr.getElementsByTagName('td')[8+add_location].getElementsByTagName('div')[0].style.display = 'block';
									obj.edit.data.Table.parentNode.removeChild(obj.edit.data.Table);

									obj.btr.getElementsByTagName('td')[9+add_location].getElementsByTagName('div')[0].style.display = 'block';
									obj.edit.data.Grant.parentNode.removeChild(obj.edit.data.Grant);
									
									obj.grants_list.Data.div.style.display = 'block';
									obj.edit.data.data_field.parentNode.removeChild(obj.edit.data.data_field);
								
									obj.grants_list.Structure.div.style.display = 'block';
									obj.edit.data.structure_field.parentNode.removeChild(obj.edit.data.structure_field);

									obj.grants_list.Administration.div.style.display = 'block';
									obj.edit.data.administration_field.parentNode.removeChild(obj.edit.data.administration_field);

									obj.edit.data = null;
								}
							}
						}

						// 删除用户操作
						obj.del.onclick = function ()
						{
							var sql = "DROP USER '" + SqlKeyword(obj.arr.User) + "'@'" + SqlKeyword(obj.arr.Host) + "'";
							var Alerts = printf(L.ConfirmdeletionUser, {'list':obj.arr.User, 'del':L.Del}) + " \n\r" + sql;
							SqlSubmitFormObject.ConfirmSqlSubmit(Alerts, sql, 'index.php?c=privileges');
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
					for (var key in Item )
					{
						if (Item[key].btr.name == this.name)
							Item[key].btr.className = (Item[key].btr.className != '') ?  Item[key].btr.className + ' onmouseover' : 'onmouseover';
					}
				}
				Item[i].btr.onmouseout = function ()
				{
					var name = this.name;
					setTimeout(function ()
					{
						for (var key in Item )
						{
							if (Item[key].btr.name == name)
								Item[key].btr.className = Item[key].btr.className.replace(/onmouseover/, '');
						}
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

			this.Item[i].btr.className = (typeof(this.Item[i-1]) != 'object' || this.Item[i-1].btr.className == 'odd') ? '' : 'odd';
			if(NL == 0)	this.Item[i].btr.className = this.Item[i-1].btr.className;

			this.table_tbody.appendChild(this.Item[i].btr);
			temp_arr[this.Item[i].arr['User']+this.Item[i].arr['Host']] = 0;
			++i;
			
		} // **************************************************
		
		if(PrivilegesCanEdit)
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
				this.ActionTr.save,
				C('span','In',' &nbsp; '),
				this.ActionTr.exports,
				this.ActionTr.NewUser
				));
			}
			this.ActionTr.td.className = 'ActionTd';
			this.ActionTr.td.colSpan = ThItemSum + 5;
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
				for (var key in this.Item )
				{
					if (this.Item[key].btr.name == Tr.name)
					{
						this.Item[key].btr.className = this.Item[key].btr.className.replace(/marked/, '');
						this.Item[key].input.checked = false;
						this.Item[key].btr.marked = false;
				}
				}
			}
			else
			{
				for (var key in this.Item )
				{
					if (this.Item[key].btr.name == Tr.name)
					{
						this.Item[key].btr.className = this.Item[key].btr.className.replace(/marked/, '') + ' marked';
						this.Item[key].input.checked = true;
						this.Item[key].btr.marked = true;
				}
				}
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
				'MenuId':'AmysqlPrivilegesDataMenu', 'AreaDomID':'PrivilegesDataBlock',
				'MenuList':[
					{'id':'PLedit', 'name':L.Edit, 'KeyCodeTag':'E', 'ico':'ico_edit2', 'functions':function (){
						o.Item[o.RightButtonRow].edit.onclick('edit');
					}},
					{'id':'PLEditAll', 'name':L.EditSelects, 'functions':function (){
						o.ActionTr.edit.onclick();
					}},
					{'id':'PLdel', 'name':L.Del, 'KeyCodeTag':'D', 'ico':'ico_del2', 'functions':function (){
						o.Item[o.RightButtonRow].del.onclick();
					}},			
					{'className':'separator'},
					{'id':'PLsave', 'name':L.Save, 'KeyCodeTag':'S', 'ico':'ico_save2', 'functions':function (){
						o.ActionTr.save.onclick();
					}},
					{'className':'separator'},
					{'id':'PLDelAll', 'name':L.DeleteSelectedItems, 'functions':function (){
						o.ActionTr.del.onclick();
					}},	
					{'className': 'separator'},
					{'id':'PLCancelEdit', 'name':L.CanceledEdit, 'KeyCodeTag':'C', 'functions':function (){
						o.ActionTr.edit.onclick('CancelEdit');
					}},
					{'id':'PLCancelSelect', 'name':L.UncheckItem, 'functions':function (){
						o.ActionTr.NoAllSelect.onclick();
					}},
					{'className': 'separator'},
					{'id':'PLrenovate', 'name':L.ReloadPageData, 'KeyCodeTag':'R', 'ico':'ico_renovate2', 'functions':function (){
						FromObjectName = 'PrivilegesDataObject';
						SqlSubmitFormObject.SqlForm.action = 'index.php?c=privileges';
						G("SqlForm").onsubmit(parseInt(G("SqlformPage").value)) 
					}},
				],
				'initial': function ()	// 菜单初始化函数
				{
					
					var EditSum = 0;					// 是否有编辑项
					for (var k in [o.Item, o.TempItem]) 
					{ 
						for (var k2 in [o.Item, o.TempItem][k])
						{
							if([o.Item, o.TempItem][k][k2].edit.MainData ||[o.Item, o.TempItem][k][k2].edit.data) 
							{
								EditSum = 1;
								break;
							}
						}
						
					}
					var ActionSet = o.RightButtonRow != null ? true : false;		// 是否能操作
					this.get('PLedit').className = ActionSet ? 'item' : 'item2'; 
					this.get('PLEditAll').className = ActionSet ? 'item' : 'item2'; 
					
					this.get('PLsave').className = EditSum ? 'item' : 'item2';
					this.get('PLdel').className = ActionSet ? 'item' : 'item2'; 
					this.get('PLDelAll').className = ActionSet ? 'item' : 'item2'; 
					this.get('PLCancelEdit').className = EditSum ? 'item' : 'item2';

				},
				'close':function ()
				{
					o.RightButtonRow = null;		// 表格数据右击菜单标识清空
					o.AddLineTag = null;
				}
			});
		})
		(this);
	}
	
	this.Menu();
	
}