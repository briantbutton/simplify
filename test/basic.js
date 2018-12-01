const expect = require("chai").expect;
const simplify = require('../src/simplify');

describe("simplify - basic tests", function() {
  it("malformed filter with no type throws an error", function() {
    expect(function() {
      simplify({
        attribute: 'country', value: 'United States'
      });
    }).to.throw()
  });

  it("malformed `in` throws an error", function() {
    expect(function() {
      simplify({
        type: 'in', attribute: 'country', value: 'United States, Mexico'
      });
    }).to.throw()
  });

  it("`in` of no values would match no values", function() {
    expect(simplify({
      type: 'in', attribute: 'country', values: []
    })).to.deep.equal({
      type: 'false'
    });
  });

  it("`in` with one value is basically an IS", function() {
    expect(simplify({
      type: 'in', attribute: 'country', values: ['Mexico']
    })).to.deep.equal({
      type: 'is', attribute: 'country', value: 'Mexico'
    });
  });

  it("`in` doesn't need to have duplicate values", function() {
    expect(simplify({
      type: 'in', attribute: 'country', values: ['United States', 'Mexico', 'Mexico']
    })).to.deep.equal({
      type: 'in', attribute: 'country', values: ['United States', 'Mexico']
    });
  });

  it("Nothing to do here", function() {
    expect(simplify({
      type: 'and',
      filters: [
        { type: 'is', attribute: 'country', value: 'United States' },
        { type: 'is', attribute: 'state', value: 'California' }
      ]
    })).to.deep.equal({
      type: 'and',
      filters: [
        { type: 'is', attribute: 'country', value: 'United States' },
        { type: 'is', attribute: 'state', value: 'California' }
      ]
    });
  });

  it("A country can not be both United States and United Kingdom", function() {
    expect(simplify({
      type: 'and',
      filters: [
        { type: 'is', attribute: 'country', value: 'United States' },
        { type: 'is', attribute: 'country', value: 'United Kingdom' }
      ]
    })).to.deep.equal({
      type: 'false'
    });
  });

  it("A filter of 'country is Mexico' is enough", function() {
    expect(simplify({
      type: 'and',
      filters: [
        { type: 'in', attribute: 'country', values: ['United States', 'Mexico'] },
        { type: 'in', attribute: 'country', values: ['Mexico', 'United Kingdom'] }
      ]
    })).to.deep.equal({
      type: 'is', attribute: 'country', value: 'Mexico'
    });
  });

  it("A nested `and` should become flat", function() {
    expect(simplify({
      type: 'and',
      filters: [
        { type: 'is', attribute: 'country', value: 'United States' },
        {
          type: 'and',
          filters: [
            { type: 'is', attribute: 'device', value: 'iPhone' },
            { type: 'is', attribute: 'state', value: 'California' }
          ]
        }
      ]
    })).to.deep.equal({
      type: 'and',
      filters: [
        { type: 'is', attribute: 'country', value: 'United States' },
        { type: 'is', attribute: 'device', value: 'iPhone' },
        { type: 'is', attribute: 'state', value: 'California' }
      ]
    });
  });
});

