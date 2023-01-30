/************************************************
 *
 * Amysql AMS
 * Amysql.com 
 * @param Object 
 * AmysqlTableEmpty  
 *
 */
 //*****************************************

ExtendArray.push({
	'_Events':[
		{'_Event':
			{'load':function ()
				{
					// 清空数据
					NavigationObject.add({
						'id':'N_empty', 'text':L.Empty, 'defaults':DefaultActive.TableEmpty, 'content':'operation_sql', 
						'functions':function ()
						{
							SqlSubmitFormObject.operation_sql_text.value = 'TRUNCATE TABLE `' + SqlKeyword(TableName) + '`';
							SqlSubmitFormObject.UpOperationSqlNotice(printf(L.ConfirmEmptyTable, {'list':TableName, 'empty':'<font color="red"><b>' + L.Empty + '</b></font>'}) , 0);
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
			'ExtendId':'TableEmpty',
			'ExtendName':L.EmptyTable,
			'ExtendAbout':L.EmptyTableAbout,
			'Version':'1.00',
			'Date':'2012-04-06',
			'WebSite':'https://amh.sh',
			'PoweredBy':'Amysql'
	}
})
// ExtendArray End *****************
