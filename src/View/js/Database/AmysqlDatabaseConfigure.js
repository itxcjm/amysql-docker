/************************************************
 *
 * Amysql AMS
 * Amysql.com 
 * @param Object 
 * AmysqlDatabaseConfigure
 *
 */


// ROW FORMAT
var RowFormatInnoDB = ['COMPACT', 'REDUNDANT'];
var RowFormatMyISAM = ['FIXED', 'DYNAMIC'];

// 存储引擎
var StorageEngines =  parent.AmysqlEngines;

// PACK_KEYS
var PackKeys = ['DEFAULT', '0', '1'];

// 数据Collations列表
var Collations = parent.AmysqlCollations;