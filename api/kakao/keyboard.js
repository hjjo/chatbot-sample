'use strict';

let getKeyboard = (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  return res.json({
    "type" : "text"
  })
};

module.exports = {
  'initialize': function(app, options) {
    app.get('/api/kakao/keyboard', getKeyboard);
  }
};