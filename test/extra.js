const expect = require("chai").expect;
const simplify = require('../src/simplify');

describe("simplify - extra tests", function() {

  it("True matches true", function() {
    expect(simplify({
      type: 'true'
    })).to.deep.equal({
      type: 'true'
    });
  });

  it("False matches false", function() {
    expect(simplify({
      type: 'false'
    })).to.deep.equal({
      type: 'false'
    });
  });

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

  it("A 'false' in an 'and' propogates upward", function() {
    expect(simplify({
      type: 'and',
      filters: [
        {
          type: 'and',
          filters: [
            { type: 'in',  attribute: 'nonsense', values: ["alpha","bravo","charlie"] },
            { type: 'in',  attribute: 'nonsense', values: ["alpha","charlie"] }
          ]
        },
        {
          type: 'and',
          filters: [
            { type: 'false' }
          ]
        }
      ]
    })).to.deep.equal({
      type: 'false'
    });
  });

  it("A calculated 'false' in an 'and' propogates upward", function() {
    expect(simplify({
      type: 'and',
      filters: [
        {
          type: 'and',
          filters: [
            { type: 'in',  attribute: 'nonsense', values: ["alpha","bravo","charlie"] },
            { type: 'in',  attribute: 'nonsense', values: ["alpha","charlie"] }
          ]
        },
        {
          type: 'and',
          filters: [
            { type: 'in',  attribute: 'stuff',    values: ["alpha","delta"] },
            { type: 'in',  attribute: 'stuff',    values: ["bravo"] }
          ]
        }
      ]
    })).to.deep.equal({
      type: 'false'
    });
  });

  it("A calculated 'false' in an 'or' vanishes", function() {
    expect(simplify({
      type: 'or',
      filters: [
        {
          type: 'and',
          filters: [
            { type: 'in',  attribute: 'nonsense', values: ["alpha","bravo","charlie"] },
            { type: 'in',  attribute: 'nonsense', values: ["alpha","charlie"] }
          ]
        },
        {
          type: 'and',
          filters: [
            { type: 'in',  attribute: 'stuff',    values: ["alpha","delta"] },
            { type: 'in',  attribute: 'stuff',    values: ["bravo"] }
          ]
        }
      ]
    })).to.deep.equal({
      type: 'in',  attribute: 'nonsense', values: ["alpha","charlie"] 
    });
  });

  it("A 'true' in an 'and' vanishes", function() {
    expect(simplify({
      type: 'and',
      filters: [
        {
          type: 'and',
          filters: [
            { type: 'in',  attribute: 'nonsense', values: ["alpha","bravo","charlie"] },
            { type: 'in',  attribute: 'nonsense', values: ["alpha","charlie"] }
          ]
        },
        {
          type: 'true'
        }
      ]
    })).to.deep.equal({
      type: 'in',  attribute: 'nonsense', values: ["alpha","charlie"] 
    });
  });

});
