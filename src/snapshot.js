/* Wraps a jsdom call and returns the full page */

import jsdom from "jsdom/lib/old-api.js"

export default (protocol, host, path, delay) => {
  var virtualConsole = jsdom.createVirtualConsole();
  virtualConsole.sendTo(console);
  virtualConsole.on("jsdomError", function (error) {
    console.error(error.stack, error.detail);
  })
  return new Promise((resolve, reject) => {
    let reactSnapshotRenderCalled = false
    const url = `${protocol}//${host}${path}`
    jsdom.env({
      url,
      headers: { Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8" },
      resourceLoader(resource, callback) {
        if (resource.url.host === host) {
          resource.defaultFetch(callback);
        } else {
          callback()
        }
      },
      features: {
        FetchExternalResources: ["script"],
        ProcessExternalResources: ["script"],
        SkipExternalResources: false
      },
      onload: () => {
        console.log('loaded');
      },
      virtualConsole: virtualConsole,
      created: (err, window) => {
        if (err) {
          console.error(err);
          return reject(err)
        } 
        if (!window) {
          console.error(`Looks like no page exists at ${url}`);
          return reject(`Looks like no page exists at ${url}`)
        }
        window.reactSnapshotRender = () => {
          reactSnapshotRenderCalled = true
          setTimeout(() => {
            resolve(window)
          }, delay)
        }
      },
      strictSSL: false,
      done: (err, window) => {
        if (!reactSnapshotRenderCalled) {
          reject("'render' from react-snapshot was never called. Did you replace the call to ReactDOM.render()?")
        }
      }
    })
  })
}
