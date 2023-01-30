/************************************************
 *
 * Amysql AMS
 * Amysql.com 
 * @param Object 
 * AmysqlEngines  
 *
 */

ExtendArray.push({
	'_Events':[
		{'_Event':
			{'load':function ()
				{
					// AmysqlEngines 
					NavigationObject.add({
						'id':'N_Engines', 'text':L.Engines, 'defaults':false, 'content':'TableDataMainBlock', 
						'functions':function ()
						{
							if(SqlSubmitFormObject.ActiveSetIng) return;	// 为激活操作直接返回，不重复提交
							var Sql = 'SHOW STORAGE ENGINES';
							SqlSubmitFormObject.SqlformoOriginal.value = SqlSubmitFormObject.sql_post.value = Sql;
							SqlEdit.setValue(Sql);
							ActiveSetID = 'N_Engines';	// 激活本版块	
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
			'ExtendId':'Engines',
			'ExtendName':L.MysqlEngine,
			'ExtendAbout':L.MysqlEngineAbout,
			'Version':'1.00',
			'Date':'2012-05-03',
			'WebSite':'https://amh.sh',
			'PoweredBy':'Amysql'
	}
})
// ExtendArray End *****************
