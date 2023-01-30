<?php

/************************************************
 *
 * Amysql AMS
 * Amysql.com 
 * @param Object 常用函数集
 *
 */

class Functions
{
	// 查询的SQl与实际名称互转 *********
	static function SqlKeyword($str)
	{
		$str = str_replace(array('`'), array('``'), $str);
		Return $str;
	}
	static function _SqlKeyword($str)
	{
		$str = str_replace(array('``','\\\`'), array('`'), $str);
		Return $str;
	}
	// ******************************

	// 过滤Sql其余字符用于相关判断
	static function FilterSqlElse($sql)
	{
		$sql = trim($sql);

		// 过滤SQL的注释
		$preg = "/(\\\')|" . '(\\\")' . "|(\\\`)/iU";
		$sql = self::StrSplit($sql, null, $preg, 'A-comment');
		$preg = "/\'(.*)\'|`(.*)`|\"(.*)\"/iU";
		$sql = self::StrSplit($sql, null, $preg, 'B-comment');
		$preg = "/([-]{2,}(.*))|(\/\*(\s|.)*?\*\/)/i";
		$sql = preg_replace($preg, '', $sql);

		$sql = self::StrSplit($sql, '', null, 'B-comment');
		$sql = self::StrSplit($sql, '', null, 'A-comment');

		$sql = str_replace(array("\n", "\r", "\t"), ' ', $sql);
		Return $sql;
	}

	// 判断是否为获取数据的sql
	static function is_QueryData($sql)
	{
		$sql = self::FilterSqlElse($sql);
		if (preg_match('/^(SELECT|SHOW|DESC|DESCRIBE|EXPLAIN|CHECK|ANALYZE|REPAIR|OPTIMIZE)\s+(.*)$/i', $sql))
			Return true;
		Return false;
	}

	// 判断是否为select 查询数据表
	static function is_select_QueryData($sql)
	{
		$sql = self::FilterSqlElse($sql);
		if(stripos($sql, 'SELECT') === 0)
			Return true;
		Return false;
	}


	// 判断是否为structure SQl
	static function is_structure($sql)
	{
		$sql = self::FilterSqlElse($sql);
		if (preg_match('/^(CREATE|ALTER|DROP|FLUSH)\s+(VIEW|TABLE|DATABASE|SCHEMA)\s+/i', $sql))
			Return true;
		Return false;
	}

	// 判断是否存在Limit
	static function ExistLimit($sql)
	{
		$sql = self::FilterSqlElse($sql);
		if (preg_match('/^(.*)\s+LIMIT\s+([0-9]{0,})\s*([\,]{0,})\s*([0-9]{1,})$/i', $sql))
			Return true;
		Return false;
	}

	// 是否为查询数据表列表
	static function ShowTableStatus($sql)
	{
		$sql = self::FilterSqlElse($sql);
		if (preg_match('/^SHOW\s+TABLE\s+STATUS\s+FROM(.*)/i', $sql))
			Return true;
		Return false;
		
	}

	// 是否为查询数据库列表
	static function ShowDatabases($sql)
	{
		$sql = self::FilterSqlElse($sql);
		if (preg_match('/^SHOW\s+DATABASES\s*(.*)$/i', $sql))
			Return true;
		Return false;
		
	}

	// Amysql系统SQL
	static function AmysqlSql($sql)
	{
		$sql = self::FilterSqlElse($sql);
		if (preg_match('/^SHOW\s+SQL\s+HELP\s*(.*)$/i', $sql))
			Return 'DataFile_sql_show sql help.sql';
		elseif (preg_match('/^SHOW\s+ABOUT\s*(.*)$/i', $sql))
			Return 'DataFile_sql_show about.sql';
		Return false;
	}
	
	// Amysql系统SQL数据
	static function AmysqlSqlData($data , $MysqlFetchType)
	{
		$data = json_decode($data);
		if($MysqlFetchType ==  MYSQLI_ASSOC)
			Return $data;

		$_data = array();
		foreach ($data[0] as $key=>$val)
		{
			$_var = array();
			foreach ($val as $k=>$v)
				$_var[] = $v;
			$_data[] = $_var;
		}
		$data[0] = $_data;
		unset($_data);
		Return $data;
	}



