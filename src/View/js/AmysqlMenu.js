/************************************************
 *
 * Amysql AMS
 * Amysql.com 
 * @param Object AmysqlMenu
 *
 */
function AmysqlMenu()
{
	this.Item = [];		// 所有菜单集合

	this.KeyCodeList = {'65':'a','66':'b', '67':'c', '68':'d', '69':'e', '70':'f', '71':'g', '72':'h', '73':'i', '74':'j', '75':'k', '76':'l', '77':'m', '78':'n', '79':'o', '80':'p', '81':'q', '82':'r', '83':'s', '84':'t', '85':'u', '86':'v', '87':'w', '88':'x', '89':'y', '90':'z'};
	
	this.add = function(item)
	{
		if(G(item.MenuId)) document.body.removeChild(G(item.MenuId));
		
		// 菜单DOM
		item.MenuDom = C('div', {'id':item.MenuId, 'className':'AmysqlMenu'});
		item.MenuDom.OncontextmenuTag = false;
		item.MenuDom.style.cssText = 'display:none;position:absolute;display:none;top:0px;left:0px;z-index:10000;';
		item.MenuDom.OncontextmenuTag = false;	// 是否菜单右击	
		item.IframeMenu = false;				// 菜单Iframe
		item.status = 'close';

		// 菜单列表各项
		item.MenuUlDom = C('ul');
		item.MenuUlDom.Item = [];
		item.MenuUlDom.width = 0;
 
		for (var k in  item.MenuList)
		{
			// li子项Dom
			var li = C('li');
			if(item.MenuList[k].id) C(li, {'id':item.MenuList[k].id});
			if(item.MenuList[k].KeyCodeTag) C(li, {'KeyCodeTag':item.MenuList[k].KeyCodeTag});
			if(item.MenuList[k].name) C(li, {'innerHTML': ' <a class="' + (item.MenuList[k].ico ? item.MenuList[k].ico : '') + ' ico2"></a>' + item.MenuList[k].name + ((item.MenuList[k].KeyCodeTag) ? ' (<u>' + item.MenuList[k].KeyCodeTag + '</u>)' : '')});
			if(item.MenuList[k].className) C(li, {'className':item.MenuList[k].className});
			C(li, {'className':li.className + ' item' });

			// 菜单项命令
			(function (o, k, t)
			{
				if(o.MenuList[k].functions)
				{
					li.onclick = function ()
					{
						// 菜单变灰色拉，返回
						if(this.className.indexOf('item2') != -1)
						{
							o.MenuDom.OncontextmenuTag = true;		// 不关闭菜单标记
							return;
						}
						
						o.MenuDom.style.display = 'none';
						o.MenuList[k].functions();
						t.hide(o);
					}
				}
			})(item, k, this);

			li.onmouseover = function ()
			{
				 var Over = trim(this.className) == 'item' ? ' YitemOver' : ' NitemOver';
				 this.className = trim(this.className) + Over;
			}
			li.onmouseout = function()
			{
				this.className = this.className.replace(/YitemOver|NitemOver/, '');
			}	

			C(item.MenuUlDom, 'In', li);	// 写至菜单Dom
			item.MenuUlDom.Item.push(li);	// 记录子项Dom
		}
		C(item.MenuDom, 'In', item.MenuUlDom);
		C(document.body, 'In', item.MenuDom);
		this.Item[item.MenuId] = item;


		(function (o, t)
		{	
			// 追加document响应事件关闭菜单
			AddEvent({
				'click':function (e){
					e = e ? e : window.event;
					if(e.button != 0 )return;
					if(!o.MenuDom.OncontextmenuTag) t.hide(o);	
					o.MenuDom.OncontextmenuTag = false;
				},
				'contextmenu':function (){
					if(!o.MenuDom.OncontextmenuTag) t.hide(o);	
					o.MenuDom.OncontextmenuTag = false;
				},
				'keyup':function (e)
				{
					e = e ? e : window.event;
					if(o.status == 'show')	// 键盘快捷键响应
					{
						for (var k in o.MenuUlDom.Item)
						{
							if(o.MenuUlDom.Item[k].KeyCodeTag)
							{	
								if(o.MenuUlDom.Item[k].KeyCodeTag.toLowerCase() == t.KeyCodeList[e.keyCode])
									o.MenuUlDom.Item[k].onclick();
							}
						}
					}
				}
			},document);
		
			// 区域响应菜单
			G(o.AreaDomID).oncontextmenu = function (e)
			{
				o.status = 'show';
				if(o.initial) o.initial();

				o.MenuDom.OncontextmenuTag = true;		// 在区域当中右击不关闭菜单标记
				o.MenuDom.style.display = 'block';
				var _X =  positionX(e);
      			var _Y =  positionY(e);

				var _bodyWidth = parseInt(document.body.scrollWidth);
				var _bodyHeight = parseInt(document.body.scrollHeight);
				var _mWidth = parseInt( o.MenuDom.offsetWidth || o.MenuDom.style.width);
				var _mHeight = parseInt(o.MenuDom.offsetHeight);

				o.MenuUlDom.width = o.MenuUlDom.scrollWidth;		// 记录宽度

				o.MenuDom.style.left = ((_X + _mWidth) > _bodyWidth?(_X - _mWidth):_X) - 10 +"px";
				o.MenuDom.style.top  = ((_Y + _mHeight) > _bodyHeight?(_Y - _mHeight):_Y) - 5 +"px";
				if(_Y < _mHeight) o.MenuDom.style.top = _Y - 5 + 'px';

				o.MenuUlDom.style.width = o.MenuUlDom.width + 'px';	// 自动宽度2012-05-17

				// IframeMenu相关
				var IframeMenuStyle = {
				  "left"   : o.MenuDom.style.left,
				  "top"    : o.MenuDom.style.top,
				  "width"  : _mWidth +"px",
				  "height" : _mHeight+"px",
				  "z-index": (parseInt(o.MenuDom.style.zIndex)-1)
				}
				if(if_ie())
				{
					if(!o.IframeMenu)
						o.IframeMenu = t.createIframeMenu(IframeMenuStyle);
					else 
						t.createIframeMenu(IframeMenuStyle, o.IframeMenu);
				}
				return false;
			}

			// 取得子项Dom
			o.get = function (id)
			{
				for (var k in o.MenuUlDom.Item)
					if(o.MenuUlDom.Item[k].id == id) return o.MenuUlDom.Item[k];
			}
		})
		(item, this);
	}

	// 关闭菜单
	this.hide = function (item)
	{
		if(if_ie() && item.IframeMenu)
			item.IframeMenu.style.display = 'none';
		item.MenuDom.style.display = 'none';

		if(item.close) item.close();
		item.status = 'close';
	}
	
	// 为IE创建iframe
	this.createIframeMenu = function(styleData, IframeMenu)
	{
		var maskStyle = "position:absolute;left:"+styleData["left"]+";top:"+styleData["top"]+";width:"+styleData["width"]+";height:"+styleData["height"]+";z-index:"+styleData["z-index"];
		if(IframeMenu)
			IframeMenu.style.cssText = maskStyle;
		else
		{
			var IframeMenu = document.createElement('<iframe id="IframeMenu" src="" frameborder="0" border="0" scrolling="no"></iframe>');
			document.body.appendChild(IframeMenu);
			IframeMenu.style.cssText = maskStyle;
		}
		maskStyle = null;
		return IframeMenu;
	}
}

