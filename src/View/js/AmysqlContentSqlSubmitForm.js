/************************************************
 *
 * Amysql AMS
 * Amysql.com 
 * @param Object 
 * AmysqlSqlSubmitForm  
 * 
 */

var SqlEdit;

// Loading 
var List_loading;
var loadingObject = {};
//*****************************************

var AmysqlSqlSubmitForm = function ()
{
		
	this.sql_post = G('sql_post');
	this.SqlformoOriginal = G('SqlformoOriginal');
	this.SqlStatus = G('SqlStatus');
	this.SqlICOStatus = G('SqlICOStatus');
	this.OSqlNotice = G('OSqlNotice');
	this.operation_sql = G('operation_sql');
	this.OP_SqlICOStatus = G('OP_SqlICOStatus');

	this.OP_SqlStatus = G('OP_SqlStatus');
	this.operation_sql_text = G('operation_sql_text');
	this.OP_SqlNotice = G('OP_SqlNotice');
	this.confirm_sql = G('confirm_sql');
	this.ActionOperation = G('ActionOperation');
	this.SqlformPage = G('SqlformPage');
	this.SqlForm = G('SqlForm');
	this.cancel_confirm_sql = G('cancel_confirm_sql');

	

	// 更新Sql查询数据提示
	this.UpSqlNotice = function (html, SqlStatus)
	{
		this.SqlStatus.className = SqlStatus ? 'SqlSuccess' : 'SqlError';
		this.SqlICOStatus.className = SqlStatus ? 'ico ico_sqlsuccess' : 'ico ico_sqlError';
		this.OSqlNotice.innerHTML = html;
		this.operation_sql.style.display = 'none';
		set_location_top(0);
	}

	// 更新Sql操作数据提示
	this.UpOperationSqlNotice = function (html, SqlStatus)
	{
		this.operation_sql.style.display = 'block';
		this.OP_SqlStatus.className = SqlStatus ? 'SqlSuccess' : 'SqlError';
		this.OP_SqlICOStatus.className = SqlStatus ? 'ico ico_sqlsuccess' : 'ico ico_sqlError';
		this.operation_sql_text.className = SqlStatus ? 'success_sql_text' : 'warning_sql_text';
		this.OP_SqlNotice.innerHTML = html;
		this.confirm_sql.style.display = 'none';
		set_location_top(0);
	}
	
	// 确认提交操作Sql
	this.ConfirmSqlSubmit = function (Alerts, sql, action)
	{
		if(typeof(Alerts) == 'string' && Alerts != ''  && !confirm(Alerts)) return;	// 确认提示
		this.ActionOperation.value = 1;
		if(sql && sql != '') this.operation_sql_text.value = sql;
		if(action && action != '') this.SqlForm.action = action;
		this.SqlForm.onsubmit(parseInt(this.SqlformPage.value));
	}

	with(this)
	{
		// Sql编辑
		SqlEdit = CodeMirror.fromTextArea(this.sql_post, {
			lineNumbers: true,
			matchBrackets: true,
			indentUnit: 4,
			mode: "text/x-plsql"
		  });

		// Sql表单提交
		SqlForm.onsubmit = function (page)
		{
			page = parseInt(page);
			page = page > PageSum ? PageSum : page;
			page = (isNaN(page) || page == 0) ? 1 : page;
			SqlformPage.value = page;
			List_loading();	
			if(page) this.submit();
			if(PageObject) PageObject.listG_input_focus = false;
		}

		// 点击确认操作SQL
		confirm_sql.onclick = function ()
		{
			ConfirmSqlSubmit(L.Reconfirmed + '：' + (OP_SqlNotice.innerText ? OP_SqlNotice.innerText : OP_SqlNotice.textContent));
		}

		// 取消确认操作SQL
		cancel_confirm_sql.onclick = function ()
		{
			ActionOperation.value = 0;
			operation_sql.style.display = 'none';
		}
	}

}


