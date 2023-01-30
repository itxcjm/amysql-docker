/************************************************
 *
 * Amysql Framework
 * Amysql.com 
 * @param Object 
 * AmysqlTableConfigure
 *
 */

// 字段所有类型
var ColumnTypes = [ 'INT', 'VARCHAR', 'TEXT', 'DATE', 
	['NUMERIC', ['TINYINT', 'SMALLINT', 'MEDIUMINT', 'INT', 'BIGINT', '-', 'DECIMAL', 'FLOAT', 'DOUBLE', 'REAL', '-', 'BIT', 'BOOL', 'SERIAL']],
	['DATE and TIME', ['DATE', 'DATETIME', 'TIMESTAMP', 'TIME', 'YEAR']],
	['STRING', ['CHAR', 'VARCHAR', '-', 'TINYTEXT', 'TEXT', 'MEDIUMTEXT', 'LONGTEXT', '-', 'BINARY', 'VARBINARY', '-', 'TINYBLOB', 'MEDIUMBLOB', 'BLOB', 'LONGBLOB', '-', 'ENUM', 'SET']],
	['SPATIAL', ['GEOMETRY', 'POINT', 'LINESTRING', 'POLYGON', 'MULTIPOINT', 'MULTILINESTRING', 'MULTIPOLYGON', 'GEOMETRYCOLLECTION']]
];


// 数字操作符
var NumOperators = ['=', '>', '>=', '<', '<=', '!=', 'LIKE', 'NOT LIKE', 'IS NULL', 'IS NOT NULL'];

// 字符串操作符
var StrOperators = ['LIKE','LIKE %...%','NOT LIKE','=','!=','= \'\'','!= \'\'','IS NULL','IS NOT NULL','REGEXP','NOT REGEXP'];

// 字段属性
var TextOperators = ['', 'BINARY','UNSIGNED','UNSIGNED ZEROFILL','on update CURRENT_TIMESTAMP'];

// 索引类型
var ColumnIndex =  ['', [L.SelectIndex, ['PRIMARY', 'UNIQUE', 'INDEX', 'FULLTEXT']]];

// 数据Collations列表
var Collations = parent.AmysqlCollations;


// BLOB类型对应大小
var BlobSize = {'tinyblob':'255 B', 'blob':'65 KB', 'mediumblob':'16 MB', 'longblob':'4 GB'};
