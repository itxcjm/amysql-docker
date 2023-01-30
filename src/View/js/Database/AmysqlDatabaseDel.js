/************************************************
 *
 * Amysql AMS
 * Amysql.com 
 * @param Object 
 * AmysqlDatabaseDel  
 *
 */

ExtendArray.push({
	'_Events':[
		{'_Event':
			{'load':function ()
				{
					// 删除表 
					NavigationObject.add({
						'id':'N_del', 'text':L.Drop, 'defaults':false, 'content':'operation_sql', 
						'functions':function ()
						{
							SqlSubmitFormObject.ActionOperation.value == 1;
							SqlSubmitFormObject.operation_sql_text.value = 'DROP DATABASE `' + SqlKeyword(DatabaseName) + '`';
							SqlSubmitFormObject.UpOperationSqlNotice(printf(L.ConfirmdeletionDatabase, {'list':DatabaseName, 'del':'<font color="red"><b> ' + L.Del + '</b></font>'}) , 0);
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
			'ExtendId':'DatabaseDel',
			'ExtendName':L.DeleteDatabase,
			'ExtendAbout':L.DeleteDatabaseAbout,
			'Version':'1.00',
			'Date':'2012-04-06',
			'WebSite':'https://amh.sh',
			'PoweredBy':'Amysql'
	}
})
// ExtendArray End *****************