	// ***********************************************************
	/**
	 * 匹配与分隔字符串函数 
	 * Amysql AMS
	 * Amysql.com 
	 * @param string $SplitTag  分隔符，为null不分隔。
	 * @param string $preg		正则规则，为null不进行匹配。
	 * @param string $TempName	匹配的数据保存至SaveTempName的名称。
	 *
	 */
	static function StrSplit($sql, $SplitTag, $preg, $TempName)
	{
		global $LoadFunction, $SaveTempName;
		$SaveTempName = $TempName;
		if (!$LoadFunction)
		{
			// 保存字段与条件字符串至$SaveTempSql
			function SaveTempSql($match)
			{
				global $SaveTempSql, $SaveTempName, $sql;
				$k = strpos($sql, $match[0]) . '_' . rand(0,999999);	// 位置加随机号
				$SaveTempSql[$SaveTempName][$k] = $match[0];
				Return "[$SaveTempName" . $k . ']';
			}
			
			// 还原函数
			function GetTempSql($match)
			{
				global $SaveTempSql, $SaveTempName;
				if(!isset($SaveTempSql[$SaveTempName][$match[1]]))
					Return $match[0];
				Return $SaveTempSql[$SaveTempName][$match[1]];
			}
		}
		$LoadFunction = true;	// 只是首次加载函数

		// $preg不为NULL才进行匹配
		if($preg !== null) $sql = preg_replace_callback($preg, 'SaveTempSql', $sql);

		// $SplitTag不为NULL才进行分隔，并还原$SaveTempSql数据
		if($SplitTag !== null)
		{
			if ($SplitTag != '')
			{
				$SqlArr = explode($SplitTag, $sql);
				foreach ($SqlArr as $key=>$val)
				{
					$SqlArr[$key] = trim(preg_replace_callback('/\['. $SaveTempName. '([0-9\_]+)\]/iU', 'GetTempSql', $val));
					if (empty($SqlArr[$key]))
						unset($SqlArr[$key]);
				}
				Return $SqlArr;
			}

			Return trim(preg_replace_callback('/\['. $SaveTempName. '([0-9\_]+)\]/iU', 'GetTempSql', $sql));
		}
		
		Return $sql;
	}

	// 取得字符串实际库与表名称数组 
	static function GetStrDatabaseTableName($FindStr, $Type = null)
	{
		$FindStr = str_ireplace('IF NOT EXISTS', '', $FindStr);
		$FindStr = self::FilterSqlElse($FindStr);
		$TableNameArr = explode('.', $FindStr);
		$Return = null;
		if (!empty($FindStr))
		{
			$tag = '`';
			if(count($TableNameArr) == 2)					// 同时有库名与表名
				$Return = array('DatabaseName'=>$TableNameArr[0],'TableName'=>$TableNameArr[1]);
			elseif(count($TableNameArr) == 1)
			{
				$Return = (strcmp($Type, 'DATABASE') == 0) ? array('DatabaseName'=>$TableNameArr[0],'TableName'=>'') : array('DatabaseName'=>'','TableName'=>$TableNameArr[0]);
			}
			
			if(isset($Return['DatabaseName'][0]) && $Return['DatabaseName'][0] != '`') $Return['DatabaseName'] = '`' . $Return['DatabaseName'] . '`'; 
			if(isset($Return['TableName'][0]) && $Return['TableName'][0] != '`') $Return['TableName'] = '`' . $Return['TableName'] . '`'; 

			$Return['DatabaseName'] = '`' . self::_SqlKeyword(substr($Return['DatabaseName'],1,-1)) . '`';	// Sql转实际库名
			$Return['TableName'] = '`' . self::_SqlKeyword(substr($Return['TableName'],1,-1)) . '`';			// Sql转实际表名
		}
		else
			$Return = array('DatabaseName'=>'``','TableName'=>'``');

		Return $Return;
	}

	// ***********************************************************


