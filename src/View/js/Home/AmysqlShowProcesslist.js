/************************************************
 *
 * Amysql AMS
 * Amysql.com 
 * @param Object 
 * AmysqlShowProcesslist  
 *
 */

ExtendArray.push({
	'_Events':[
		{'_Event':
			{'load':function ()
				{
					// AmysqlShowProcesslist 
					NavigationObject.add({
						'id':'N_ShowProcesslist', 'text':L.ShowProcesslist, 'defaults':false, 'content':'TableDataMainBlock', 
						'functions':function ()
						{
							if(SqlSubmitFormObject.ActiveSetIng) return;	// 为激活操作直接返回，不重复提交
							var Sql = 'SHOW PROCESSLIST';
							SqlSubmitFormObject.SqlformoOriginal.value = SqlSubmitFormObject.sql_post.value = Sql;
							SqlEdit.setValue(Sql);
							ActiveSetID = 'N_ShowProcesslist';	// 激活本版块	
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
			'ExtendId':'ShowProcesslist',
			'ExtendName':L.ShowMysqlProcess,
			'ExtendAbout':L.ShowMysqlProcessAbout,
			'Version':'1.00',
			'Date':'2012-04-06',
			'WebSite':'https://amh.sh',
			'PoweredBy':'Amysql'
	}
})
// ExtendArray End *****************
