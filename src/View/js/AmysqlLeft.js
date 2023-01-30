/************************************************
 *
 * Amysql Framework
 * Amysql.com 
 * @param Object AmysqlLeftListObject
 * AmysqlLeft 左栏列表对象 
 *
 */
var AmysqlLeftListObject = function ()
{
	this.AmysqlLeftList = null;
	this.list = C('ul');
	this.CopyRight =  C('A', {'className':'ico2 ico_copyright','id':'copyright','title':'Powered by Amysql'});
	this.Logo = {};
	this.ExtendObject = [];
	this.LastClickItem = {};				// 最后点击项

	this.add = function (json, parentE)
	{
		var TempWidth = '';
		var ul = (parentE) ? parentE: this.list;		// 父DOM
		if(typeof(ul.Item) != 'object') ul.Item = [];
		for (var k in json)
		{
			var i = json[k].id;
			var li = C('li',{'id':json[k].id,'name':json[k].name,'url':json[k].url});
			li.title = json[k].title ? json[k].title : '';
			li.dl = C('dl', {'className':'_c'});
			li.dd = C('dd', {'className':(json[k].ChildItem) ? (json[k].open ? 'closelist':'openlist') : ''});
			li.dt = C('dt');
			li.dt.i = C('i',{'className':json[k].IcoClass});
			li.dt.em = C('em');
			li.dt.em.sum = json[k].ChildItemSum;	// 子项数量
			li.dt.em.innerHTML = (json[k].ChildItemSum) ? ' (' + json[k].ChildItemSum + ') ' : '';
			li.dt.a = C('a',{'innerHTML':json[k].name});
			C(li,'In',C(li.dl,'In',[li.dd,C(li.dt,'In',[li.dt.i, li.dt.a, li.dt.em])]));

			li.ChildItemData = json[k].ChildItem;	// 子项数据
			li.ExistLoad = json[k].LoadDom;			// 是否已存在加载数据
			ul.Item[i] = li;
			
			// 宽度适应 强制换行
			if(TempWidth == '' && ul.parentNode && ul.parentNode.dt)
				TempWidth = ul.parentNode.dl.offsetWidth - (ul.parentNode.dd.offsetWidth + ul.parentNode.dt.i.offsetWidth) - (getScrollHeight() > getClientHeight() ? 30:50);
			if(TempWidth != '') li.dt.a.style.width = TempWidth + 'px';
			
			if (ul.Item[i].ChildItemData != null)
			{
				ul.Item[i].ChildItem = C('ul','',{'display':(json[k].open)? 'block':'none'});			// 子项Dom
				C(ul.Item[i], 'In', ul.Item[i].ChildItem);
				if(json[k].LoadDom) this.add(ul.Item[i].ChildItemData, ul.Item[i].ChildItem);			// 是否默认加载子项数据
			}
			C(ul,'In',ul.Item[i]);

			(function (o, t)
			{
				o.dl.onclick = function ()
				{
					if(o.ChildItem)
					{
						if(!o.ExistLoad) t.add(o.ChildItemData, o.ChildItem);	// 加载数据
						o.ExistLoad = true;	// 标识已载
					}
					AmysqlLeftList.CopyAutoHeight();
				}
				o.dt.onclick = function (e)
				{
					if(o.ChildItem)
					{
						o.ChildItem.style.display = 'block';
						o.dd.className = 'closelist';
					}
					parent.OpenWindow('Activate', o.id, o.name, o.url);

					if(t.LastClickItem.dt) t.LastClickItem.dt.a.className = '';
					o.dt.a.className = 'hover';
					t.LastClickItem = o;
					AmysqlLeftList.CopyAutoHeight();
					t.RunExtend('ListClick');
				}
				o.dd.onclick = function ()
				{
					if(o.ChildItem)
					{
						o.ChildItem.style.display = o.ChildItem.style.display == 'block' ? 'none':'block';
						var status = (o.ChildItem.style.display == 'none') ? 'openlist':'closelist';
						this.className = status;
					}
					t.RunExtend(status);
				}
			})(ul.Item[i], this)

		}
		return true;
	}
	this.CopyAutoHeight = function ()
	{
		// copyright show
		C(this.CopyRight,'',{'display':getClientHeight()-70-AmysqlLNO.LeftNavigationDom.clientHeight > this.AmysqlLeftList.scrollHeight ? 'block':'none'});
		
		if(getScrollHeight() > getClientHeight())
			C(G('left'),{'className':'Scroll'});
		else 
			C(G('left'),{'className':' '});
	}

	this.run = function ()
	{
		if(this.AmysqlLeftList == null)
		{
			this.AmysqlLeftList = G('AmysqlLeftList');
			C(this.AmysqlLeftList,'In',this.list);
			if(this.CopyRight)
			{
				C(window.document.body, 'In', this.CopyRight);
				this.CopyRight.onclick = function ()
				{
					parent.OpenWindow('Activate', 'Amysql2012', 'amh.sh', 'https://amh.sh/');
				}
			}
			this.CopyAutoHeight();
			this.RunExtend('run');
		}

		this.Logo = G('left_logo');
		this.Logo.onclick = function ()
		{
			// 打开系统默认窗口
			parent.OpenWindow('Activate', parent._AmysqlTabJson[0].id, parent._AmysqlTabJson[0].name, parent._AmysqlTabJson[0].url);
		}
	}
	
	this.RunExtend = function (id)
	{
		for (var k in this.ExtendObject[id])
			this.ExtendObject[id][k]();
	}

	this.extend = function (functions, id)
	{
		if(typeof(id) != 'object') id = [id];
		for (var k in id )
		{
			if(!this.ExtendObject[id[k]])
				this.ExtendObject[id[k]] = [];
			this.ExtendObject[id[k]].push(functions);
		}
	}
}