	// 判断更新Left返回库表名
	static function LoadLeft($sql)
	{
		$sql = self::FilterSqlElse($sql);
		if (preg_match('/^(CREATE|DROP)\s+(VIEW|TABLE|DATABASE|SCHEMA)\s*/i', $sql))
		{
			// 删除库或表  ************
			if (stripos($sql, 'DROP') === 0)
			{
				preg_match_all('/^DROP\s+(VIEW|TABLE|DATABASE)\s*(.*)/i', $sql, $data);
				$TableList = trim($data[2][0]);

				// 有多个需要进行拆分处理
				$preg = "/\\\`/iU";
				$TableList = self::StrSplit($TableList, null, $preg, 'self');
				$preg = "/`(.*)`/iU";
				$TableList = self::StrSplit($TableList, ',', $preg, 'splitIng');
				foreach ($TableList as $key=>$val)
					$TableList[$key] = self::StrSplit($val, '', null, 'self');

				if (is_array($TableList) && count($TableList) > 0)
				{
					foreach ($TableList as $key=>$val)
					{
						$TableList[$key] = self::GetStrDatabaseTableName($val, $data[1][0]);
						$TableList[$key]['type'] = 'del';
					}
				}
			}
			else
			{
				if (preg_match('/^CREATE\s+TABLE\s*/iU', $sql))
				{
					// 新增数据表 ************
					preg_match_all('/^CREATE\s+TABLE\s*(.*)\(/iU', $sql, $data);
					if(!empty($data[1][0])) 
						$TableList[0] = self::GetStrDatabaseTableName($data[1][0]);
					$TableList[0]['TableType'] = 'TABLE';
				}
				elseif (preg_match('/^CREATE\s+VIEW\s*/iU', $sql))
				{
					// 新增视图表 ************
					preg_match_all('/^CREATE\s+VIEW\s*(.*)\s*AS/iU', $sql, $data);
					if(!empty($data[1][0])) 
						$TableList[0] = self::GetStrDatabaseTableName($data[1][0]);
					$TableList[0]['TableType'] = 'VIEW';
				}
				elseif (preg_match('/^CREATE\s+DATABASE\s*/iU', $sql))
				{
					// 新增数据库 ************
					// 存特殊符号
					$preg = "/(\\\`)|(``)/iU";
					$sql = self::StrSplit($sql, null, $preg, 'self_A');
					$preg = "/`(.*)`/iU";
					$sql = self::StrSplit($sql, null, $preg, 'self_B');

					// 匹配数据库名称
					preg_match_all('/^CREATE\s+DATABASE\s*((?:([\w]+))|(?:(\[[^\]]+\])))/i', $sql, $data);
					
					// 恢复特殊符号
					$sql = self::StrSplit($data[1][0], '', null, 'self_B');
					$sql = self::StrSplit($sql, '', null, 'self_A');
					$TableList[0] = self::GetStrDatabaseTableName($sql, 'DATABASE');
				}

				$TableList[0]['type'] = 'add';
			}
			
			Return $TableList;
		}
		Return false;
	}


	// 以分号进行分隔SQL
	static function SplitSql($sql)
	{
		// $sql = self::FilterSqlElse($sql);
		$sql = trim($sql);	// 2012-05-03改成首尾过滤回车空格

		// 首先把特殊的符号 \` 或 \' 或 \" 匹配存至$SaveTempSql[self]并返回值，避免影响下面的匹配。
		$preg = "/(\\\')|" . '(\\\")' . "|(\\\`)/iU";
		$sql = self::StrSplit($sql, null, $preg, 'self');

		// 接着以`` 或 '' 或 "" 进行匹配存至$SaveTempSql[splitIng]，接着以分号分隔并恢复$SaveTempSql[splitIng]的数据。
		$preg = "/\'(.*)\'|`(.*)`|\"(.*)\"/iU";
		$sql = self::StrSplit($sql, ';', $preg, 'splitIng');

		// 分隔后的SQL恢复$SaveTempSql[self]的数据。
		foreach ($sql as $key=>$val)
			$sql[$key] = self::StrSplit($val, '', null, 'self');

		Return $sql;
	}

	

	// 取得查询SQL的库、表名
	static function GetQuerySqlFromName($sql)
	{
		$FindStr = '';
		$sql = self::FilterSqlElse($sql);
		if (preg_match('/^(SELECT|SHOW|DELETE|EXPLAIN)\s+(.*)$/i', $sql))
		{
			preg_match_all('/^(.*)([`|*|\s])(.*)\bFROM\b\s*(.*)\s*(\bUNION\b|\bRRIGHT\b|\bLEFT\b|\bAS\b|\bWHERE\b|\bGROUP\b|\bORDER\b|\bLIMIT\b|\bLIKE\b){1,}\s*(.*)$/iU', $sql, $data);
			if(empty($data[4])) preg_match_all('/^(.*)([`|*|\s])(.*)FROM\s*(.*)\s*$/iU', $sql, $data);
			$FindStr = isset($data[4][0]) ? trim($data[4][0]) : '';

		}
		elseif(strpos($sql, 'INSERT') === 0)
		{
			preg_match_all('/^INSERT\s+INTO\s*(.*)\s*(\(|SET)(.*)$/iU', $sql, $data);
			$FindStr = trim($data[1][0]);
		}
		elseif(strpos($sql, 'UPDATE') === 0)
		{
			preg_match_all('/UPDATE\s*(.*)\s*SET(.*)$/iU', $sql, $data);
			$FindStr = trim($data[1][0]);
		}

		if (preg_match('/^SHOW\s+TABLE\s+STATUS(.*)$/i', $sql))	// 数据库页没有表加.``
			$FindStr .= '.``';
		
		Return self::GetStrDatabaseTableName($FindStr);
	}



