//  SIMPLIFY.MODELS  SIMPLIFY.MODELS  SIMPLIFY.MODELS  SIMPLIFY.MODELS 
//
module.exports = (function(){

  // * = * - * = * - * = * - * = * - * = * - * = * - * 
  //  BOOLEAN MODELS  BOOLEAN MODELS  BOOLEAN MODELS 
	// And and Or are very similar
	// So, there is one constructor, 'Bool'
	// 'And' and 'Or' are variations of Bool
  function Bool ( ) { } ;

  // This complicated loop iterates around the possible reductions until there are no more
  // It notes if there were reductions
  // It does not reduce twice
  Bool.prototype.reduce  = function ( allFilters , ix , union ) {
  	var me               = this,
  	    everChanged      = false,
  	    changed          = true,
  	    dissolved        = false,
  	    childFilter, myFilters;
  	if ( !this.reduced() ) {

  		// This loop does one child change at a time (inner loop)
  		// After each change, it grooms the filters array and starts again from the beginning
  		// When nothing changes, it exits
      while ( changed ) {
        changed          = false;
        myFilters        = this.filters();
        let len          = myFilters.length,
            index        = -1;

        // This loops until there is one change or we finish all children
        while ( !changed && len-1>index++ ) {
          childFilter    = myFilters[index];
          reduceChild(index);
          acquireCompatibleChild(index);
        }
        skimNulls();
        myFilters        = this.filters();
        dissolveSingleFilterBoolean();
        this.wasReduced();
      }
  	}
  	return everChanged;

    // Recursive call to child
  	function reduceChild(index){
      noteChange(childFilter.reduce(myFilters,index,me.union()))
  	};
  	// Acquires 'like' child filters and/and or or/or
  	function acquireCompatibleChild(index){
      if ( !changed && me.isOne(childFilter) ) {
      	noteChange(me.acquire(myFilters,index))
      }
  	};
  	// Dissolves a boolean filter with only one subordinate filter
  	function dissolveSingleFilterBoolean(){
      if ( allFilters && myFilters.length===1 && !dissolved ) {
      	allFilters[ix]   = myFilters[0];
      	dissolved        = true;
      	noteChange(true)
      }
  	};
  	// Child reductions may have replaced a filter with a null
  	// This removes them from our array 
  	function skimNulls(){
  		me.setFilters(myFilters.filter(isFilter))
  	};
  	function noteChange(newVal){
      changed            = newVal;
      everChanged        = everChanged || newVal
  	}
  };
  Bool.prototype.acquire = function ( myFilters , filterIx ) {
  	var otherAnd         = myFilters [ filterIx ] ,
  	    otherFilters     = otherAnd.filters();
  	myFilters.splice(filterIx,1);
  	otherFilters.forEach(filter=>myFilters.unshift(filter));
  	return true
  };
  // This function also performs a last bit of simplification
  // This is the simplest way to handle a couple corner cases
  Bool.prototype.toFilter= function ( ) {
  	var filters          = this.filters();
  	if ( filters.length ) {
  		if ( filters.length>1 ) {
        return { type : this.myType() , filters : filters.map(filter=>filter.toFilter()) }
  		}else{
        return filters[0].toFilter()
  		}
  	}else{
  		return { type : "false" }
  	}
  };

  function And ( filters ) {
    var reduced          = false;
    this.filters         = () => filters;
    this.setFilters      = f  => filters=f;
    this.wasReduced      = () => reduced=true;
    this.reduced         = () => reduced;
    this.union           = () => false;
    this.myType          = () => "and";
    this.isOne           = isAnd
  };
  Object.setPrototypeOf(And.prototype, Bool.prototype);

  function Or ( filters ) {
    var reduced          = false;
    this.filters         = () => filters;
    this.setFilters      = f  => filters=f;
    this.wasReduced      = () => reduced=true;
    this.reduced         = () => reduced;
    this.union           = () => true;
    this.myType          = () => "or";
    this.isOne           = isOr
  };
  Object.setPrototypeOf(Or.prototype, Bool.prototype);
  //  BOOLEAN MODELS  BOOLEAN MODELS  BOOLEAN MODELS 
  // * = * - * = * - * = * - * = * - * = * - * = * - * 

  // * = * - * = * - * = * - * = * - * = * - * = * - * 
  //   IN/IS MODELS   IN/IS MODELS   IN/IS MODELS  
  // 
  // 'Is' is just a special case of 'In' and does not need a separate constructor
  function In ( attr , vals ) {
    var valueObj         = {};
    vals.forEach(v=>valueObj[v]=true);
    this.attribute       = () => attr;
    this.valueObj        = () => valueObj;
  }
  In.prototype.keys      = function ( ) {
  	return Object.keys(this.valueObj())
  };
  In.prototype.similar   = function ( otherIn ) {
  	return otherIn.attribute() === this.attribute()
  };
  // Receives a set of Ins and returns a merged list of all keys using union or intersection
  In.prototype.merge     = function ( union , otherIns ) {
  	var allKeysObj       = {},
  	    inCount          = otherIns.length+1,
  	    threshold        = union?1:inCount,
  	    finalKeys;
  	countKeys(this);
  	otherIns.forEach(countKeys);
  	finalKeys            = Object.keys(allKeysObj).filter(k=>allKeysObj[k]>=threshold);
  	return finalKeys;

    function countKeys ( me ) {
      me.keys().forEach(increment)
    };
  	function increment(key){
  		if(allKeysObj[key]){
  			allKeysObj[key]++
  		}else{
  			allKeysObj[key]=1
  		}
  	}
  };
  // Creates a new 'In' that is the sum of itself and some others
  In.prototype.merged    = function ( union , otherIns ) {
    return new In ( this.attribute() , this.merge(union,otherIns) )
  };
  // This reduce looks at and may manipulate sibling filters
  // Thats OK because the parent (a boolean) will start over fresh with the new list
  In.prototype.reduce    = function ( allFilters , ix , union ) {
  	var me               = this,
  	    compatibleIXs    = [],
  	    reduced          = false;
  	if ( allFilters  ) {
  		let compatible     = allFilters.filter(findCompatible)
      if ( compatible.length ) {
        compatibleIXs.forEach(ix=>allFilters[ix]=null);
        allFilters[ix]     = me.merged(union,compatible);
        reduced            = true
      }
    }
    return reduced;

  	function findCompatible ( filter , filterIx ) {
  		let compatible     = false;
  		if ( isIn(filter) && me.similar(filter) && filter!==me ) {
  			compatible       = Boolean ( compatibleIXs.push(filterIx) )
  		}
  		return compatible
  	}
  };
  // Final step delivers a couple last-touch simplifications
  In.prototype.toFilter  = function ( ) {
  	var keys             = this.keys();
  	if(keys.length){
  		if(keys.length>1){
        return { type : "in" , attribute : this.attribute() , values : keys }
  		}else{
        return { type : "is" , attribute : this.attribute() , value : keys[0] }
  		}
  	}else{
  		return { type : "false" }
  	}
  };
  //   IN/IS MODELS   IN/IS MODELS   IN/IS MODELS  
  // * = * - * = * - * = * - * = * - * = * - * = * - * 

	return { And , Or , In } ;


  function isAnd(filt){
  	return typeof filt === "object" && filt!=null && filt.constructor===And
  };
  function isOr(filt){
  	return typeof filt === "object" && filt!=null && filt.constructor===Or
  };
  function isIn(filt){
  	return typeof filt === "object" && filt!=null && filt.constructor===In
  };
  function isFilter(filt){
  	return typeof filt === "object" && filt!=null && ( filt.constructor===In || filt.constructor===Or || filt.constructor===And )
  };

})()
