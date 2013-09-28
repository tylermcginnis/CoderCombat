var path = require('path');

module.exports = function(app) {
  app.set('port', process.env.PORT || 3000);
};