	// 数据库的数据表列表数据处理
	static function DBDealWith($data)
	{
		if(!isset($data[3])) Return $data;
		// 新增列'Checksum','PACK_KEYS', 'DELAY_KEY_WRITE'。 这三个属性MyISAM表才拥有。
		$OrderByList = array('Name', 'Rows', 'Auto_increment', 'Engine', 'Collation', 'Comment', 'Row_format','Checksum','PACK_KEYS', 'DELAY_KEY_WRITE');
		foreach ($data[3] as $key=>$val)
		{
			if (!in_array($data[3][$key] -> name, $OrderByList))
				$OrderByList[] = $data[3][$key] -> name;
		}
		
		// 处理每一行数据
		foreach ($data[0] as $key=>$val)
		{
			$NewVal = array();
			foreach ($OrderByList as $v)
			{
				$NotExistsNewAdd = null;
				if($v == 'PACK_KEYS')
				{
					$NotExistsNewAdd = 'DEFAULT';
					(strpos($val['Create_options'], 'pack_keys=0') !== false && $NotExistsNewAdd = '0');
					(strpos($val['Create_options'], 'pack_keys=1') !== false && $NotExistsNewAdd = '1');
				}
				$NewVal[$v] = isset($val[$v]) ? $val[$v] : $NotExistsNewAdd;
			}
			$data[0][$key] = $NewVal;
		}

		$NewVal = array();
		foreach ($OrderByList as $v)
		{
			$NotExists = true;
			foreach ($data[3] as $key=>$val)
			{
				if($val -> name == $v) 
				{
					$NewVal[] = $val;
					unset($data[3][$key]);
					$NotExists = false;
					break;
				}
			}
			if($NotExists)	// 新增加不存在的列名
			{
				$$v = new stdClass();
				$$v -> name = $v;
				$$v -> table = 'TABLES';
				$NewVal[] = $$v;
			}
		
		}
		$data[3] = $NewVal;

		Return $data;
	}


	// *********************************************************************************************************************

	// 统计字节
	static function CountSize($size) 
	{
		foreach (array('', 'K', 'M', 'G') as $val)
		{
			if($size < 1024) 
				Return round($size, 1) . $val . 'B';
			$size /= 1024;
		}
	}
	
	// 统计时间
	static function CountTime($time) 
	{
		$TimeList = array(
			array('Second',1,60), array('Minute',60,3600), array('Hour',3600,86400), 
			array('Day',86400,2592000), array('Month',2592000,31104000), array('Year',31104000, NULL)
		);

		foreach ($TimeList as $val)
		{
			if($time >= $val[1] && ($time < $val[2] || $val[2] === NULL)) 
				Return array(round($time / $val[1], 1) , $val[0]);
		}
	}


