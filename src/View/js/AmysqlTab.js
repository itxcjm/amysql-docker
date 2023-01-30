/************************************************
 *
 * Amysql Framework
 * Amysql.com 
 * @param Object AmysqlTab 标签对象
 *
 */

 // 标签项对象 **************************
var AmysqlTabItem = function (type,id,text,command,change)
{
	if(id.substr(0,1).match(/^[0-9]+$/) != null) id = 'AMF-' + id;	// 首字母不能为数字
	this.OriginalId = id;								// 原始ID
	this.type = (type == '') ? 'Normal' : type;			// 类型 Activate Hover Normal 三种
	this.id = id;										// 定义唯一ID
	this.text = text;									// 标签文字
	this.command = command;								// 命令
	this.I = null;										// 标签项元素
	var Temp_text = (text.length < 25 ) ? this.text : this.text.substr(0,25) + '...';
	if( type == 'Activate') Temp_text = this.text;		// Activate类型显示全部文字
	this.Font = C('font',{'innerHTML':Temp_text});		// 标签TEXT
	this.Font.className = 'text';
	this.Split = C('span',{'className':'Split'});
	this.ActivateLeft = C('span',{'className':'ActivateLeft'});
	this.ActivateCenter = C('span',{'className':'ActivateCenter'});
	this.ActivateRight = C('span',{'className':'ActivateRight'});
	this.Hover = C('span',{'className':'Hover'});
	this.Normal = C('span',{'className':'Normal'});
	this.CloseTag = null;
	this.TagListKey = null;								// 标签在列表的key

	this.I = C('span',{'className':'TabItem'});
	this.I.id = id;
	this.I.title = this.text;

	this.ItemClose = C('i',{'className':'ItemClose'});
	this.ItemCloseNow = C('i',{'className':'ItemCloseNow'});


	// 第一个标签
	if(AmysqlTabObject.NumberOneId == null)
		AmysqlTabObject.NumberOneId = this.id;
	
	// 创建不同类型标签
	if (type == 'Activate')
	{
		this.I.appendChild(this.ActivateLeft);
		this.Font.style.cssText = "font-weight:bold;color:#385063";
		this.ActivateCenter.appendChild(this.Font);
		this.CloseTag = this.ItemCloseNow;

		// 第一个标签不能关掉
		if(AmysqlTabObject.NumberOneId == this.id)
			this.CloseTag = this.ItemClose;
		
		this.ActivateCenter.appendChild(this.CloseTag);
		this.I.appendChild(this.ActivateCenter);
		this.I.appendChild(this.ActivateRight);
	}
	else if (type == 'Hover')
	{
		this.Hover.appendChild(this.Font);
		this.CloseTag = this.ItemClose;
		this.Hover.appendChild(this.CloseTag);
		this.I.appendChild(this.Hover);
	}
	else
	{
	    this.Normal.appendChild(this.Font);
		this.CloseTag = this.ItemClose;
		this.Normal.appendChild(this.CloseTag);
		this.I.appendChild(this.Normal);
	}

	this.I.appendChild(this.Split);
}

// 小标签对象
var AmysqlMinItem = function (id, name, command, action)
{
	this.id = id;
	this.TagId = id;
	this.command = command;
	this.name = name;
	this.span = C('span',{'id':this.id,'title':name,'className':'min'});
	
	(function (o)
	{
		o.span.onclick = function ()
		{
			if(action)
			{
				var ReturnStatus = action();
				if(!ReturnStatus) return;
			}
			if(command) parent.OpenWindow('Activate', o.TagId, o.name, o.command);
		}	
	})(this)
	return this;
}

// 改变标签项对象 
var AmysqlTabItemObjectChange = function (TabItemObject, type)
{
	return new AmysqlTabItem(type,TabItemObject.id,TabItemObject.text,TabItemObject.command,true);
}

 // 标签对象 ***********************************
