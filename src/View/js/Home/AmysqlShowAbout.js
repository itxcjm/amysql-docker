/************************************************
 *
 * Amysql AMS
 * Amysql.com 
 * @param Object 
 * AmysqlShowAbout  
 *
 */

ExtendArray.push({
	'_Events':[
		{'_Event':
			{'load':function ()
				{
					// AmysqlSqlHelp 
					NavigationObject.add({
						'id':'N_ShowAbout', 'text':L.ShowAbout, 'defaults':false, 'content':'TableDataMainBlock', 
						'functions':function ()
						{
							if(SqlSubmitFormObject.ActiveSetIng) return;	// 为激活操作直接返回，不重复提交
							var Sql = 'SHOW ABOUT';
							SqlSubmitFormObject.SqlformoOriginal.value = SqlSubmitFormObject.sql_post.value = Sql;
							SqlEdit.setValue(Sql);
							ActiveSetID = 'N_ShowAbout';	// 激活本版块	
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
			'ExtendId':'ShowAbout',
			'ExtendName':L.ShowAbout,
			'ExtendAbout':L.ShowAmysqlInfo,
			'Version':'1.00',
			'Date':'2012-04-06',
			'WebSite':'https://amh.sh',
			'PoweredBy':'Amysql'
	}
})
// ExtendArray End *****************
