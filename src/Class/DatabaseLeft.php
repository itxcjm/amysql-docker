<?php

/************************************************
 *
 * Amysql AMS
 * Amysql.com 
 * @param Object PHP数据库与表Item对象
 *
 */

class DatabaseItem {

	public $name;
	public $id;
	public $url;
	public $IcoClass = 'ico_database';
	public $ChildItem;
	public $ChildItemSum;
	public $open = false;			// 默认是否打开
	public $LoadDom = false;		// 默认是否加载

	function set($name)
	{
		$this -> name = $name;
		$this -> id = 'AmysqlDatabase_' . $name;	
		$this -> url = _Http . 'index.php?c=ams&a=AmysqlDatabase&DatabaseName=' . urlencode($name);
	}
};

class TableItem {

	public $name;
	public $id;
	public $url;
	public $IcoClass = 'ico_tabel';
	public $from;
	public $show = false;

	function set($name, $from)
	{
		$this -> name = $name;
		$this -> id = 'AmysqlTable_' .  $from . ' » ' . $name ;		
		$this -> url = _Http . 'index.php?c=ams&a=AmysqlTable&TableName=' . urlencode($name) . '&DatabaseName=' . urlencode($from);
		$this -> from = $from;
	}
};

class DatabaseLeft {}

?>