/************************************************
 *
 * Amysql AMS
 * Amysql.com 
 * @param Object 
 * AmysqlLeftShowAndHide  
 *
 */

//*****************************************
ExtendArray.push({
	'_Events':[
		{'_Event':
			{'load':function ()
				{
					// 扩展管理
					NavigationObject.add({
						'id':'N_left', 'text':'»', 'defaults':false, 'content':'', 
						'functions':function ()
						{
							var AmysqlLeftAndContent = parent.parent.G('AmysqlLeftAndContent');
							if (AmysqlLeftAndContent.getAttribute('cols') != '0,*')
								AmysqlLeftAndContent.setAttribute('cols', '0,*');
							else
							    AmysqlLeftAndContent.setAttribute('cols', '236,*');
						}
					});
					// End **
				}
			},
		'_EventObj':window
		}
	],
	'_ExtendInfo':{
			'ExtendId':'LeftShowHide',
			'ExtendName':L.AmysqlLeftShowHide.PlugName,
			'ExtendAbout':L.AmysqlLeftShowHide.PlugAbout,
			'Version':'1.00',
			'Date':'2013-01-02',
			'WebSite':'https://amh.sh',
			'PoweredBy':'Amysql'
	}
})
// ExtendArray End *****************