	// 自动登录数据
	static function AutoLogin()
	{
		global $Amysql;		// AMP进程

		// SESSION登录
		if (isset($_SESSION['connect_mysql_pass']))
		{
			$DBSet = array();
			if(isset($_SESSION['connect_mysql_name']))
				$DBSet['Socket'] = "/tmp/{$_SESSION['connect_mysql_name']}.sock";
			$DBSet['Host'] = null;
			if(isset($_SESSION['connect_mysql_user']))
				$DBSet['User'] = $_SESSION['connect_mysql_user'];
			else
				$DBSet['User'] = 'root';
			$DBSet['Password'] = $_SESSION['connect_mysql_pass'];
			$Amysql -> AmysqlProcess -> AmysqlController -> _DBSet($DBSet);
			Return;
		}
		elseif(isset($_COOKIE['LoginFileName']))
		{
			$LoginFile = 'DataFile_login_'.$_COOKIE['LoginFileName'].'.login';
			$LoginData = $Amysql -> AmysqlProcess -> AmysqlController -> _file($LoginFile);
			$LoginData = json_decode(trim($LoginData, '<?php //'));
			
			// 登录KEY、IP一致与时间有效即通过验证
			if (!empty($LoginData) && isset($LoginData -> LoginKey) && 
				isset($_COOKIE['LoginKey']) && isset($_COOKIE['PassKey']) && $LoginData -> LoginKey == $_COOKIE['LoginKey'] && 
				$LoginData -> AvailableTime >  time()
			)
			{
				// 	$LoginData -> ip == $_SERVER['REMOTE_ADDR'] && 

				// 验证通过增加持续时间
				$LoginData -> AvailableTime = time() + $LoginData -> AddTime;
				$Amysql -> AmysqlProcess -> AmysqlController -> _plus($LoginFile, '<?php //' . json_encode($LoginData));
				setcookie('LoginKey', $_COOKIE['LoginKey'], $LoginData -> AvailableTime, '/');
				setcookie('PassKey', $_COOKIE['PassKey'], $LoginData -> AvailableTime, '/');

				// 直接调用AMP系统控制器进程更改MYSQL连接配置
				$DBSet = array();
				$DBSet['User'] = $LoginData -> User;
				$DBSet['Password'] = Functions::StrToKey($LoginData -> Password, $_COOKIE['PassKey']);
				$Amysql -> AmysqlProcess -> AmysqlController -> _DBSet($DBSet);
				Return true;
			}
			
			$Amysql -> AmysqlProcess -> AmysqlController -> _del($LoginFile);	// 验证失败删除数据文件
		}
		
		// 验证失败 **************************************
		if(isset($LoginData) && !empty($LoginData -> AddTime))
		{
			$TimeStr = Functions::CountTime($LoginData -> AddTime);
			$_SESSION['LoginError'] = '{js}printf(L.Timeout, {"time":"' . $TimeStr[0] . '", "unit":L.' . $TimeStr[1] . '}){/js}';
		}
		elseif(empty($Amysql -> AmysqlProcess -> AmysqlController -> DBConfig['Password']) && isset($_POST['sql']))
			$_SESSION['LoginError'] = '{js}printf(L.Timeout, {"time":"SESSION", "unit":""}){/js}';

		if (isset($_SESSION['LoginError']) && !empty($_SESSION['LoginError'])  && (isset($_COOKIE['LogoutNotice']) && $_COOKIE['LogoutNotice'] == '1'))
		{
			// 直接调用AMP系统控制器进程载入AmysqlNotice模板
			$Amysql -> AmysqlProcess -> AmysqlController -> AmysqlTemplates -> TemplateValue['AmysqlLanguage'] = isset($_COOKIE['Language']) ? $_COOKIE['Language'] : 'en';
			$Amysql -> AmysqlProcess -> AmysqlController -> AmysqlTemplates -> TemplateValue['LoginError'] = $_SESSION['LoginError'] . "\n\n{js}L.NowLogin{/js}";
			$Amysql -> AmysqlProcess -> AmysqlController -> _view('AmysqlNotice');
			exit();
		}

		Return false;
	}

	// 设置系统
	static function SetSystem()
	{
		global $Amysql;		// AMP进程
		$SystemConfigData = $Amysql -> AmysqlProcess -> AmysqlController -> _file('DataFile_system_config.system');
		$SystemConfigData = json_decode(trim($SystemConfigData, '<?php //'));
		$Amysql -> AmysqlProcess -> AmysqlController -> SystemConfig = $SystemConfigData;
		$Amysql -> AmysqlProcess -> AmysqlController -> PageShow = $SystemConfigData -> TableDataLine;	// 更改页显示数
		setcookie('LogoutNotice', $SystemConfigData -> LogoutNotice, time()*1.1, '/');					// 超时是否提示
		setcookie('Language', $SystemConfigData -> language, time()*1.1, '/');							// 语言
	}


	// 异或加密
	static function StrToKey($str, $key)
	{
		$str .= '';
		$len = strlen($str);
		$en = '';
		for($i=0;$i<$len;$i++) 
			$en .= $str[$i]^$key[$i];
		Return $en;
	}

	// 生成自动Key
	static function AutoKey($str)
	{
		$en_length = 32;
		$str .= '';
		$key = str_shuffle('abcdefghijklmnopqrstuvwxyz1234567890');
		$len = strlen($str);
		$en = '';
		for($i=0; $i<$len; $i++)
		{
			$_key = str_replace($str[$i], '', $key);
			$en .= $_key[$i];
		}

		$lenA = $en_length - strlen($en);
		if ($lenA > 0)
			$en .= substr($key, 0, $lenA);
		Return $en;
	}

}

?>