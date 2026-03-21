"use strict";

var fs = require('fs');

module.exports = function (client, Discord) {
  var load_dir = function load_dir(dirs) {
    var event_files = fs.readdirSync("./events/".concat(dirs)).filter(function (file) {
      return file.endsWith('.js');
    });
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = event_files[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var file = _step.value;

        var event = require("../events/".concat(dirs, "/").concat(file));

        var events_name = file.split('.')[0];
        client.on(events_name, event.bind(null, Discord, client));
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator["return"] != null) {
          _iterator["return"]();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  };

  ['client', 'guild'].forEach(function (e) {
    return load_dir(e);
  });
};