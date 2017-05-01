let bodyparser = require('body-parser');
let express = require('express');
let status = require('http-status');

module.exports = function(wagner) {
  let api = express.Router();

  api.use(bodyparser.json());

//----------------------------------------------------------------------
// User route api
//----------------------------------------------------------------------


  api.put('/me/cart', wagner.invoke(function(User) {
    return function(req, res) {
      try {
        var cart = req.body.data.cart;
      } catch(e) {
        return res.
          status(status.BAD_REQUEST).
          json({ error: 'No cart specified!' });
      }

      req.user.data.cart = cart;
      req.user.save(function(error, user) {
        if (error) {
          return res.
            status(status.INTERNAL_SERVER_ERROR).
            json({ error: error.toString() });
        }
        return res.json({ user: user });
      });
    };
  }));

  api.get('/me', function(req, res) {
    if (!req.user) {
      return res.
        status(status.UNAUTHORIZED).
        json({ error: 'Not logged in' });
    }
    //join
    req.user.populate(
      { path: 'data.cart.product', model: 'Product' },
      handleOne.bind(null, 'user', res));
  });

  return api;
};


//----------------------------------------------------------------------
// Helper functions
//----------------------------------------------------------------------

function handleOne(property, res, error, result) {
  if (error) {
    return res.
      status(status.INTERNAL_SERVER_ERROR).
      json({ error: error.toString() });
  }
  if (!result) {
    return res.
      status(status.NOT_FOUND).
      json({ error: 'Not found' });
  }

  let json = {};
  json[property] = result;
  res.json(json);
}
