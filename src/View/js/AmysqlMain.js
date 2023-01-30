/************************************************
 *
 * Amysql Framework
 * Amysql.com 
 * @param AmysqlMain 系统主进程
 * 
 * ------------------------------- 
 * AmysqlMain控制整个系统的运行流程
 * 系统加载完成后执行AmysqlRun开启进程，总体运行步骤如下：
 * 
 * 1) AmysqlExtendControllerConfigRun:	首要执行，为总控制器，可控制系统所有的运行模块。
 * 2) AmysqlPluginRun:					加载用户自定义插件数据。
 * 3) AmysqlContentRun:					系统内容模块运行。
 * 4) AmysqlTagRun:						系统标签模块运行。
 * 5) AmysqlLeftRun:					系统左栏模块运行。
 * 6) AmysqlExtendInitialConfigRun:		扩展运行，执行到这一步所有模块都运行完成了。用于扩展各模块初始化事件。
 *
 */

var AmysqlMain = function ()
{
	this.AmysqlExtend = [];				// 所有扩展数据
	this.AmysqlLoadComplete = false;

	// 总运行进程
	this.AmysqlRun = function ()
	{
		if(!_AmysqlContent || !_AmysqlTag || !_AmysqlLeft) return;

		this.AmysqlExtendControllerConfigRun();
		this.AmysqlPluginRun();
		this.AmysqlContentRun();
		this.AmysqlTagRun();
		this.AmysqlLeftRun();
		this.AmysqlExtendInitialConfigRun();
		this.AmysqlLoadComplete = true;
	}

	// 系统总控制器配置运行
	this.AmysqlExtendControllerConfigRun = function ()
	{
		for (var k in this.AmysqlExtend )
		{
			if(this.AmysqlExtend[k]._AmysqlExtendControllerConfig)
				this.AmysqlExtend[k]._AmysqlExtendControllerConfig();
		}
	}

	// 插件分析加载
	this.AmysqlPluginRun = function ()
	{
		for (var k in this.AmysqlExtend )
		{
			// 小标签插件加载
			if(this.AmysqlExtend[k]._AmysqlTabMinJson)
			{
				for (var m in this.AmysqlExtend[k]._AmysqlTabMinJson)
					_AmysqlTabMinJson.push(this.AmysqlExtend[k]._AmysqlTabMinJson[m]);
			}
			// 左栏菜单插件加载
			if(this.AmysqlExtend[k]._AmysqlLNIJson)
			{
				for (var m in this.AmysqlExtend[k]._AmysqlLNIJson)
					_AmysqlLNIJson.push(this.AmysqlExtend[k]._AmysqlLNIJson[m]);
			}
		}
	}

	// 内容运行
	this.AmysqlContentRun = function ()
	{
		_AmysqlContent.AmysqlContentObject.run();
	}

	// 标签运行
	this.AmysqlTagRun = function ()
	{
		_AmysqlTag.AmysqlTabObject.adds(_AmysqlTabJson);
		_AmysqlTag.AmysqlTabObject.AddMins(_AmysqlTabMinJson);
		_AmysqlTag.AmysqlTabObject.run();
	}

	// 左栏运行
	this.AmysqlLeftRun = function ()
	{
		_AmysqlLeft.AmysqlLNO.add(_AmysqlLNIJson);
		_AmysqlLeft.AmysqlLNO.run();

		_AmysqlLeft.AmysqlLeftList.add(_AmysqlLeftListJson);
		_AmysqlLeft.AmysqlLeftList.run();
	}

	// 扩展配置运行
	this.AmysqlExtendInitialConfigRun = function ()
	{
		// 清空配置重新加载
		_AmysqlContent.AmysqlContentObjectExtendObject = [];
		_AmysqlTag.AmysqlTabObject.ExtendObject = [];
		_AmysqlLeft.AmysqlLeftList.ExtendObject = [];

		for (var k in this.AmysqlExtend )
		{
			if(this.AmysqlExtend[k]._AmysqlExtendInitialConfig)
				this.AmysqlExtend[k]._AmysqlExtendInitialConfig();
		}
	}
}

var AmysqlMainObject = new AmysqlMain();
