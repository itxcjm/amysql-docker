<?php

class privileges extends AmysqlController
{
	public $indexs = null;
	public $MysqlFetchType = MYSQLI_ASSOC;		// 查询数据FetchType
	public $QueryFrom = 'Home';
	public $SystemConfig;						// 系统设置参数

	// 加载数据模型与函数类
	function AmysqlModelBase()
	{
		if($this -> indexs) return;
		$this -> _class('Functions');
		Functions::AutoLogin();				// 自动登录
		Functions::SetSystem();
		$this -> indexs = $this ->  _model('indexs');
	}
	

	function IndexAction()
	{
		$this -> AmysqlModelBase();

		$operation_sql_exist = (isset($_POST['operation_sql_text']) && !empty($_POST['operation_sql_text']) && $_POST['ActionOperation'] ) ? true : false;
		// 操作SQL加至手动操作类型SQL
		if ($operation_sql_exist)						
		{
			$operation_sql_text_arr = Functions::SplitSql($_POST['operation_sql_text']);
			foreach ($operation_sql_text_arr as $key=>$val)
				$HandOperationSqlText[] = $val;
		}
		$OperationQuery = $this -> indexs -> OperationQuery($HandOperationSqlText);	// 执行SQL
		$this -> operation_sql_text = is_array($HandOperationSqlText) ? implode(";\n", $HandOperationSqlText) : '';		// 操作SQL文本
		$this -> OperationQuery = $OperationQuery;									// 操作SQL执行结果


		if($this -> indexs -> MysqlConnect -> server_version >= 50700)
		{
			$sql = 'SELECT `User`, `Host`, `authentication_string` AS `Password`, `plugin`, `max_questions`, `max_updates`, `max_connections`, `max_user_connections` FROM mysql.user';
		}
		else
			$sql = 'SELECT `User`, `Host`, `Password`, `plugin`, `max_questions`, `max_updates`, `max_connections`, `max_user_connections` FROM mysql.user';

		$UserData = $this -> indexs -> GetSqlData($sql, null, null, $this -> QueryFrom, array(0, 0), $this -> MysqlFetchType);
		
		$NewName = array('User', 'Host', 'Pass', 'PassPlugin', 'Database', 'Table', 'Grant', 'Privileges', 'max_questions', 'max_updates', 'max_connections', 'max_user_connections');
		$name_list = array();
		foreach ($NewName as $key=>$val)
		{
			$$val = new stdClass();
			$$val -> name = $val;
			$name_list[] = $$val;
		}
		$UserData[3] = $name_list;
		
		$grants_all = array();
		foreach ($UserData[0] as $key=>$val)
		{
			$grant_sql = "SHOW GRANTS FOR '" . $val['User'] . "'@'" . $val['Host'] . "'";
			$grants = $this -> indexs -> _all($grant_sql);
			foreach ($grants as $k=>$v)
			{
				$grants_val['grants_sql'] = $v['Grants for '. $val['User'] . '@' . $val['Host']];
				$grants_val['User'] = $val['User'];
				$grants_val['Host'] = $val['Host'];
				$grants_val['Password'] = $val['Password'];
				$grants_val['PassPlugin'] = empty($val['plugin']) ? 'mysql_native_password' : $val['plugin'];

				preg_match('/^GRANT\s+(.*)\s+ON/i', $grants_val['grants_sql'], $grants_list);
				preg_match('/^GRANT\s+.*\s+ON\s+(.*)\s+TO/i', $grants_val['grants_sql'], $grants_dt);
				$grants_dt = explode('.', trim($grants_dt[1]));
				$grants_val['grants_database'] = trim($grants_dt[0], '`');
				$grants_val['grants_table'] = trim($grants_dt[1], '`');
				$grants_val['grants_list'] = explode(', ', $grants_list[1]);

				$grants_val['grant'] = preg_match('/\s+WITH\s+GRANT\s+/', $grants_val['grants_sql']) ? 'Yes': 'No';	// 是否能授权

				$grants_val['max_questions'] = $val['max_questions'];
				$grants_val['max_updates'] = $val['max_updates'];
				$grants_val['max_connections'] = $val['max_connections'];
				$grants_val['max_user_connections'] = $val['max_user_connections'];
				$grants_all[] = $grants_val;
			}
			unset($grants);
		}
		$UserData[0] = $grants_all;
		$this -> NewSql = $this -> sql = $sql;
		$this -> SqlStatus = is_array($UserData[0]) ? 1 : 0;
		$this -> UserData = $UserData;
		$this -> mysql_version_int = $this -> indexs -> MysqlConnect -> server_version;
		$this -> _view('AmysqlHomePrivileges');
	}


}

