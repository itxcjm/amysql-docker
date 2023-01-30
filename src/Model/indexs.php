<?php

class indexs extends AmysqlModel
{

	/**
	 * 查所有数据结构信息
	 *
	 */
	function GetDatabasesList()
	{
		$this -> UseDatabases('information_schema');
		if(!class_exists('DatabaseLeft')) Return;
		$sql = "SHOW DATABASES";
		$result = $this -> _query($sql);
		while ($rs = mysqli_fetch_assoc($result))
		{
			$database = new DatabaseItem();
			$database -> set($rs['Database']);
			$database -> ChildItem = $this -> GetTableNameList($rs['Database']);
			$database -> ChildItemSum = count($database -> ChildItem);
			if($database -> ChildItemSum == 0) $database -> ChildItem = null;
			$data[] = $database; 
		}
		Return $data;
	}


	/**
	 * 查所有表名
	 *
	 * @param	string	 $databases	 数据库名
	 */
	function GetTableNameList($databases)
	{
		$_databases = Functions::SqlKeyword($databases);
		if(!class_exists('DatabaseLeft')) Return;
		$data = array();
		$sql = "SHOW TABLES FROM `$_databases`";
		$result = $this -> _query($sql);
		while ($rs = mysqli_fetch_assoc($result))
		{
			$table = new TableItem();
			$table -> set($rs['Tables_in_' . $databases], $databases);
			$data[] = $table;
		}
		Return $data;
	}

	// ******************************************************

	/**
	 * 查表所有的字段
	 *
	 * @param	string	 $table		 表名
	 * @param	string	 $databases	 数据库名
	 */
	function GetFieldList($table, $databases)
	{
		global $Config;
		$_databases = Functions::SqlKeyword($databases);
		$_table = Functions::SqlKeyword($table);

		mysqli_select_db($this -> MysqlConnect, 'information_schema');
		$this -> _query("SET NAMES '" . str_replace('-', '', $Config['CharSet'])  . "'");

		$sql = "SELECT * FROM COLUMNS WHERE TABLE_SCHEMA LIKE '$databases'  AND TABLE_NAME LIKE '$table' ";
		$result = $this -> _query($sql);
		if(!$result) Return false;
		$data = array();
		while ($rs = mysqli_fetch_assoc($result))
		{
			preg_match("/\((.*)\)/i", $rs['COLUMN_TYPE'], $Length); 
			$rs['Length'] = (isset($Length[1])) ? $Length[1] : '';			// 长度或值
			
			// 判断属性	$temp_if_type 把属性或值去掉先 *************************************
			$temp_if_type = str_replace($rs['Length'], '', $rs['COLUMN_TYPE']);
			$rs['COLUMN_PROPERTY'] = (strpos($temp_if_type, 'binary')) ? 'binary': ((strpos($temp_if_type, 'unsigned zerofill')) ? 'unsigned zerofill' : ((strpos($temp_if_type, 'unsigned')) ? 'unsigned' : ''));	
			
			if($rs['DATA_TYPE'] == 'timestamp')
			{
				if (!isset($create_sql))
				{
					$sql = "SHOW CREATE TABLE `$_databases`.`$_table`";
					$return_data = $this -> _row($sql);
					$create_sql = $return_data['Create Table'];
				}
				preg_match_all("/COMMENT '(.*)'|default '(.*)'/iU", $create_sql, $matches);		// 匹配COMMENT default内容 
				$create_sql = str_replace($matches[0], '', $create_sql);						// 去COMMENT default内容
				preg_match_all("/`(.*)`|on update CURRENT_TIMESTAMP/iU", $create_sql, $matches); // 匹配字段或 on update CURRENT_TIMESTAMP
				$OUCT_KEY = array_search('on update CURRENT_TIMESTAMP', $matches[0]);	// 找on update CURRENT_TIMESTAMP的键名
				if($OUCT_KEY &&  str_replace('"', '\"', $matches[0][$OUCT_KEY-1]) == "`$rs[COLUMN_NAME]`") $rs['COLUMN_PROPERTY'] = 'on update CURRENT_TIMESTAMP';
			}
			// ******** END *******

			$data[] = $rs;
		}

		mysqli_select_db($this -> MysqlConnect, $databases);
		$this -> _query("SET NAMES '" . str_replace('-', '', $Config['CharSet'])  . "'");
		Return $data;
	}