// 表单分页对象 **************************
var PageList = function (id)
{
	this.Item = [];
	this.PageLimit = 8;		// 页码界限
	this.listT = G(id);		// 分页DOM
	this.listS = {};		// 页码选择框
	this.listG = {};		// GO跳转
	this.listG_input_focus = (PageObject && PageObject.listG_input_focus ) ? true : false;

	this.SubmitPage = function (page)
	{
		SqlSubmitFormObject.sql_post.value = SqlSubmitFormObject.SqlformoOriginal.value;
		SqlSubmitFormObject.SqlForm.onsubmit(page);
	}
	this.add = function (page, type, txt)
	{
		var o = {};
		o.id = page;
		if(type == 'button')
			o.H = C('input', {'type':'button', 'value':txt});
		else
		{
			o.H = C('a', {'innerHTML':page, 'href':'javascript:'});
			if(type == 'now') C(o.H, {'className':'page_now'});
		}
		with(this)
		{
			o.H.onclick = function ()
			{
				SubmitPage(page);
			}
		}
		this.Item.push(o);
	}

	this.set = function(page, total_page)
	{
		var start,end;
		if(page-7>0)
		{
			start = page-7;
			if(page+7<total_page)
				end=page+7;	
			else
			{
				if(total_page-10>0)
					start=total_page-10;
				else
					start=1;
				end=total_page;
			}
		}
		else
		{
			start=1;
			if(total_page<15)
				end=total_page;
			else 
				end=15;
		}
		if(start > 1)
			this.add(1, 'button', '<<');

		if(page>8)
			this.add(page-1, 'button', '<');
 		
		for(var i=start;i<=end;i++)
		{
			if (i != page)
				this.add(i);
 			else
				this.add(i, 'now');
 		}
		
		if(end<total_page)
			this.add(page+1, 'button', '>');
 		if(end!=total_page)
			this.add(total_page, 'button', '>>');
	}
	this.show = function ()
	{	
		if(this.Item.length == 0) return;
		this.listT.innerHTML = '';

		// 主键排序
		C(this.listT, 'In', TableIndexOrder.dom);

		// 页码Select选择框
		if (PageSum > this.PageLimit)
		{
			var SelectVal = 0;
			var SelectValArr = [];
			var SelectValNow = 0;
			var i = PageSum;
			while (i)
			{
				SelectVal = parseInt(((SelectVal != 0) ? SelectVal : PageSum)/1.3);
				if(SelectVal == page) SelectValNow = page;
				if(!SelectValNow && SelectVal < page) 
				{
					SelectValArr.push(page+'');
					SelectValNow = page;
				}
				if(SelectVal < 1) break;
				SelectValArr.push(SelectVal+'');
			}
			if(SelectValArr.length > 0) 
			{
				if(PageSum != page) SelectValArr.push(PageSum+'');
				SelectValArr.sort(function SortNumber(a, b){
					return a-b;
				});
				this.listS = CreatesSelect([['Page', SelectValArr]], page+'');
				C(this.listT, 'In', this.listS);
			}
			with(this)
			{
				listS.onchange = function ()
				{
					SubmitPage(this.value);
				}
			}
		}

		// 页码列表
		for (var x in this.Item)
			C(this.listT, 'In', this.Item[x].H);

		// GO跳转
		if (PageSum > this.PageLimit)
		{
			with(this)
			{
				listG = C('form', '', {'display':'inline', 'marginLeft':'10px'});
				listG._input = C('input', {'id':'listG_input', 'type':'text', 'value':page}, {'width':10 + parseInt((page+'').length) * 7 + 'px'});
				listG._button = C('input', {'type':'button', 'value':'Go'});
				listG.onsubmit = function ()
				{
					listG._button.onclick();
					return false;
				}
				listG._button.onclick = function ()
				{
					SubmitPage(listG._input.value);
					listG_input_focus = true;
				}
			}
			C(this.listG, 'In', [this.listG._input, this.listG._button]);
			C(this.listT, 'In', this.listG);
			if(this.listG_input_focus) 
			{
				this.listG._input.selectionStart = this.listG._input.selectionEnd = parseInt((this.listG._input.value+'').length);
				this.listG._input.focus();
			}
		}

		this.listT.style.whiteSpace = 'nowrap';
	}
	
}


// 数据加载Loading 
var List_loading = function (type)
{
	if(!window[FromObjectName] || window[FromObjectName].table == null || !window[FromObjectName].Item.length) return;
	var ListDataTemp = G(window[FromObjectName].ListData.id);
	if (type == 'hide')	// 删除
	{
		if(document.all)  { window[FromObjectName].table.style.filter = 'alpha(opacity=100);'; }
		window[FromObjectName].table.style.opacity = 1;
		// 可能存在hide多次的情况
		try { ListDataTemp.removeChild(loadingObject); }
		catch (e){ return; }
		return true;
	}

	// (TableDataObject.list)由于语言DOM重新写问题，更改为用G方法 2012-12-2
	ListDataTemp.getElementsByTagName('table')[0].style.opacity = 0.4;
	if(document.all)  { ListDataTemp.getElementsByTagName('table')[0].style.filter = 'alpha(opacity=40);'; }
	loadingObject = C(C('div', 'In', new Array(C('span', 'In', '<b>Loading.......</b>'), C('div', {'id':'page_loading_img'}) )), {'id':'page_loading'});
	
	var top_height = (getScrollTop() - G('ListPageOffsetTop').offsetTop -100) < 180 ? 180 : (getScrollTop() - G('ListPageOffsetTop').offsetTop + 200);
	loadingObject.style.top = parseInt(ListDataTemp.offsetHeight) < 580 ? ListDataTemp.offsetHeight /2 + 'px' :  top_height + 'px';
	loadingObject.style.bottom = 'auto';

 	ListDataTemp.appendChild(loadingObject);
}