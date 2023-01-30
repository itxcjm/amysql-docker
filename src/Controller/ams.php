<?php

class ams extends AmysqlController
{
	public $indexs = null;

	public $DatabaseName;					// 数据库名
	public $TableName;						// 表名
	public $CanUpdaeStructure = false;		// 是否能更新结构
	public $PageExist = false;				// 分页是否存在
	public $MysqlFetchType = false;		// 查询数据FetchType
	public $QueryBaseSql;					// 基本查询SQL
	public $sql;							// 当前查询的SQL
	public $SqlData;						// 查询SQL的数据
	public $PageShow = 100;					// 页默认显示记录数
	public $SystemConfig;					// 系统设置参数
	public $QueryFrom;						// 查询来源




	// 加载数据模型与函数类
	function AmysqlModelBase()
	{
		if($this -> indexs) return;
		$this -> _class('Functions');
		Functions::AutoLogin();				// 自动登录
		Functions::SetSystem();
		$this -> indexs = $this ->  _model('indexs');
	}
	


	// 打开新窗口 
	function AmysqlTableNewOpen($sql = NULL)
	{
		$this -> AmysqlModelBase();

		// 库与表名判断是否打开新窗口 当等``即为不存在
		$sql = !empty($sql) ? $sql : $this -> sql;
		$SqlFromName = Functions::GetQuerySqlFromName($sql[0]);
		if( ( ($SqlFromName['TableName'] != ('`' . $this -> TableName . '`')) || 
			  ($SqlFromName['DatabaseName'] != '``' && $SqlFromName['DatabaseName'] != ('`'.$this -> DatabaseName.'`'))
			) && !isset($_GET['sql']) && ($SqlFromName['TableName'] != '``' || $SqlFromName['DatabaseName'] != '``')
		)
		{
			// 非当前库表打开新窗口
			$this -> sql = implode(";\n", $sql);
			$this -> UpSqlOriginal = false;		// 其它表或库就不更新原始SQL

			if($SqlFromName['DatabaseName'] == '``') $SqlFromName['DatabaseName'] = '`' . $this -> DatabaseName . '`';
			foreach ($SqlFromName as $key=>$val)
				$SqlFromName[$key] =  substr($SqlFromName[$key], 1,-1);
			$this -> SqlFromName = $SqlFromName;
			$this -> _view('AmysqlTableNewOpen');
			Return true;
		}
		Return false;
	}


