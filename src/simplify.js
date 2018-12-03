//  SIMPLIFY  SIMPLIFY  SIMPLIFY  SIMPLIFY  SIMPLIFY  SIMPLIFY 
//
// The filters are parsed into three models (two, actually) according to 'type'
// The parser performs checking for format errors
// The models simplify on command (".reduce()")
// And then spit out filters in the original format, on command
// 

module.exports          = (function(){

  const Models          = require('./models'),
        In              = Models.In,
        And             = Models.And,
        Or              = Models.Or,
        Parser          = require('./parser'),
        parser          = new Parser(In,And,Or);

  return simplify;

  function simplify ( filter ) {
    
	  const model         = parser.parse(filter);

	  model.reduce();

	  return model.toFilter();
  }
})()

// simplify = require("./Webs/misc/imply/simplify/src/simplify.js")
// ./Webs/misc/imply/simplify/test/basic.js
