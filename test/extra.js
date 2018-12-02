const expect = require("chai").expect;
const simplify = require('../src/simplify');

describe("simplify - extra tests", function() {

  // Extra tests go here...

  it("`in` with one value is basically an IS", function() {
    expect(simplify({
      type: 'in', attribute: 'country', values: ['Mexico']
    })).to.deep.equal({
      type: 'is', attribute: 'country', value: 'Mexico'
    });
  });

  it("Complex 'or' assembly is simplified", function() {
    expect(simplify({
      type: 'or',
      filters: [
        {
          type: 'or',
          filters: [
            { type: 'in',  attribute: 'stuff',    values: ["alpha","bravo"] },
            { type: 'in',  attribute: 'stuff',    values: ["bravo","charlie"] }
          ]
        },
        {
          type: 'or',
          filters: [
            { type: 'in',  attribute: 'nonsense', values: ["alpha","bravo","delta"] },
            { type: 'in',  attribute: 'stuff',    values: ["bravo","charlie","delta","echo"] }
          ]
        }
      ]
    })).to.deep.equal({
      type: 'or',
      filters: [
        { type: 'in',  attribute: 'stuff',    values: ["bravo","charlie","delta","echo","alpha"] },
        { type: 'in',  attribute: 'nonsense', values: ["alpha","bravo","delta"] }
      ]
    });
  });


  it("Complex 'and' assembly is simplified", function() {
    expect(simplify({
      type: 'and',
      filters: [
        {
          type: 'and',
          filters: [
            { type: 'in',  attribute: 'stuff',    values: ["alpha","bravo"] },
            { type: 'in',  attribute: 'stuff',    values: ["bravo","charlie"] }
          ]
        },
        {
          type: 'and',
          filters: [
            { type: 'in',  attribute: 'nonsense', values: ["alpha","bravo","delta"] },
            { type: 'in',  attribute: 'stuff',    values: ["bravo","charlie","delta","echo"] }
          ]
        }
      ]
    })).to.deep.equal({
      type: 'and',
      filters: [
        { type: 'is',  attribute: 'stuff',    value:  "bravo" },
        { type: 'in',  attribute: 'nonsense', values: ["alpha","bravo","delta"] }
      ]
    });
  });

  it("Complex 'and' assembly is simplified even further", function() {
    expect(simplify({
      type: 'and',
      filters: [
        {
          type: 'and',
          filters: [
            { type: 'in',  attribute: 'stuff',    values: ["alpha","bravo"] },
            { type: 'in',  attribute: 'stuff',    values: ["bravo","charlie"] }
          ]
        },
        {
          type: 'and',
          filters: [
            { type: 'in',  attribute: 'stuff',    values: ["alpha","bravo","delta"] },
            { type: 'in',  attribute: 'stuff',    values: ["bravo","charlie","delta","echo"] }
          ]
        }
      ]
    })).to.deep.equal({
      type: 'is',  attribute: 'stuff',    value:  "bravo"
    });
  });

 // expect({thing:1}).to.deep.equal({thing:1})

 // expect({type:'is',attribute:'country',value:'Mexico'}).to.deep.equal({type:'is',attribute:'country',value:'Mexico'})
 // 
 //   testA = new In("thing",["thing1","thing2"]);
 //   testB = new In("thing",["thing2","thing3"]);
 //   testC = new In("things",["thing1","thing2","thing4"]);
 //   testD = new In("thing",["thing2","thing3","thing4","thing5"]);
 //   testE = new In("things",["thing6"]);

});