	// Sql提交查询  ******************************************************* >>
	function AmysqlSqlSubmit()
	{
		$this -> AmysqlModelBase();

		// SQL请求判断 ********************************************************************************************************
		// GET传值统一编码后传递
		$this -> PageExist = (isset($_POST['page']) && !empty($_POST['page'])) ? true : false;			// 分页
		$post_exist = (isset($_POST['sql']) && !empty($_POST['sql'])) ? true : false;					// 查询的SQL
		$GET_exist = (isset($_GET['sql']) && !empty($_GET['sql'])) ? true : false;						// GET的SQL

		// 是否执行操作的SQL
		$operation_sql_exist = (isset($_POST['operation_sql_text']) && !empty($_POST['operation_sql_text']) && $_POST['ActionOperation'] ) ? true : false;	
		$this -> page = $page = (isset($_POST['page']) && !empty($_POST['page'])) ? $_POST['page'] : 1;	// 页码
		$this -> StartRead = $StartRead = ($page-1)*$this -> PageShow ;									// 起读点

		// 确定查询的SQL 优先 GET、POST、默认表
		if($this -> DatabaseName !== null)
			$this -> indexs -> UseDatabases($this -> DatabaseName);											// 使用当前数据库
		$this -> sql = $NewSql = ($GET_exist) ? $_GET['sql'] : (($post_exist) ? $_POST['sql'] : $this -> QueryBaseSql);

		$SqlArr = Functions::SplitSql($this -> sql);	// 分析拆分多行SQL
		$this -> sql = $NewSql  = end($SqlArr);			// 取得未行SQL为首要查询SQL
		$DatabaseTableName = json_encode(Functions::GetQuerySqlFromName($this -> sql));

		// 存在多行SQL情况 *************************
		$HandOperationSqlText = array();				// 手动操作类型的SQL(所有操作类型SQL的集合)
		$_OpenDatabaseTableList = array();				// 已经在新窗口打开的库表名
		if (count($SqlArr) > 1 && !isset($_GET['sql']))
		{
			// 以库表名划分SQL ****************
			$_SqlArr = array();
			foreach ($SqlArr as $key=>$val)
				$_SqlArr[json_encode(Functions::GetQuerySqlFromName($val))][] = $val;
			$SqlArr = $_SqlArr;
			unset($_SqlArr);

			// 准备打开 ***********************
			$_TempSql = $this -> sql;						// 临时记录首要SQL
			foreach ($SqlArr as $key=>$val) 
			{
				$this -> sql = $val;
				if (!$this -> AmysqlTableNewOpen())			// 不能新窗口打开即为当前库表操作SQL
				{
					foreach ($val as $hk=>$hv)				// 增加当前库表操作SQL为手动操作类型SQL
						$HandOperationSqlText[] =  $hv;
				}
				else
					$_OpenDatabaseTableList[] = $key;		// 记录新窗口打开的库表名
			}
			$this -> sql = $_TempSql;						// 恢复首要SQL
		}
		elseif (count($SqlArr) > 1 && isset($_GET['sql']))	// 执行新窗口打开存在的多条SQL(此时SQL已划分好，执行即可)
		{
		    foreach ($SqlArr as $key=>$val) 
				$HandOperationSqlText[] =  $val;
		}
		else	
		{
			// 只有一行SQL的情况
		    if($this -> AmysqlTableNewOpen(array($this -> sql))) exit();
		}

		$IsQueryDataSql = Functions::is_QueryData($this -> sql);			// 是否为查询数据类型的SQL
		$this -> UpSqlOriginal = $IsQueryDataSql;							// 是否更新原始SQL。SQL是查询数据类型即更新。
		$this -> UpSqlPost = false;											// 是否更新POST SQL

		// 如果首要SQL查询库表已在新窗口打开 ＝> 结束当前程序 => 否则删除手动操作类型SQL的未行记录(因为这行与首要SQL同等) ******
		((in_array($DatabaseTableName, $_OpenDatabaseTableList)) ? exit() : array_pop($HandOperationSqlText));

	

		// 首要SQL不是查询数据类型的SQL当做操作SQL处理　*********************************
		if (!$IsQueryDataSql)
		{
			$this -> UpSqlOriginal = false;					// 更新原始SQL
			$HandOperationSqlText[] = $this -> sql;			// 增加手动操作类型SQL
			$this -> UpSqlPost = true;
			$this -> sql = $NewSql = $this -> QueryBaseSql;	// 更新首要查询SQL为基本SQL
		}
		 


		// 执行操作类型的SQL ***************************************************************************************************
		$OperationQuery = '';					// 操作的SQL结果		// $OperationQuery[0]: 错误信息，$OperationQuery[1]: 影响数, $OperationQuery[2]: 每行SQL执行的状态
		$UpAmysqlLeftData = array();			// 更新左栏准备数据	// Array('del' => Array(), 'add' => Array()) 数据结构
		$this -> CanUpdaeStructure = false;		// 是否可更新结构数据

		if($operation_sql_exist || count($HandOperationSqlText) > 0)
		{
			// 操作SQL加至手动操作类型SQL
			if ($operation_sql_exist)						
			{
				$operation_sql_text_arr = Functions::SplitSql($_POST['operation_sql_text']);
				foreach ($operation_sql_text_arr as $key=>$val)
					$HandOperationSqlText[] = $val;
			}
			
			// 动操作类型SQL相关响应判断
			foreach ($HandOperationSqlText as $key=>$val)
			{
				if(Functions::is_structure($val)) $this -> CanUpdaeStructure = true;	// 判断是否更新结构数据

				// (UL-TAG) 删除库表、创建库表，即获取更新left的库表名
				$LoadLeftData = Functions::LoadLeft($val);
				if($LoadLeftData) $UpAmysqlLeftData[$LoadLeftData[0]['type']][$key] = $LoadLeftData;
			}

			$OperationQuery = $this -> indexs -> OperationQuery($HandOperationSqlText);	// 执行SQL

			// (UL-TAG) 进一步判断删除库表、创建库表是否成功，不成功则删除。
			foreach ($UpAmysqlLeftData as $key=>$val)
			{
				foreach ($val as $k=>$v)
				{
					// SQL执行不成功行删除$UpAmysqlLeftData对应的数据行
					if(!isset($OperationQuery[2][$k]) || $OperationQuery[2][$k] != 'success')
						unset($UpAmysqlLeftData[$key][$k]);
					else 
						$RunUpAmysqlLeftTag = true;			// 进行更新左栏标记 
				}
			}
		}

		$this -> operation_sql_text = implode(";\n", $HandOperationSqlText);	// 操作SQL文本
		$this -> OperationQuery = $OperationQuery;								// 操作SQL执行结果

		// (UL-TAG)
		if (isset($RunUpAmysqlLeftTag))
		{
			$this -> UpAmysqlLeftData = $UpAmysqlLeftData;						// 更新左栏数据
			$this -> _view('AmysqlUpAmysqlLeft');								// 更新左栏列表Dom
		}


		

		// 获取数据 ********************************************************************************************************
		if($this -> PageShow != -1 && !Functions::ExistLimit($this -> sql) && Functions::is_select_QueryData($this -> sql))
			$NewSql .= ' LIMIT ' . $StartRead . ',' . $this -> PageShow;					// 进来的Sql没有Limit 加Limit限制
		$this -> NewSql = $NewSql;

		// 系统SQL
		$AmysqlSql = Functions::AmysqlSql($this -> sql);
		$this -> AmysqlSql = $AmysqlSql ? true : false;
		$this -> SqlData = ($AmysqlSql) ? Functions::AmysqlSqlData($this -> _file($AmysqlSql), $this -> MysqlFetchType) : 
			$this -> indexs -> GetSqlData($this -> sql, $NewSql, $this -> QueryBaseSql, $this -> QueryFrom, array($StartRead, $this -> PageShow), $this -> MysqlFetchType);
		// SqlData[0] 数据 OR 报错,  SqlData[1] 执行时间, SqlData[2] 所有数据总数, SqlData[3] sql的字段, SqlData[4] 其它(约等)

		// 查询数据结果 ****************************************
		$this -> SqlStatus = 0;										// 查询是否成功
		$this -> QueryResultSum = 0;
		if (is_array($this -> SqlData[0]))
		{
			$this -> QueryResultSum = count($this -> SqlData[0]);	// 当前显示数据总数
			$this -> SqlStatus = 1;
		}

	}


