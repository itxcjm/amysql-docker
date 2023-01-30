/************************************************
 *
 * Amysql AMS
 * Amysql.com 
 * @param Object 
 * AmysqlContentNavigation 导航 
 *
 */
 
var Navigation = function ()
{
	this.list = G('CB_Navigation');
	this.Item = new Array();
	this.LastClickItem = null;				// 最后点击项
	this.ActiveSetIng = false;				// 激活设置进行中

	this.add = function (item)
	{
		item.li = C('li');
		item.li.i = C('i');
		item.li.b = C('b', 'In', item.text);
		item.li.id = item.id;
		item.li.defaults = false;

		if(item.defaults) 
		{
			this.ActiveSet(item);
		}
		C(item.li, 'In', [item.li.i, item.li.b]);
		
		(function (o, t)
		{
			o.li.onmouseover = function ()
			{
				if(this.className.indexOf('active') == -1) this.className = (this.className != '') ?  this.className + ' hover' : 'hover';
			}
			o.li.onmouseout = function ()
			{
				this.className = this.className.replace(/hover/, '');
			}
			o.li.onclick = function ()
			{
				if(t.LastClickItem && t.LastClickItem.id == o.id) return;
				t.ActiveSet(o);
			}

		})(item, this);

 		C(this.list, 'In', item.li);
		this.Item[item.id] = item;
	}

	this.ActiveSet = function (item)
	{
		if(G(item.content))
		{
			if(this.LastClickItem) this.LastClickItem.li.className = this.LastClickItem.li.className.replace(/active/, '');
			item.li.className =  'active';

			// 隐藏其它块显示当前块
			for (var k in this.Item )
				if(this.Item[k].content) G(this.Item[k].content).style.display = 'none';
			 G(item.content).style.display = 'block';
			this.LastClickItem = item;
		}
		item.functions();
	}
}