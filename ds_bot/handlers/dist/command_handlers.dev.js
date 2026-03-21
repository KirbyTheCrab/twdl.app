"use strict";

var fs = require('fs');

module.exports = function (client, Discord) {
  var command_files = fs.readdirSync('./commands/').filter(function (file) {
    return file.endsWith('.js');
  });
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = command_files[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var file = _step.value;

      var command = require("../commands/".concat(file));

      if (command.name) {
        client.commands.set(command.name, command);
      } else {
        continue;
      }
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