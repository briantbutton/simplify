//  SIMPLIFY.PARSER  SIMPLIFY.PARSER  SIMPLIFY.PARSER  SIMPLIFY.PARSER 
//
module.exports = (function(){

	return Parser;

	function Parser(In,And,Or){
    this.parse           = function (objIn) {
    	return parse(objIn)
    };
    function parse ( objIn ) {
    	if ( objIn.type==="in" ) {
        return new In ( objIn.attribute , objIn.values ) 
    	}
    	if ( objIn.type==="is" ) {
    		return new In ( objIn.attribute , [ objIn.value ] )
    	}
    	if ( objIn.type==="and" ) {
    		return new And ( objIn.filters.map(parse) )
    	}
    	if ( objIn.type==="or" ) {
    		return new Or ( objIn.filters.map(parse) )
    	}
    }
	}
  
})()
