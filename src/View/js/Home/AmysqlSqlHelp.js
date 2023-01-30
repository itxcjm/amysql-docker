/************************************************
 *
 * Amysql AMS
 * Amysql.com 
 * @param Object 
 * AmysqlSqlHelp  
 *
 */

ExtendArray.push({
	'_Events':[
		{'_Event':
			{'load':function ()
				{
					// AmysqlSqlHelp 
					NavigationObject.add({
						'id':'N_ShowSqlHelp', 'text':L.ShowSqlHelp, 'defaults':false, 'content':'TableDataMainBlock', 
						'functions':function ()
						{
							if(SqlSubmitFormObject.ActiveSetIng) return;	// 为激活操作直接返回，不重复提交
							var Sql = 'SHOW SQL HELP';
							SqlSubmitFormObject.SqlformoOriginal.value = SqlSubmitFormObject.sql_post.value = Sql;
							SqlEdit.setValue(Sql);
							ActiveSetID = 'N_ShowSqlHelp';	// 激活本版块	
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
			'ExtendId':'ShowSqlHelp',
			'ExtendName':L.SqlStatementHelp,
			'ExtendAbout':L.SqlStatementHelpAbout,
			'Version':'1.00',
			'Date':'2012-04-06',
			'WebSite':'https://amh.sh',
			'PoweredBy':'Amysql'
	}
})
// ExtendArray End *****************
