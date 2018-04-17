"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _oldApi = require("jsdom/lib/old-api.js");

var _oldApi2 = _interopRequireDefault(_oldApi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (protocol, host, path, delay) {
  var virtualConsole = _oldApi2.default.createVirtualConsole();
  virtualConsole.sendTo(console);
  virtualConsole.on("jsdomError", function (error) {
    console.error(error.stack, error.detail);
  });
  return new Promise(function (resolve, reject) {
    var reactSnapshotRenderCalled = false;
    var url = protocol + "//" + host + path;
    _oldApi2.default.env({
      url: url,
      headers: { Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8" },
      resourceLoader: function resourceLoader(resource, callback) {
        if (resource.url.host === host) {
          resource.defaultFetch(callback);
        } else {
          callback();
        }
      },

      features: {
        FetchExternalResources: ["script"],
        ProcessExternalResources: ["script"],
        SkipExternalResources: false
      },
      onload: function onload() {
        console.log('loaded');
      },
      virtualConsole: virtualConsole,
      created: function created(err, window) {
        if (err) {
          console.error(err);
          return reject(err);
        }
        if (!window) {
          console.error("Looks like no page exists at " + url);
          return reject("Looks like no page exists at " + url);
        }
        window.reactSnapshotRender = function () {
          reactSnapshotRenderCalled = true;
          setTimeout(function () {
            resolve(window);
          }, delay);
        };
      },
      strictSSL: false,
      done: function done(err, window) {
        if (!reactSnapshotRenderCalled) {
          reject("'render' from react-snapshot was never called. Did you replace the call to ReactDOM.render()?");
        }
      }
    });
  });
}; /* Wraps a jsdom call and returns the full page */

module.exports = exports["default"];