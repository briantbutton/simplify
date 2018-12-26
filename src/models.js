//  SIMPLIFY.MODELS  SIMPLIFY.MODELS  SIMPLIFY.MODELS  SIMPLIFY.MODELS 
//
module.exports = (function(){

  // * = * - * = * - * = * - * = * - * = * - * = * - * 
  //  BOOLEAN MODELS  BOOLEAN MODELS  BOOLEAN MODELS 
  // And and Or are very similar
  // So, there is one constructor, 'Bool'
  // 'And' and 'Or' are variations of Bool
  function Bool ( ) { } ;

  // If not a top-level call, parameters describe the parent Bool
  // If a top-level call there is no parent Bool and parameters are absent
  //   ~ parentFilters: The parents filters, includes this one and the siblings
  //   ~ ix:            The index of this filter in parentFilters
  //   ~ union:         True if parent is an "or"
  // 
  Bool.prototype.reduce   = function ( parentFilters , ix , union ) {
    var me                = this,
        everChanged       = false,
        changed           = true, myFilters;

    // This complicated loop iterates around the possible reductions until there are no more
    // It notes if there were reductions
    // It does not reduce twice (performance optimization)
    if ( !this.reduced() ) {

      // Outer Loop
      // Makes one simplification at a time (inner loop)
      // After each change, it grooms the filters array and starts again from the beginning
      // When nothing changes, it exits
      while ( changed ) {
        changed           = false;
        myFilters         = this.filters();
        let len           = myFilters.length,
            index         = -1;

        // This iterates until there is one change or we finish all children
        while ( !changed && len-1>index++ ) {
          reduceChild(myFilters, index);
          acquireCompatibleChild(myFilters, index);
        }
        skimNulls(myFilters);
        if ( notTopLevel() ) { dissolveSingleFilterBoolean(this.filters()) }   // If this list is down to one filter . . . perform further simplification
        this.setReduced()
      }
    }
    return everChanged;

    // Makes a recursive call to child filter
    // allSiblings includes this child
    // childIndex indicates which child is this
    function reduceChild ( allSiblings , childIndex ) {
      let childFilter     = allSiblings[childIndex],
          reduced         = childFilter.reduce(allSiblings,childIndex,me.union());
      if ( reduced ) { noteChange() }
    };
    // Acquires 'like' child filters and/and or or/or
    // allSiblings includes this child
    // childIndex indicates which child is this
    function acquireCompatibleChild( allSiblings , childIndex ){
      var childFilter     = allSiblings[childIndex];
      if ( !changed && me.isOne(childFilter) ) {                               // Qualify that parent and child are same operation
        allSiblings.splice(childIndex,1);                                      // Remove child from parent filter list
        childFilter.filters().forEach(filter=>allSiblings.unshift(filter));    // Insert child filters into parent filter list
        noteChange()
      }
    };
    // Dissolves a boolean filter with only one subordinate filter (possibly after other reductions)
    // Takes no action with a top-level call
    function dissolveSingleFilterBoolean(remainSiblings){
      if ( remainSiblings.length===1 ) {
        parentFilters[ix] = remainSiblings.pop();                              // Sticks my only filter into the into parents list
        noteChange()
      }
    };
    // Child reductions may have replaced a filter with a null
    // This removes them from our array 
    function skimNulls(myFilters){
      me.setFilters(myFilters.filter(isFilter))
    };
    function noteChange(){
      changed             = true;
      everChanged         = true
    };
    function notTopLevel(){
      return typeof parentFilters === "object" && parentFilters.constructor === Array
    };
  };
  // This function also performs a last bit of simplification
  Bool.prototype.toFilter = function ( ) {
    var filters           = this.filters();
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
    var reduced           = false;
    this.filters          = () => filters;
    this.setFilters       = f  => filters=f;
    this.reduced          = () => reduced;
    this.setReduced       = () => reduced=true;
    this.union            = () => false;
    this.myType           = () => "and";
    this.isOne            = isAnd
  };
  Object.setPrototypeOf(And.prototype, Bool.prototype);

  function Or ( filters ) {
    var reduced           = false;
    this.filters          = () => filters;
    this.setFilters       = f  => filters=f;
    this.reduced          = () => reduced;
    this.setReduced       = () => reduced=true;
    this.union            = () => true;
    this.myType           = () => "or";
    this.isOne            = isOr
  };
  Object.setPrototypeOf(Or.prototype, Bool.prototype);
  //  BOOLEAN MODELS  BOOLEAN MODELS  BOOLEAN MODELS 
  // * = * - * = * - * = * - * = * - * = * - * = * - * 

  // * = * - * = * - * = * - * = * - * = * - * = * - * 
  //   IN/IS MODELS   IN/IS MODELS   IN/IS MODELS  
  // 
  // 'Is' is just a special case of 'In' and does not need a separate constructor
  function In ( attr , vals ) {
    var valueObj          = {};
    vals.forEach(v=>valueObj[v]=true);
    this.attribute        = () => attr;
    this.valueObj         = () => valueObj;
  }
  // Receives a set of Ins and returns a merged list of all keys using union or intersection
  In.prototype.merge      = function ( union , otherIns ) {
    var allKeysObj        = {},
        inCount           = otherIns.length+1,
        threshold         = union?1:inCount;
    countKeys(this);
    otherIns.forEach(countKeys);
    return Object.keys(allKeysObj).filter(k=>allKeysObj[k]>=threshold)

    function countKeys ( me ) {
      Object.keys(me.valueObj()).forEach(increment)
    };
    function increment(key){
      if(!allKeysObj[key]){allKeysObj[key]=0}
      allKeysObj[key]++
    }
  };
  // Creates a new 'In' that is the sum of itself and some others
  In.prototype.merged     = function ( union , otherIns ) {
    var mergedValues      = this.merge(union,otherIns);
    if ( mergedValues.length ) {
      return new In ( this.attribute() , mergedValues )
    }else{
      return new No ( )
    }
  };
  // This reduce looks at and may manipulate sibling filters
  // Thats OK because the parent (a boolean) will start over fresh with the new list
  In.prototype.reduce     = function ( parentFilters , ix , union ) {
    var me                = this,
        compatibleIXs     = [],
        reduced           = false;
    if ( parentFilters  ) {
      let compatible      = parentFilters.filter(findCompatible);              // This call has a SIDE-EFFECT of filling 'compatibleIXs';   *sigh* It seemed expeditious
      if ( compatible.length ) {
        compatibleIXs.forEach(ix=>parentFilters[ix]=null);                     // Remove compatible filters from the parent filter list
        parentFilters[ix] = me.merged(union,compatible);                       // Merge them with *this* filter, put result in *this* slot
        reduced           = true
      }
    }
    return reduced;

    // A "compatible" filter is another 'In' with the same 'attribute' field but is not me
    function findCompatible ( filter , filterIx ) {
      let compatible      = false;
      if ( isIn(filter) && filter.attribute() === me.attribute() && filter!==me ) {
        compatibleIXs.push(filterIx);
        compatible        = true
      }
      return compatible
    }
  };
  // Final step delivers a couple last-touch simplifications
  In.prototype.toFilter   = function ( ) {
    var keys              = Object.keys(this.valueObj());
    if ( keys.length ) {
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

  // * = * - * = * - * = * - * = * - * = * - * = * - * 
  //   YES/NO MODELS   YES/NO MODELS   YES/NO MODELS  
  // 
  // These are the models for "true" and "false"
  // 
  function Yes ( ) { 
    this.reduce           = YesNoReduce(true);
    this.toFilter         = function ( ) { return { type : "true" } }
  };
  function No  ( ) { 
    this.reduce           = YesNoReduce(false);
    this.toFilter         = function ( ) { return { type : "false" } }
  };

  // A true or false either vanishes or controls the outcome, depending on
  // whether the parent is and "and" or an "or"
  // This function creates a reduce function that behaves appropriately
  function YesNoReduce (value) {
    return function ( parentFilters , ix , union ) {
      var reduced         = false;
      if ( parentFilters ) {
        if ( union === !value ) {                                              // This filter has no effect . . .
          parentFilters[ix] = null;                                            //  . . . remove it
          reduced         = true
        }else{
          if ( parentFilters.length > 1 ) {                                    // This filter controls . . .
            parentFilters.forEach(function(filter,index){                      //  . . . remove all the others
              if(index!==ix){parentFilters[index]=null}
            });
            reduced       = true
          }
        }
      }
      return reduced
    }
  };
  //   YES/NO MODELS   YES/NO MODELS   YES/NO MODELS  
  // * = * - * = * - * = * - * = * - * = * - * = * - * 

  return { And , Or , In , Yes , No } ;


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
    return typeof filt === "object" && filt!=null && ( filt.constructor===In || filt.constructor===Or || filt.constructor===And || filt.constructor===Yes || filt.constructor===No )
  };

})()
