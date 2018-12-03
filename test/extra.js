const expect = require("chai").expect;
const simplify = require('../src/simplify');

describe("simplify - extra tests", function() {

  it("Complex 'or' assembly is simplified, according to attribute", function() {
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

  it("Complex 'and' can go to null if there is no overlap", function() {
    expect(simplify({
      type: 'and',
      filters: [
        {
          type: 'and',
          filters: [
            { type: 'in',  attribute: 'stuff',    values: ["alpha","bravo"] },
            { type: 'in',  attribute: 'stuff',    values: ["alpha","charlie"] }
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
      type: 'false'
    });
  });
});