	// 取得结果集字段
	function GetFields($result)
	{
		// mysql_field_name
		// mysql_field_len
		// $fields = array();

		$fields = mysqli_fetch_fields($result);
		Return $fields;

		/*
		$num_fields = mysqli_num_fields($result);
		for ($i = 0; $i < $num_fields; $i++) 
		{
			$fields[$i] = mysqli_fetch_field($result, $i);			// 字段信息
			$fields[$i] -> flags = mysql_field_flags($result, $i);	// 取得字段真实标识
		}
		Return $fields;
		*/
	}


	//　获取查询sql的数据
	function GetSqlData($sql, $NewSql, $QueryBaseSql, $QueryFrom, $limit, $MysqlFetchType = MYSQLI_NUM)
	{
		if(!$NewSql) $NewSql = $sql;
		if(!$QueryBaseSql) $QueryBaseSql = $sql;

		global $Amysql;
		// $limit[0] 起读点、$limit[1] 读取几条
		$starttime = array_sum(explode(" ", microtime())); 
		$rs = $this -> _query($NewSql);
		$endtime = array_sum(explode(" ", microtime())); 

		$this -> InsertSqlLog($sql, $rs, $Amysql -> AmysqlProcess -> AmysqlController -> DatabaseName, $Amysql -> AmysqlProcess -> AmysqlController -> TableName);
		if (!$rs) return array($this -> GetError(), round($endtime - $starttime, 5), 0);

		
		// 数据总数  ********************
		
		// 不精确查询&约等标记
		$md5_sql = (!preg_match('/^SELECT\s+(.*)\s+(COUNT|GROUP|WHERE)\s+(.*)$/i', $sql)) ? md5($QueryBaseSql) : md5($sql);
		$CacheTag = '';
		$ApproximateTag = ($Amysql -> AmysqlProcess -> AmysqlController -> SystemConfig -> TableAccurateQuery != '1' && $QueryFrom == 'Table') ? true : false;
		$SqlFromNameTag = $Amysql -> AmysqlProcess -> AmysqlController -> DatabaseName.$Amysql -> AmysqlProcess -> AmysqlController -> TableName;
		if ($QueryFrom == 'Table' && $Amysql -> AmysqlProcess -> AmysqlController -> SystemConfig -> TableQueryCountCache == '1' &&  isset($_SESSION['last_sql'][$SqlFromNameTag][$md5_sql]))
		{
			$SumResult = $_SESSION['last_sql'][$SqlFromNameTag][$md5_sql]['num'];
			$Engine = $_SESSION['last_sql'][$SqlFromNameTag][$md5_sql]['engine'];
			$CacheTag = '+- ';
		}
		else
		{
			if ($ApproximateTag && $sql == $QueryBaseSql)
			{
				if($this -> MysqlConnect -> server_version >= 80000)
					$this -> _query("ANALYZE TABLE `" . $Amysql -> AmysqlProcess -> AmysqlController -> DatabaseName . "`.`" . $Amysql -> AmysqlProcess -> AmysqlController -> TableName . "`");
				$SumRs = mysqli_fetch_assoc($this -> _query("SHOW TABLE STATUS FROM `" . $Amysql -> AmysqlProcess -> AmysqlController -> DatabaseName . "` LIKE '" . $Amysql -> AmysqlProcess -> AmysqlController -> TableName . "'"));
				$SumResult = $SumRs['Rows'];
				$Engine = $SumRs['Engine'];
			}
			else
			{
				$SumResult = ($NewSql == $sql) ?  mysqli_num_rows($rs) : mysqli_num_rows($this -> _query($sql));
				$Engine = '';
			}
			$_SESSION['last_sql'][$SqlFromNameTag][$md5_sql]['num'] = $SumResult;
			$_SESSION['last_sql'][$SqlFromNameTag][$md5_sql]['engine'] = $Engine;
		}
		if (!$SumResult)  return array(array(), round($endtime - $starttime, 5), 0);				// 没数据返回


		// 数据 ********************

		// 字段名称等信息
		$fields = $this -> GetFields($rs);
		$all_rows = array();
		$i = $a = 0;
		while(true)
		{
			// 进来的Sql没有Limit直接通过同样读取$SumResult条记录
			if($i >= $limit[0] || ($NewSql != $sql))	
			{
				if($i == $limit[0]) mysqli_data_seek($rs, $i);
				if($MysqlFetchType)
					$rows = mysqli_fetch_array($rs, $MysqlFetchType);
				else
					$rows = mysqli_fetch_array($rs);
				if(empty($rows)) break;
				
				// BLOB判断 ******************
				$BI = 0;
				foreach ($rows as $key=>$val)
				{
					if($fields[$BI] -> db != 'mysql' && $fields[$BI] -> flags & 16 && $fields[$BI] -> flags & 128) // (同时为blob与binary)
						$rows[$key] = 'BLOB - ' . Functions::CountSize(strlen($val));
					++$BI;
				}
				// End ********************************************

				$all_rows[] = $rows;
				++$a;
			}

			if($a == $limit[1] || $a == $SumResult) break;	// 加够了或等于总和就退出
			++$i;
		}

		$this -> _free($rs);

		$ApproximateTag = ($ApproximateTag && isset($Engine) && $Engine == 'InnoDB' ) ?  '≈' : '';
		Return array($all_rows, round($endtime - $starttime, 5), $SumResult, $fields, array($CacheTag . $ApproximateTag));
		// 记录集, 运行时间, 总数, 字段名称, 其它数据
 	}