var AmysqlTab = function ()
{
	this.N = null;										// 标签父元素
	this.ShowBlock = C('span',{'id':'ShowBlock'});		// 显示的块
	this.Split = C('span',{'className':'Split'});
	this.New = C('span',{'id':'New','className':'new'});	
	this.TabList = C('span',{'id':'TabList'});			// 标签列表 标签项按顺序排列在里面 不能随意改变节点结构(如:往前面加其它元素) 
	this.Item = new Array();							// 标签所有项
	this.ItemMin = new Array();							// 小标签项

	this.LastClickItem = {'TagListKey':0};				// 鼠标最后点击的标签
	this.LastMouseItem = {'TagListKey':0};				// 鼠标最后所在的标签
	this.CloseTagItem = {'TagListKey':0};				// 最后关闭的标签

	this.AllTagWidthArr = new Array();					// 标签宽度存放数组
	this.AllTagWidthSum = 0;							// 标签总宽度
	this.TagUndulateValue = 220;						// 标签上下滑动波动值
	this.NumberOneId = null;							// 第一个标签ID
	this.ShowBlockWidth;								// 显示标签区域宽度
	this.ShowBlockWidthDiffer = 200;							
	this.ExtendObject = {};

	this.adds = function (Item)
	{
		for (k in Item)
			this.add(new AmysqlTabItem(Item[k].type,Item[k].id,Item[k].name, Item[k].url));
	}

	// 增加标签项
	this.add = function (TagItem)
	{
		var key = this.Item.length;
		var NoIsset = true;				// 是否存在
		
		// 标签项类型处理
		if (this.N != null && key > 0)
		{
			// 当前标签项type为Activate 改变其它Activate标签项为Normal
			if (TagItem.type == 'Activate')
			{
				var Item_sum = this.Item.length;
				for (var i = 0; i < Item_sum; i++)
				{
					if(typeof(this.Item[i]) == 'object')
					{
						if(this.Item[i].id == TagItem.id) 
						{
							// 存在不做增加
							var NoIsset = false;
							TagItem.TagListKey = this.Item[i].TagListKey;	// 加回标签在列表的位置
							break;
						}
					}
				}
				this.ChangeType(TagItem,'Activate');					// 改变当前标签类型
			}
		}

		if (NoIsset)
		{
			// 触发事件 ********************************************************
			with(this) 
			{
				// 点击
				TagItem.I.onclick = function ()
				{
					TagOnclick(TagItem);
				}
				// 切换状态与记录鼠标最后标签
				TagItem.I.onmouseover = function ()
				{
					TagMouseover(TagItem);
				}
				// 中键关闭
				TagItem.I.onmousedown = function (event)
				{
					event = event? event:window.event;
					if((event.button == 4 && if_ie()) || (event.button == 1 && !if_ie()))
					{
						CloseTagFun(get(TagItem.id), true);	// 标签key可能已变重新获取
						OOXX(event);
					}
				}
				// 标签关闭
				TagItem.CloseTag.onclick = function (event)
				{
					CloseTagFun(TagItem, true);
					OOXX(event);
				}
				
			}
			this.Item[key] = TagItem;				// 增加至标签数组
			this.Item[key].TagListKey = key;		// 标签在列表的key
		}

		if(TagItem.type == 'Activate')
		{
			this.LastClickItem = TagItem;			// 记录最后点击标签I	
			this.SetTitle(TagItem);					// 标题设置
		}

		// 先改变显示的区域 再做增加 避免页面闪动
		this.GoLocation(NoIsset, TagItem.TagListKey);
		if(NoIsset) this.TabList.appendChild(TagItem.I);	// 增加至标签DOM列表
		this.SetTagWidth();		// 更新标签宽度属性

		// ********************** AmysqlContent *******************************
		
		// 创建AmysqlContentItem	  不管存不存在标签都做激活操作 AmysqlContent 那边会判断
		var status = (TagItem.type == 'Activate') ? 'open':'close';
		var AmysqlContentItem = parent.window.frames.AmysqlContent.CreateAmysqlContentItemObject(TagItem.id, TagItem.text, TagItem.command, status);
		parent.window.frames.AmysqlContent.AmysqlContentObject.AddAction(AmysqlContentItem);

		this.RunExtend('add');
	}

	// 取得标签
	this.get = function (id)
	{
		for (var k in this.Item)
		{
			if(this.Item[k].id == id)
				return this.Item[k];
		}
		this.RunExtend('get');
	}

	// 增加小标签
	this.AddMins = function (Item)
	{
		if(!parent._AmysqlContent) return;
		var order = [];
		for (var k in Item)
			order.push([Item[k].order, Item[k]]);
		order.sort();
		Item = order;
		for (var k in Item)
		{
			this.ItemMin.push(new AmysqlMinItem(Item[k][1].id, Item[k][1].name, Item[k][1].url, Item[k][1].action));
			if (Item[k][1].PlugIn)
				parent._AmysqlContent.AmysqlContentObject.PlugInCommand.push(Item[k][1].url);
				
		}
		this.RunExtend('AddMins');
	}
	// 取得小标签
	this.GetMin = function (id)
	{
		for (var k in this.ItemMin)
		{
			if(this.ItemMin[k].id == id)
				return this.ItemMin[k];
		}
		this.RunExtend('GetMin');
	}

	// 设置标题
	this.SetTitle = function (item)
	{
		var title = item.text;
		parent.window.document.title = title;
		this.RunExtend('SetTitle');
	}

	// 标签所在标签块位置处理
	this.GoLocation = function (status, TagListKey)
	{
		// ShowBlockWidth 标签显示块总宽度 
		if(typeof(this.ShowBlockWidth) == 'number')
		{
			ShowBlockWidth = parseInt(this.ShowBlockWidth);
			
			// 有新标签加进来 ***********************
			if (status)
			{

				// 总标签宽度需大于 显示区域的宽度才操作
				if(this.AllTagWidthSum > ShowBlockWidth - this.ShowBlockWidthDiffer)
				{
					// 改变TabList PADDING-LEFT 即显示的区域
					var NewTabListPaddingLeft = parseInt(this.AllTagWidthSum) - ShowBlockWidth / 1.5;
					this.TabList.style.cssText = 'margin-left:-' + NewTabListPaddingLeft + 'px';
				}
			}
			else
			{
			    // 不是新标签 ***********************
				var NowTabListLocation = this.AllTagWidthArr[TagListKey];
				
				// X总标签宽度需大于 显示区域的宽度才操作
				if (this.AllTagWidthSum > ShowBlockWidth || true)
				{
					// 跳到标签的所在位置 并加 显示区域块的一半
					var SkipTabListLocation = NowTabListLocation - ShowBlockWidth / 1.5;
					this.TabList.style.cssText = 'margin-left:-' + SkipTabListLocation + 'px';
				}
			}
		}
		this.RunExtend('GoLocation');
	}

	// 标签宽度属性等设置
	this.SetTagWidth = function ()
	{
		var TabListWidth = 0;
		var TabListSum = this.TabList.childNodes.length;
		for (var l = 0 ; l < TabListSum; l++)
		{
			this.AllTagWidthArr[l] = TabListWidth;	// 更新标签宽度数组
			TabListWidth = TabListWidth + this.TabList.childNodes[l].clientWidth;
		}
		this.AllTagWidthSum = TabListWidth;		// 更新总宽度
		this.RunExtend('SetTagWidth');
	}

	// 设置标签在列表Key值
	this.SetTagKey = function ()
	{
		var ItemSum = this.Item.length;
		for (var i = 0; i < ItemSum; i++)
		{
			if(this.LastClickItem.TagListKey == this.Item[i].TagListKey) this.LastClickItem.TagListKey = i;	// 设置最后点击标签key
			this.Item[i].TagListKey = i;		// 设置标签在列表的key
		}
		this.RunExtend('SetTagKey');
	}

	// 标签点击
	this.TagOnclick = function (TagItem)
	{
		// ***************************************** Amysql激活 ********************************************************
		this.SetTitle(TagItem);
		this.LastClickItem = TagItem;					// 记录最后点击标签
		this.ChangeType(TagItem, 'Activate');			// 激活改变当前标签类型

		parent.window.frames.AmysqlContent.AmysqlContentObject.activationAction(TagItem.id);	// 激活当前ContentItem
		
		this.RunExtend('TagOnclick');
	}

	// 标签关闭
	this.CloseTagFun = function (TagItem, RunClick)
	{
		if(typeof(this.TabList.childNodes[TagItem.TagListKey]) == 'undefined' ) return false;
		if(TagItem.TagListKey == 0) return false;					// 第一个不能关掉

		this.Item.splice(TagItem.TagListKey, 1);
		this.SetTagKey();											// 设置标签Key
		this.TabList.removeChild(this.TabList.childNodes[TagItem.TagListKey]);
		parent.window.frames.AmysqlContent.AmysqlContentObject.DelAction(TagItem.TagListKey, TagItem.id);	// 删除当前ContentItem


		// ------------------------------ 删除标签只做清空不做删除避免位置错乱 --------
		// delete this.Item[TagItem.TagListKey];
		// this.TabList.childNodes[TagItem.TagListKey].innerHTML = '';	// 节点位置不变 清空标签里面内容
		// this.TabList.childNodes[TagItem.TagListKey].id = null;		// 清空标签ID避免再次再打冲突
		// this.TabList.childNodes[TagItem.TagListKey].title = null;
		// -------------------------------------------------------------------------

		this.CloseTagItem = TagItem;					// 记录最后关闭的标签
		if(RunClick)
			TagItem = this.GetShowItem(TagItem);		// 当前的关闭了应取那个显示
 		this.TagOnclick(TagItem);						// 是否、关闭后同时执行点击事件更新
		this.SetTagWidth();								// 更新各标签宽度等值 

		this.RunExtend('CloseTagFun');
		return false;
	}

	// 标签焦点
	this.TagMouseover = function (TagItem)
	{
		// 不是鼠标最后所在位置才执行
		if (this.LastMouseItem.id != TagItem.id)
		{
			this.ChangeType(TagItem, 'Hover');
			this.LastMouseItem = TagItem;
		}
		this.RunExtend('TagMouseover');
	}

	// 禁止冒泡 WoRi!!
	this.OOXX = function (oevent)
	{
		if(document.all) 
			window.event.cancelBubble=true;
		else 
			oevent.stopPropagation();
	}
	// 当前的关闭了应取那个显示
	this.GetShowItem = function (TagItem)
	{
		// 如果关闭的不是最后点击的标签 取最后点击的标签
		if(this.CloseTagItem.id != this.LastClickItem.id) 
		{
			TagItem  = this.Item[this.LastClickItem.TagListKey];
			if(typeof(this.Item[this.LastClickItem.TagListKey]) != 'object') TagItem  = this.Item[0];	// 最后点击的标签可能已不存在
		}
		else
		{
			// 关闭的是最后的标签 取上一个标签
			var temp_key = new Array();
			for(index in this.Item)
			{
				if(index < TagItem.TagListKey) temp_key.push(index);				// 小于当前标签的key
			}
			var Previous_key = temp_key[temp_key.length-1];							// 最后一个即是上一个标签Key
			if(typeof(Previous_key) == 'undefined') Previous_key = temp_key[0];		// 都没了取第一个
			TagItem = this.Item[Previous_key];	
		}

		this.RunExtend('GetShowItem');
		return TagItem;
	}

	// 改变标签项类型
	this.ChangeType = function (TagItem, type)
	{
		var Item_sum = this.Item.length;
		for (var i = 0; i < Item_sum; i++)
		{
			if(typeof(this.Item[i]) == 'object')
			{
				// 当前标签 TagItem为NULL即改变所有
				if(TagItem != null && this.Item[i].id == TagItem.id)
				{
					// 改变的是Hover类型 与 当前改变的标签项是Activate类型就不做操作
					if (type != 'Hover' || this.Item[i].type != 'Activate')
					{
						var TempItemObject = AmysqlTabItemObjectChange(TagItem, type);		// 转成type类型
						TempItemObject.TagListKey = this.Item[i].TagListKey;				// 加回标签在列表的位置
						var CloseTagLocation = (TempItemObject.type == 'Hover') ? 0:1;		// 不同类型X的节点位置不同
						var TempItemDOM = G(this.Item[i].id);
						TempItemDOM.innerHTML = TempItemObject.I.innerHTML;
						
						this.Item[i] = TagItem = TempItemObject;										// 保存转换后的类型
						with(this)
						{
							TempItemDOM.onclick = function ()
							{
								TagOnclick(TagItem);
							}
							// 给新类型加回X事件
							TempItemDOM.childNodes[CloseTagLocation].getElementsByTagName('i')[0].onclick = function (oevent)
							{
								CloseTagFun(TagItem, true);
								OOXX(oevent);
							}
						}

					}
				}
				else
				{
					if (type != 'Hover' || this.Item[i].type != 'Activate')
					{

						// 其它标签 是Activate类型 或 Hover类型才改变
						if(this.Item[i].type == 'Activate' || this.Item[i].type == 'Hover')
						{
							var TempItemObject = AmysqlTabItemObjectChange(this.Item[i], 'Normal');		// 转成Normal类型
							TempItemObject.TagListKey = this.Item[i].TagListKey;						// 加回标签在列表的位置
							var TempItemDOM = G(this.Item[i].id);
							TempItemDOM.innerHTML = TempItemObject.I.innerHTML;
							
							this.Item[i] = TempItemObject;												// 保存新类型至数组
							with(this)
							{
								TempItemDOM.onclick = function ()
								{
									TagOnclick(TempItemObject);
								}
								// 给新类型加回X事件
								TempItemDOM.childNodes[0].getElementsByTagName('i')[0].onclick = function (oevent)
								{
									CloseTagFun(Item[i], true);
									OOXX(oevent);
								}
							}
						}
					}
				}
			}
		}
		this.RunExtend('ChangeType');
	}

	// 显示标签项
	this.ShowTag = function ()
	{
		var Item_sum = this.Item.length;
		if(this.N == null || Item_sum == 0) return;

		for (var i = 0; i < Item_sum; i++)
			this.TabList.appendChild(this.Item[i].I);

		this.RunExtend('ShowTag');
	}

	// 显示小标签项
	this.ShowTagMin = function ()
	{
		var Item_sum = this.ItemMin.length;
		if(this.N == null || Item_sum == 0) return;

		for (var i = 0; i < Item_sum; i++)
			this.N.appendChild(this.ItemMin[i].span);

		this.RunExtend('ShowTagMin');
	}

	// 向应中键滑动
	this.AmysqlMouseAction = function (e)
	{
		var Action = (e != null ) ? e.detail : null;
		with(this)
		{
			var Firefox = navigator.userAgent;
			if(Firefox.indexOf("Firefox") == -1) // IE
 				var Action = event.wheelDelta;
 			else // FireFox
 				Action = -Action;
 			if(Action > 0) 
 				AmysqlTabObject.PreAction();	
 			if(Action < 0) 
 				AmysqlTabObject.NextAction();
 		}
	}

	// 标签上滑动方法
	this.PreAction = function ()
	{
		with(this)
		{
			var NewTabListMarginLeft = 0;
			// 取标签列表Margin-left值 
			var TabListMarginLeft = parseInt(getStyle(TabList,'margin-left').replace('px',''));
			if (AllTagWidthSum > ShowBlockWidth && (TabListMarginLeft + TagUndulateValue) < 0)
			{
				NewTabListMarginLeft = TabListMarginLeft + TagUndulateValue;
			}
			TabList.style.cssText = 'margin-left:' + NewTabListMarginLeft + 'px';
		}
		this.RunExtend('PreAction');
	}

	// 标签下滑动方法
	this.NextAction = function ()
	{
		with(this)
		{
			var NewTabListMarginLeft = 0;
			// 取标签列表Margin-left值 
			var TabListMarginLeft = parseInt(getStyle(TabList,'margin-left').replace('px',''));
			
			// 总标签宽度需大于 显示块区域宽度
			if (AllTagWidthSum > ShowBlockWidth - ShowBlockWidthDiffer)
			{
				//标签列表Margin-left值 超过总标签宽度 不执行操作
				if ((TabListMarginLeft - TagUndulateValue*3) * -1 < AllTagWidthSum)
				{
					NewTabListMarginLeft = TabListMarginLeft - TagUndulateValue;
					TabList.style.cssText = 'margin-left:' + NewTabListMarginLeft + 'px';
				}
			}
		}
		this.RunExtend('NextAction');
	}

	// 初始化
	this.run = function ()
	{
		this.N = G('navigation');
		with(this)
		{
			New.title = L.Menu;
			New.onclick = function ()
			{
				if(typeof(parent.window.frames.AmysqlLeft.AmysqlLNO) == 'object')
				{	
					parent.window.frames.AmysqlLeft.AmysqlLNO.show();
					New.id = (New.id != 'NewUp') ? 'NewUp' : 'New';
				}

				var AmysqlLeftAndContent = parent.G('AmysqlLeftAndContent');
				if (AmysqlLeftAndContent.getAttribute('cols') == '0,*')
					AmysqlLeftAndContent.setAttribute('cols', '236,*');
			}
			New.onmouseover = function ()
			{
				if(this.id == 'New')
					this.id = 'NewHover';
			}
			New.onmouseout = function ()
			{
				if(this.id == 'NewHover')
					this.id = 'New';
			}
			N.appendChild(New);
			N.appendChild(Split);

			// 标签列表
			ShowBlock.appendChild(TabList);
			N.appendChild(ShowBlock);		

			// 增加滑动滑动事件监听
			if(typeof(ShowBlock.addEventListener) == 'undefined')
			{
				ShowBlock.onmousewheel = function () // ie
				{
					AmysqlMouseAction(null);
				}
			}
			else // 非ie
			{
				ShowBlock.addEventListener('DOMMouseScroll',AmysqlMouseAction,true); 
				ShowBlock.onmousewheel = function ()
				{
					AmysqlMouseAction(null);
				}
			}
			
			ShowTagMin();				// 载入小标签
			N.appendChild(Split);		// 分隔符
			ShowTag();					// 载入标签
		}
		SetShowBlockWidth();
		this.RunExtend('run');
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


// 标签块宽度适应
var SetShowBlockWidth = function ()
{
	var ItemMinWidth = 0;
	for (var k in AmysqlTabObject.ItemMin )
		ItemMinWidth += AmysqlTabObject.ItemMin[k].span.clientWidth;

	AmysqlTabObject.ShowBlockWidth = document.body.clientWidth - G("Blank").clientWidth - ItemMinWidth - AmysqlTabObject.New.clientWidth - 27;
	G('ShowBlock').style.cssText = 'width:' + AmysqlTabObject.ShowBlockWidth  + 'px';
}
window.onresize = function()
{
	// copyright show
	parent.frames.AmysqlLeft.G('copyright').style.display = parent.frames.AmysqlLeft.getClientHeight()-70-parent.frames.AmysqlLeft.AmysqlLNO.LeftNavigationDom.clientHeight > parent.frames.AmysqlLeft.G('AmysqlLeftList').scrollHeight ? 'block':'none';
	SetShowBlockWidth();
}


// ********************** 提供接口 ****************************

// 创建标签项对象
var CreateItemObject = function (type,id,text,command)
{
	return new AmysqlTabItem(type,id,text,command);
}