	// 主页 ******************************************************* >>
	function AmysqlHome()
	{
		$this -> AmysqlModelBase();
		$this -> QueryFrom = 'Home';
		$this -> QueryBaseSql = "SHOW DATABASES";
		$this -> PageShow = -1;						// -1即查询所有数据
		$this -> MysqlFetchType = MYSQLI_ASSOC;		// 获取数据的类型
		$this -> AmysqlSqlSubmit();					// 进行查询
		$this -> PageShow = ($this -> SqlData[2] > 0) ? $this -> SqlData[2] : 100;	// 赋等于总数用于模板显示

		// 数据库数据表列表 ********************************
		$ShowTableStatus = Functions::ShowDatabases($this -> sql);
		$this -> CanEdit = ($ShowTableStatus) ? 1 : 0;
		if ($this -> sql == $this -> QueryBaseSql)
		{
			$this -> SqlData = $this -> indexs -> GetDatabasesListInfo($this -> SqlData);
		}

		if($this -> PageExist)
			$this -> _view('AmysqlContentSqlQueryData');					
		else
		{
			$this -> mysql_version = $this -> indexs -> GetVersion();
			$this -> _view('AmysqlHome');
		}
			
	}


	// 数据库页 ******************************************************* >>
	function AmysqlDatabase()
	{
		$this -> AmysqlModelBase();
		$this -> QueryFrom = 'Database';
		$this -> DatabaseName = (!isset($_GET['DatabaseName']) || empty($_GET['DatabaseName'])) ? null : urldecode($_GET['DatabaseName']);
		$this -> QueryBaseSql = "SHOW TABLE STATUS FROM `" . Functions::SqlKeyword($this -> DatabaseName) . "`";
		$this -> PageShow = -1;						// -1即查询所有数据
		$this -> MysqlFetchType = MYSQLI_ASSOC;		// 获取数据的类型
		$this -> AmysqlSqlSubmit();					// 进行查询
		$this -> PageShow = ($this -> SqlData[2] > 0) ? $this -> SqlData[2] : 100;	// 赋等于总数用于模板显示

		// 数据库数据表列表 ********************************
		$this -> CanEdit = 0;
		$ShowTableStatus = ($this -> sql == $this -> QueryBaseSql && Functions::ShowTableStatus($this -> sql)) ? true : false;
		if($ShowTableStatus)
		{
			// $this -> CanEdit = ($this -> DatabaseName != 'information_schema') ? 1 : 0;
			$this -> CanEdit = 1;
			$this -> SqlData = Functions::DBDealWith($this -> SqlData);		// 重写字段信息
		}

	
		if($this -> PageExist)
			$this -> _view('AmysqlContentSqlQueryData');					
		else
		{
			$this -> mysql_version = $this -> indexs -> GetVersion();
			$this -> _view('AmysqlDatabase');
		}

		if($ShowTableStatus) 
			$this -> _view('AmysqlDatabaseListTableCheck');					// 左栏数据表检查

	}