	// 执行操作类型SQL
	function OperationQuery($sql) 
	{
		global $Amysql;
		if (empty($sql) || count($sql) == 0) Return false;
		if (!is_array($sql))
			$SqlArr[] = $sql;
		else 
			$SqlArr = $sql;

		$affected = 0;
		$status = array();
		foreach ($SqlArr as $key=>$val)
		{
			if(!empty($val))
			{
				$rs = $this -> _query($val);

				$this -> InsertSqlLog($val, $rs, $Amysql -> AmysqlProcess -> AmysqlController -> DatabaseName, $Amysql -> AmysqlProcess -> AmysqlController -> TableName);
				if ($rs) 
				{	
					$SqlFromNameTag = $Amysql -> AmysqlProcess -> AmysqlController -> DatabaseName.$Amysql -> AmysqlProcess -> AmysqlController -> TableName;
					$_SESSION['last_sql'][$SqlFromNameTag] = null;
					$status[] = 'success';
					if(!Functions::is_QueryData($val)) 
						$affected += mysqli_affected_rows($this -> MysqlConnect);
				}
				else 
				{
					$status[] = 'fail';
					Return array(mysqli_error($this -> MysqlConnect), $affected, $status);
				}
			}
		}
		Return array(null, $affected, $status);
	}

	// 写Sql查询日志
	function InsertSqlLog($sql, $status, $DB, $DT)
	{
		global $Amysql;
		$sqllog = $Amysql -> AmysqlProcess -> AmysqlController -> _file('DataFile_system_sqllog.system');
		$sqllog = unserialize(trim($sqllog, '<?php //'));
		if (!is_array($sqllog)) $sqllog = array();
		$sqllog[] = array('sql' => $sql, 'DB' => $DB, 'DT' => $DT, 'status' => ($status ? '1': '0'), 'time' => time());
		$sqllimit = (int)$Amysql -> AmysqlProcess -> AmysqlController -> SystemConfig -> SqlLogLimit;
		if (count($sqllog) > $sqllimit) $sqllog = array_slice($sqllog, $sqllimit*-1, $sqllimit);
		$Amysql -> AmysqlProcess -> AmysqlController -> _plus('DataFile_system_sqllog.system', '<?php //' . serialize($sqllog));
	}


