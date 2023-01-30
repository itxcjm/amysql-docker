<?php

class index extends AmysqlController
{
	public $indexs = null;
	public $SystemConfig;					// 系统设置参数

	// 加载数据模型与函数类
	function AmysqlModelBase()
	{
		if($this -> indexs) return;
		$this -> _class('Functions');
		Functions::AutoLogin();				// 自动登录
		Functions::SetSystem();
		$this -> indexs = $this ->  _model('indexs');
	}

	// AMF首页 ******************
	function IndexAction($language = null)
	{
		$this -> AmysqlLanguage = $language ? $language : (isset($_COOKIE['Language']) ? $_COOKIE['Language'] : 'zh');
		$this -> _view('index');
	}


	// AMF框架内容 ***************
	function AmysqlContent()
	{
		$this -> AmysqlModelBase();
		$collations = $this -> indexs -> GetCollations();

		// 取得 MySql Collations 
		foreach ($collations['All'] as $key=>$val)
			$JsArr[] = "['$key' , ['" . implode("','", $collations['All'][$key]) . "']]";
		$this -> AmysqlCollations = "[''," . implode(",", $JsArr) . ']';
		$this -> AmysqlCollationsDefault = json_encode($collations['Default']);

		// 获取支持的引擎列表
		$this -> AmysqlEngines = $this -> indexs -> GetEngines();

		$this -> _view('AmysqlContent');
	}

	// AMF框架标签 **************
	function AmysqlTag()
	{
		$this -> _view('AmysqlTag');
	}

	// AMF框架左栏 *************
	function AmysqlLeft()
	{
		$this -> AmysqlModelBase();
		$this -> _class('DatabaseLeft');		// 载入数据库列表相关对象
		$this -> DatabasesList = json_encode($this -> indexs -> GetDatabasesList());

		$this -> _view('AmysqlLeft');
	}

	// ************************************************************************************************************
	// 登录 
	function AmysqlLogin()
	{
		if (isset($_COOKIE['LoginFileName']) && $_COOKIE['LoginFileName'])
		{
			// 已登录
			$this -> IndexAction();
			exit();
		}
			
		if (isset($_POST['login']))
		{
			$language = $_POST['language'];
			$time = $_POST['time'];
			$user = $_POST['user'];
			$password = $_POST['password'];
			setcookie('Language', $language, time()*1.1, '/');

			$_SESSION['LoginError'] = '{js}L.LoginError{/js}';		// 默认
			$_SESSION['AddTime'] = $time;

			$LoginInfo = array('User' => $user, 'Password' => $password);
			$this -> _DBSet($LoginInfo);
			$this -> _class('Functions');
			$this -> indexs = $this ->  _model('indexs');
			$this -> indexs -> _query('SELECT 1');

			// 登录成功
			if($this -> indexs -> QueryStatus)
			{
				$TimeArr = array('20I' => 1200, '1H' => 3600, '8H' => 3600*8, '1D' => 86400, '1M' => 86400*30);
				$AddTime = isset($TimeArr[$time]) ? $TimeArr[$time] : 300;
				
				// 登录数据记录
				$PassKey = Functions::AutoKey($password);							// 密码KEY
				$FileName = md5($_SERVER['REMOTE_ADDR'].time());					// 数据保存文件名
				$LoginInfo['LoginKey'] = md5(str_shuffle($FileName));				// 登录KEY
				$LoginInfo['ip'] = $_SERVER['REMOTE_ADDR'];							// 登录IP
				$LoginInfo['AvailableTime'] = time() + $AddTime;					// 有效时间
				$LoginInfo['AddTime'] = $AddTime;									// 持续时间
				$LoginInfo['language'] = $language;									// 语言
				$LoginInfo['Password'] = Functions::StrToKey($password, $PassKey);	// 密码加密
				if($this -> _plus('DataFile_login_' . $FileName . '.login', '<?php //' . json_encode($LoginInfo)))
				{
					setcookie('LoginFileName', $FileName, time()*1.1, '/');
					setcookie('LoginKey', $LoginInfo['LoginKey'], $LoginInfo['AvailableTime'], '/');
					setcookie('PassKey', $PassKey, $LoginInfo['AvailableTime'], '/');
					setcookie('LoginUser', $user, time()*1.1, '/');
				}
				
				// 同时SESSION记录
				$_SESSION['LoginError'] = $_SESSION['AddTime']  = $_SESSION['last_sql'] = null;
				$_SESSION['connect_mysql_user'] = $user;
				$_SESSION['connect_mysql_pass'] = $password;
				$this -> IndexAction($language);
			}

			exit();
		}

		if(isset($_SESSION['LoginError']) && $_SESSION['LoginError'])
			$this -> LoginError = $_SESSION['LoginError'];

		// 进行登录页面后清除错误信息
		$_SESSION['LoginError'] = null;	
		setcookie('LogoutNotice', '', time()-10000, '/');

		$this -> AmysqlLanguage = isset($_COOKIE['Language']) ? $_COOKIE['Language'] : 'zh';
		$this -> _view('AmysqlLogin');
	}

