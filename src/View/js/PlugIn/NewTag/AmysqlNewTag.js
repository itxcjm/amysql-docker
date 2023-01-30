/************************************************
 *
 * Amysql Framework
 * Amysql.com 
 * @param Object AmysqlNewTag 新建窗口插件
 *
 */

if(window.AmysqlMainObject)
{

	AmysqlMainObject.AmysqlExtend.push({
		'_ExtendInfo':{
			'ExtendId':'AmysqlNewTag',
			'PlugName':L.AmysqlNewTagLanguage.PlugName,
			'PlugAbout':L.AmysqlNewTagLanguage.PlugAbout,
			'Sort':'Menu',
			'Version':'1.10',
			'Date':'2011-05-19',
			'WebSite':'https://amh.sh',
			'PoweredBy':'Amysql'
		},
		
		'_AmysqlLNIJson':[{
			'order':1,
			'id':'NewTag', 
			'name':L.AmysqlNewTagLanguage.name, 
			'PlugIn':true,
			'action':function ()
			{
				_AmysqlLeft.AmysqlLNO.get('NewTag').TagId = 'New-' + parseInt(1000*Math.random());
				return true;
			},
			'url':'js/PlugIn/NewTag/AmysqlNewTag.js'
		}]

	});

}

if(window.ExtendContent)
{

	var AmysqlTagWindow = parent.parent.window.frames.AmysqlTag;
	var AmysqlParentWindow = parent.window;


	var GoShow = function ()
	{

		this.AmysqlNewTag = C('div', {'id':'AmysqlNewTag'});
		this.txt = C('div', 'In', 'Input Url OR Keyword:<br />');
		this.form = C('form', {'method':'GET','action':''});
		this.inputs = C('input', {'type':'text','className':'input','value':''});
		this.submits = C('input', {'type':'submit','value':' Go ','className':'button'});

		(function (o)
		{
			o.form.onsubmit = function ()
			{
				var url = o.inputs.value;
				if(url.indexOf('http') != 0) url = 'http://www.baidu.com/s?wd='+url+'&rsp=0&oq=Amysql&f=1&rsv_ers=xn1&rs_src=0';
				var NowContent = AmysqlParentWindow.AmysqlContentObject.LastClickItem;	// 当前内容项
				NowContent.command = url;
				NowContent.src = url;
				AmysqlParentWindow.AmysqlContentObject.LoadAction(NowContent, false);	// 重载入
				return false;
			}
		})(this)

		document.body.innerHTML = '';
		C(this.form, 'In', [this.txt, this.inputs, this.submits]);
		C(this.AmysqlNewTag, 'In', this.form);
		C(document.body, 'In', [
			C('link',{'type':'text/css','rel':'stylesheet','href':'js/PlugIn/NewTag/style.css'}),
			this.AmysqlNewTag
		]);
		document.body.focus();	// ie6
		this.inputs.focus();
	}

	document.body.innerHTML = '<div id="LoadingBlock">&nbsp; Loading...<div id="loading"></div></div>';
	setTimeout(
		function () {
				var GoShowObject = new GoShow();
		}, 0
	);

}