	// 分析sql 获取表的数量
	function ExplainSql($sql)
	{
		$sql = 'EXPLAIN ' . $sql;
		Return $this -> _sum($sql);

	}

	// 获取mysql COLLATIONS 字段校对
	function GetCollations()
	{
		$sql = "SHOW COLLATION";
		$result = $this -> _query($sql);
		while ($rs = mysqli_fetch_assoc($result))
		{
			$data[$rs['Charset']][] = $rs['Collation'];
			if($rs['Default'] == 'Yes') 
				$CollationDefault[$rs['Charset']] = $rs['Collation'];
		}

		ksort($data);
		foreach ($data as $key=>$val)
			asort($data[$key]);

		Return array('All' => $data, 'Default' => $CollationDefault);
 	}

	// 获取MYSQL引擎
	function GetEngines()
	{
		$sql = "SHOW STORAGE ENGINES";
		$result = $this -> _query($sql);
		$i = 1;
		while ($rs = mysqli_fetch_assoc($result))
		{
			if($rs['Support'] != 'NO')
				$data[($rs['Support'] == 'DEFAULT' ? 0 : ++$i)] = $rs['Engine'];
		}
		Return $data;
	}
	
	// 获取索引
	function ShowIndex($table, $database)
	{
		$_database = Functions::SqlKeyword($database);
		$_table = Functions::SqlKeyword($table);
		
		$sql ="SHOW INDEX FROM `$_database`.`$_table`";
		$result = $this -> _query($sql);
		if(!$result || mysqli_num_rows($result) == 0) Return array();
		while ($rs = mysqli_fetch_assoc($result))
		{
			if ('PRIMARY' == $rs['Key_name']) 
				$rs['type'] = 'PRIMARY';
			elseif ('FULLTEXT' == $rs['Index_type']) 
				$rs['type'] = 'FULLTEXT';
			elseif('0' == $rs['Non_unique']) 
				$rs['type'] = 'UNIQUE';
			else 
				$rs['type'] = 'INDEX';

			$data[] = $rs;
		}
		Return $data;
	}

	// 数据库列表&相关信息
	function GetDatabasesListInfo($data)
	{
		if (is_array($data[0]))
		{
			foreach ($data[0] as $key=>$val)
			{
				$DBname = $val['Database'];
				$sql = "SHOW TABLES FROM `$DBname` ";
				$st_result = $this -> _query($sql);
				if($st_result)
					$data[0][$key]['TableSum'] = mysqli_num_rows($st_result);

				$data[0][$key]['Collation'] = '/';
				$sql = "SHOW CREATE DATABASE `$DBname` ";
				$sc_result = $this -> _query($sql);
				if($sc_result)
				{
					$collations = mysqli_fetch_assoc($sc_result);
					preg_match("/DEFAULT CHARACTER SET (.*) /Ui", $collations['Create Database'], $character); 
					$data[0][$key]['Collation'] = $character[1];
				}
			}
		}

		if (is_array($data[3]))
		{
			$object = new stdClass();
			$object -> name = 'TableSum';
			$data[3][] = $object;
			$object = new stdClass();
			$object -> name = 'Collation';
			$data[3][] = $object;
		}
		Return $data;
	}
	
	// 使用指定数据库　
	function UseDatabases($databases)
	{
		global $Config;
		mysqli_select_db($this -> MysqlConnect, $databases);
		$this -> _query("SET NAMES '" . str_replace('-', '', $Config['CharSet'])  . "'");
	}

	function GetError()
	{
		Return  '#<b>'.mysqli_errno($this -> MysqlConnect) . "</b> : " . mysqli_error($this -> MysqlConnect);
	}

	function GetVersion()
	{
		return mysqli_get_server_info($this -> MysqlConnect);
	}
 
}

?>