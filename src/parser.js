//  SIMPLIFY.PARSER  SIMPLIFY.PARSER  SIMPLIFY.PARSER  SIMPLIFY.PARSER 
//
module.exports = (function(){

	return Parser;

	function Parser(In,And,Or,Yes,No){
    this.parse           = function (objIn) {
    	return parse(objIn)
    };
    function parse ( objIn ) {
			if ( objIn.type==="true" )  { return new Yes() }
			if ( objIn.type==="false" ) { return new No() }
			if ( objIn.type==="in" )    { return parseIn(objIn) }
			if ( objIn.type==="is" )    { return parseIs(objIn) }
			if ( objIn.type==="and" )   { return parseAnd(objIn) }
			if ( objIn.type==="or" )    { return parseOr(objIn) }

			if ( typeof objIn.type==="string" ) {
				throw new Error("[Parser] Unrecognized type tag '"+objIn.type+"'")
			}else{
				throw new Error("[Parser] Filter must have type tag")
			}
    }

		function parseIn ( objIn ) {
			if ( !nes(objIn.attribute) ) { throw new Error("[Parser] 'in' filter must have attribute")}
			if ( !tyA(objIn.values) )    { throw new Error("[Parser] unrecognized value in 'is' filter")}
			return new In ( objIn.attribute , objIn.values ) 
		}
		function parseIs ( objIn ) {
			if ( !nes(objIn.attribute) ) { throw new Error("[Parser] unrecognized attribute in 'is' filter")}
			if ( !nes(objIn.value) )     { throw new Error("[Parser] unrecognized value in 'is' filter")}
			return new In ( objIn.attribute , [ objIn.value ] ) 
		}
		function parseAnd ( objIn ) {
			if ( !tyA(objIn.filters) )   { throw new Error("[Parser] unrecognized filters in 'and' filter")}
			return new And ( objIn.filters.map(parse) )
		}
		function parseOr ( objIn ) {
			if ( !tyA(objIn.filters) )   { throw new Error("[Parser] unrecognized filters in 'or' filter")}
			return new Or ( objIn.filters.map(parse) )
		}
	}

  // Non-empty string
	function nes (str) {
		return typeof str === "string" && str.length
	}
	// Type array
	function tyA (arr) {
		return typeof arr === "object" && arr.constructor === Array
	}
  
})()
