CodeMirror.defineMode("plsql", function(config, parserConfig) {
  var indentUnit       = config.indentUnit,
      keywords         = parserConfig.keywords,
      functions        = parserConfig.functions,
      types            = parserConfig.types,
      sqlplus          = parserConfig.sqlplus,
      multiLineStrings = parserConfig.multiLineStrings;
  var isOperatorChar   = /[+\-*&%=<>!?:\/|`]/;
  function chain(stream, state, f) {
    state.tokenize = f;
    return f(stream, state);
  }

  var type;
  function ret(tp, style) {
    type = tp;
    return style;
  }

  function tokenBase(stream, state) {
    var ch = stream.next();
    // start of string?
    if (ch == '"' || ch == "'")
      return chain(stream, state, tokenString(ch));
    // is it one of the special signs []{}().,;? Seperator?
    else if (/[\[\]{}\(\),;\.]/.test(ch))
      return ret(ch);
    // start of a number value?
    else if (/\d/.test(ch)) {
      stream.eatWhile(/[\w\.]/);
      return ret("number", "number");
    }
    // multi line comment or simple operator?
    else if (ch == "/") {
      if (stream.eat("*")) {
        return chain(stream, state, tokenComment);
      }
      else {
        stream.eatWhile(isOperatorChar);
        return ret("operator", "operator");
      }
    }
    // single line comment or simple operator?
    else if (ch == "-") {
      if (stream.eat("-")) {
        stream.skipToEnd();
        return ret("comment", "comment");
      }
      else {
        stream.eatWhile(isOperatorChar);
        return ret("operator", "operator");
      }
    }
    // pl/sql variable?
    else if (ch == "@" || ch == "$") {
      stream.eatWhile(/[\w\d\$_]/);
      return ret("word", "variable");
    }
    // is it a operator?
    else if (isOperatorChar.test(ch)) {
      stream.eatWhile(isOperatorChar);
      return ret("operator", "operator");
    }
    else {
      // get the whole word
      stream.eatWhile(/[\w\$_]/);
      // is it one of the listed keywords?
      if (keywords && keywords.propertyIsEnumerable(stream.current().toLowerCase())) return ret("keyword", (SqlUppercase ? 'UpKeyword' : 'keyword') + (SqlBold ? ' bold' : ''));
      // is it one of the listed functions?
      if (functions && functions.propertyIsEnumerable(stream.current().toLowerCase())) return ret("keyword", "function");
      // is it one of the listed types?
      if (types && types.propertyIsEnumerable(stream.current().toLowerCase())) return ret("keyword", "types");
      // is it one of the listed sqlplus keywords?
      if (sqlplus && sqlplus.propertyIsEnumerable(stream.current()))
		  return ret("keyword", "field");
      // default: just a "word"
      return ret("word", "plsql-word");
    }
  }

  function tokenString(quote) {
    return function(stream, state) {
      var escaped = false, next, end = false;
      while ((next = stream.next()) != null) {
        if (next == quote && !escaped) {end = true; break;}
        escaped = !escaped && next == "\\";
      }
      if (end || !(escaped || multiLineStrings))
        state.tokenize = tokenBase;
      return ret("string", "string");
    };
  }

  function tokenComment(stream, state) {
    var maybeEnd = false, ch;
    while (ch = stream.next()) {
      if (ch == "/" && maybeEnd) {
        state.tokenize = tokenBase;
        break;
      }
      maybeEnd = (ch == "*");
    }
    return ret("comment", "plsql-comment");
  }

  // Interface

  return {
    startState: function(basecolumn) {
      return {
        tokenize: tokenBase,
        startOfLine: true
      };
    },

    token: function(stream, state) {
      if (stream.eatSpace()) return null;
      var style = state.tokenize(stream, state);
      return style;
    }
  };
});


// ************** 设置关键字 *******************
if(window.DatabaseName)
{
	var DatabaseTableList = parent.parent._AmysqlLeft.AmysqlLeftList.list.Item['AmysqlDatabase_' + DatabaseName].ChildItemData;
	for (var k in  DatabaseTableList)
		parent.window.AmysqlSqlObject.AddKeyword(DatabaseTableList[k].name, 'AmysqlTable');		// 数据表名
	parent.window.AmysqlSqlObject.AddKeyword(DatabaseName, 'AmysqlDatabase');					// 数据表名
}
if(window.TableName)
	parent.window.AmysqlSqlObject.AddKeyword(TableFieldListName, TableName);				// 数据表字段设置

function SqlPlusKeywords()
{
	var obj = {};
	var AmysqlSqlObjectWindow = parent.window;
	with(AmysqlSqlObjectWindow)	
	{
		for (key in AmysqlSqlObject.keyword)
		{
			if (key != 'Amysql_SqlGrammar' && key != 'Amysql_Functions' && key != 'Amysql_Types')
			{
				for (var i = 0; i < AmysqlSqlObject.keyword[key].length; ++i) 
					obj[AmysqlSqlObject.keyword[key][i]] = true;
			}
		}
	}
	return obj;
}
function keywords(str) {
	var obj = {}, words = str.split(" ");
	for (var i = 0; i < words.length; ++i) obj[words[i]] = true;
	return obj;
}
var cKeywords = parent.window.AmysqlSqlObject.keyword['Amysql_SqlGrammar'];
var cFunctions = parent.window.AmysqlSqlObject.keyword['Amysql_Functions'];
var cTypes = parent.window.AmysqlSqlObject.keyword['Amysql_Types'];

CodeMirror.defineMIME("text/x-plsql", {
	name: "plsql",
	keywords: keywords(cKeywords),
	functions: keywords(cFunctions),
	types: keywords(cTypes),
	sqlplus: SqlPlusKeywords()
});
