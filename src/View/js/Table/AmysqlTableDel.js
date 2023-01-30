/************************************************
 *
 * Amysql AMS
 * Amysql.com 
 * @param Object 
 * AmysqlTableDel  
 *
 */

ExtendArray.push({
	'_Events':[
		{'_Event':
			{'load':function ()
				{
					// 删除表 
					NavigationObject.add({
						'id':'N_del', 'text':L.Drop, 'defaults':DefaultActive.TableDel, 'content':'operation_sql', 
						'functions':function ()
						{
							SqlSubmitFormObject.ActionOperation.value == 1;
							SqlSubmitFormObject.operation_sql_text.value = 'DROP TABLE `' + SqlKeyword(TableName) + '`';
							SqlSubmitFormObject.UpOperationSqlNotice(printf(L.ConfirmDelTable, {'list':TableName, 'del':'<font color="red"><b>' + L.Del2 + '</b></font>'}) , 0);
							SqlSubmitFormObject.confirm_sql.style.display = 'inline';
						}
					});
					// End **
				}
			},
		'_EventObj':window
		}
	],
	'_ExtendInfo':{
			'ExtendId':'TableDel',
			'ExtendName':L.DelTableData,
			'ExtendAbout':L.DelTableDataAbout,
			'Version':'1.00',
			'Date':'2012-04-06',
			'WebSite':'https://amh.sh',
			'PoweredBy':'Amysql'
	}
})
// ExtendArray End *****************