	// 退出
	function logout()
	{
		unset($_SESSION['connect_mysql_name']);
		unset($_SESSION['connect_mysql_user']);
		unset($_SESSION['connect_mysql_pass']);
		if(isset($_COOKIE['LoginFileName']) && !empty($_COOKIE['LoginFileName']))
			$this -> _del('DataFile_login_' . $_COOKIE['LoginFileName'] . '.login');
		$this -> _view('AmysqlNotice');
	}
	
	// 系统设置
	function AmysqlSystem()
	{
		$this -> AmysqlModelBase();
		if (isset($_POST['submit']))
		{
			$SystemConfig = array(	'SqlLine' => (int)$_POST['SqlLine'], 'TableDataLine' => (int)$_POST['TableDataLine'], 'TableResultContentLimit' => (int)$_POST['TableResultContentLimit'], 'time' => date('Y-m-d H:i:s', time()), 'language' => $_POST['language'], 'SqlLogLimit' => (int)$_POST['SqlLogLimit']);
			$SystemConfig['LogoutNotice'] = (isset($_POST['LogoutNotice']) && $_POST['LogoutNotice'] == 'on') ? 1 : 0;
			$SystemConfig['SqlUppercase'] = (isset($_POST['SqlUppercase']) && $_POST['SqlUppercase'] == 'on') ? 1 : 0;
			$SystemConfig['TableShowIndex'] = (isset($_POST['TableShowIndex']) && $_POST['TableShowIndex'] == 'on') ? 1 : 0;
			$SystemConfig['TableKeyDownGoPage'] = (isset($_POST['TableKeyDownGoPage']) && $_POST['TableKeyDownGoPage'] == 'on') ? 1 : 0;
			$SystemConfig['SqlBold'] = (isset($_POST['SqlBold']) && $_POST['SqlBold'] == 'on') ? 1 : 0;
			$SystemConfig['TableQueryCountCache'] = (isset($_POST['TableQueryCountCache']) && $_POST['TableQueryCountCache'] == 'on') ? 1 : 0;
			$SystemConfig['TableAccurateQuery'] = (isset($_POST['TableAccurateQuery']) && $_POST['TableAccurateQuery'] == 'on') ? 1 : 0;
			if($this -> _plus('DataFile_system_config.system', '<?php //' . json_encode($SystemConfig)))
			{
				$this -> status = 'right';
				$this -> notice = '{js}L.SaveSuccess{/js}';
			}
			else
			{
				$this -> status = 'error';
				$this -> notice = '{js}printf(L.SaveFileError, {"file":"View/DataFile/system/config.system.php"}){/js}';
			}
			Functions::SetSystem();
			unset($_SESSION['last_sql']);
		}

		$SystemConfigData = $this -> _file('DataFile_system_config.system');
		$this -> SystemConfig = json_decode(trim($SystemConfigData, '<?php //'));

		$this -> _view('AmysqlSystem');
	}


	// Sql查询日志
	function AmysqlSqlLog()
	{
		$this -> AmysqlModelBase();
		$sqllog = $this -> _file('DataFile_system_sqllog.system');
		$sqllog = unserialize(trim($sqllog, '<?php //'));
		$this -> sqllog = $sqllog;
		$this -> SqlLogLimit = $this -> SystemConfig -> SqlLogLimit;
		$this -> _view('AmysqlSqlLog');
	}

}