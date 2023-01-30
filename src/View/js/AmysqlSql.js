/**
 *	AMSQL SQL EDIT
 * ------------------------------
 */

// AmysqlSql
var AmysqlSql = function ()
{
	this.keyword = new Array();					// 关键字集合
	this.keyword['Amysql_SqlGrammar'] = 'show select from distinct where and or order group insert into top not like in between aliases as join union from delete update left right inner into create db table tables constraints set on is not null unique primary foreign key check default create index drop alter increment view date desc asc by limit change add database databases status processlist storage engines regexp kill describe';
	this.keyword['Amysql_Functions'] = 'abs acos adddate aes_encrypt aes_decrypt ascii asin atan atan2 avg benchmark bin bit_and bit_count bit_length bit_or cast ceil ceiling char_length character_length coalesce concat concat_ws connection_id conv convert cos cot count curdate current_date current_time current_timestamp current_user curtime date_add date_format date_sub dayname dayofmonth dayofweek dayofyear decode degrees des_encrypt des_decrypt elt encode encrypt exp export_set extract field find_in_set floor format found_rows from_days from_unixtime get_lock greatest group_unique_users hex ifnull inet_aton inet_ntoa instr interval is_free_lock isnull last_insert_id lcase least left length ln load_file locate log log2 log10 lower lpad ltrim make_set master_pos_wait max md5 mid min mod monthname now nullif oct octet_length ord password period_add period_diff pi position pow power quarter quote radians rand release_lock repeat reverse right round rpad rtrim sec_to_time session_user sha sha1 sign sin soundex space sqrt std stddev strcmp subdate substring substring_index sum sysdate system_user tan time_format time_to_sec to_days trim ucase unique_users unix_timestamp upper user version week weekday yearweek';
	this.keyword['Amysql_Types'] = 'bigint binary bit blob bool char character date datetime dec decimal double enum float float4 float8 int int1 int2 int3 int4 int8 integer long longblob longtext mediumblob mediumint mediumtext middleint nchar numeric real set smallint text time timestamp tinyblob tinyint tinytext varbinary varchar year';


	this.AddKeyword = function(msg, key)
	{	
		if(!msg) return;
		if(typeof(this.keyword[key]) != 'object') 
			this.keyword[key] = new Array();
		
		var arrstr = ',' + this.keyword[key].toString() + ',';	// 数组转字符串 用于判断 不存在才插入
		if( msg.indexOf(",")>0 )
		{
			// 插入多个
			var arrMsg=msg.split(",");
			for(var i=0; i<arrMsg.length; i++)
			{
				if(arrstr.indexOf(',' + arrMsg[i] + ',')==-1)	// 不存在
					arrMsg[i] ? this.keyword[key].push(arrMsg[i]) : "";
			}
		}
		else
		{
			if(arrstr.indexOf(',' + msg + ',')==-1) this.keyword[key].push(msg);
		}
		this.keyword[key].sort();
	}

};


