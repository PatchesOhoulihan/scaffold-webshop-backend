let assert = require('assert');
let express = require('express');
let superagent = require('superagent');
let wagner = require('wagner-core');

const URL_ROOT = 'http://localhost:3004';

describe('Category API', function() {
  let server;
  let Category;

  before(function() {
    let app = express();

    // Bootstrap server
    models = require('../dbschema/models')(wagner);
    app.use(require('../api-routes/category')(wagner));

    server = app.listen(3004);

    // Make Category model available in tests
    Category = models.Category;
  });

  after(function() {
    // Shut the server down when we're done
    server.close();
  });

  beforeEach(function(done) {
    // Make sure categories are empty before each test
    Category.remove({}, function(error) {
      assert.ifError(error);
      done();
    });
  });

  it('can load a category by id', function(done) {
    // Create a single category
    Category.create({ _id: 'Electronics' }, function(error, doc) {
      assert.ifError(error);
      let url = URL_ROOT + '/category/id/Electronics';
      // Make an HTTP request to localhost:3000/category/id/Electronics
      superagent.get(url, function(error, res) {
        assert.ifError(error);
        let result;
        // And make sure we got { _id: 'Electronics' } back
        assert.doesNotThrow(function() {
          result = JSON.parse(res.text);
        });
        assert.ok(result.category);
        assert.equal(result.category._id, 'Electronics');
        done();
      });
    });
  });

  it('can load all categories that have a certain parent', function(done) {
    let categories = [
      { _id: 'Electronics' },
      { _id: 'Phones', parent: 'Electronics' },
      { _id: 'Laptops', parent: 'Electronics' },
      { _id: 'Bacon' }
    ];

    // Create 4 categories
    Category.create(categories, function(error, categories) {
      let url = URL_ROOT + '/category/parent/Electronics';
      // Make an HTTP request to localhost:3000/category/parent/Electronics
      superagent.get(url, function(error, res) {
        assert.ifError(error);
        var result;
        assert.doesNotThrow(function() {
          result = JSON.parse(res.text);
        });
        assert.equal(result.categories.length, 2);
        // Should be in ascending order by _id
        assert.equal(result.categories[0]._id, 'Laptops');
        assert.equal(result.categories[1]._id, 'Phones');
        done();
      });
    });
  });
});