	// 数据表页 ******************************************************* >>
	function AmysqlTable()
	{
		$this -> AmysqlModelBase();
		$this -> QueryFrom = 'Table';
		$this -> DatabaseName = (!isset($_GET['DatabaseName']) || empty($_GET['DatabaseName'])) ? null : urldecode($_GET['DatabaseName']);
		$this -> TableName = (!isset($_GET['TableName']) || empty($_GET['TableName'])) ? null : urldecode($_GET['TableName']);
		$this -> QueryBaseSql = 'SELECT * FROM `' . Functions::SqlKeyword($this -> TableName) . '`';		
		$this -> MysqlFetchType = MYSQLI_NUM;		// 获取数据的类型
		$this -> AmysqlSqlSubmit();


		// 获取结构 ****************************************
		if(!$this -> PageExist || $this -> CanUpdaeStructure)	
		{
			$this -> ShowIndex = json_encode($this -> indexs -> ShowIndex($this -> TableName, $this -> DatabaseName));		// 索引列表

			$TableData = $this -> indexs -> GetFieldList($this -> TableName, $this -> DatabaseName);
			((count($TableData) == 0) && ($this -> _view('AmysqlTableNotExists')) && exit());				// 表不存在删除左栏表名
			$AllField = null;
			foreach ($TableData as $key=>$val)
				$AllField[] = $val['COLUMN_NAME'];

			$this -> AllField = implode(',', $AllField);					// 表所有字段
			$this -> FieldList = json_encode($TableData);					// 字段列表
		}

		// 判断是否可以编辑 ********************************
		$this -> CanEdit = (Functions::is_select_QueryData($this -> sql) && $this -> DatabaseName != 'information_schema') ? 1 : 0;
		$this -> CanEditStructure = ($this -> DatabaseName != 'information_schema') ? 1 : 0;

		// 加载相关模板 ************************************
		if($this -> PageExist)
		{
			// 表的数据与表结构更新
			($this -> CanUpdaeStructure && $this -> _view('AmysqlTableStructure'));
			$this -> _view('AmysqlContentSqlQueryData');					
			exit();
		}

		$this -> mysql_version = $this -> indexs -> GetVersion();
		$this -> _view('AmysqlTable');
	}

	// 更新BLOB数据
	function UpBlobData()
	{
		$this -> AmysqlModelBase();

		if(!isset($_FILES['file']['tmp_name'])) exit();
		$FieldName = $_GET['FieldName'];
		$TableName = $_GET['TableName'];
		$DatabaseName = $_GET['DatabaseName'];
		$where = $_GET['where'];

		$data = bin2hex(fread(fopen($_FILES['file']['tmp_name'], 'r'), $_FILES['file']['size']));
		$sql = "UPDATE `$DatabaseName`.`$TableName` SET `$FieldName` = 0x$data WHERE $where";
		if($this -> indexs -> _query($sql))
			echo json_encode(array('status' => 1, 'msg' => '<i>BLOB - ' . Functions::CountSize($_FILES['file']['size']) . '</i>'));
		else
			echo json_encode(array('status' => 0, 'msg' => 'Upload failed.'));
		exit();
	}


}

