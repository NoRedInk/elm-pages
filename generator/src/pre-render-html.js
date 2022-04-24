const seo = require("./seo-renderer.js");
const cliVersion = require("../../package.json").version;
// const path = require("path");

/** @typedef { { head: any[]; errors: any[]; html: string; route: string; title: string; } } Arg */
/** @typedef { { tag : 'PageProgress'; args : Arg[] } } PageProgress */

function wrapHtml(basePath, fromElm, contentDatPayload) {
  const seoData = seo.gather(fromElm.head);
  var base64String = btoa(
    String.fromCharCode.apply(null, new Uint8Array(contentDatPayload.buffer))
  );

  return {
    kind: "html-template",
    title: fromElm.title,
    html: fromElm.html,
    bytesData: base64String,
    headTags: seoData.headTags,
    rootElement: seoData.rootElement,
  };
}

function devServerStyleTag() {
  /*html*/
  return `<style>
@keyframes lds-default {
    0%, 20%, 80%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.5);
    }
  }

#not-found-reason code {
  color: rgb(226, 0, 124);
}

#not-found-reason h1 {
  font-size: 26px;
  font-weight: bold;
  padding-bottom: 15px;
}

#not-found-reason a:hover {
  text-decoration: underline;
}
</style>`;
}

function templateHtml() {
  return /* html */ `<!DOCTYPE html>
<!-- ROOT --><html lang="en">
  <head>
    <!-- PLACEHOLDER_PRELOADS -->
    <script defer src="/elm.js" type="text/javascript"></script>
    <script defer src="${pathJoin(
      __dirname,
      "../static-code/elm-pages.js"
    )}" type="module"></script>
    <link rel="stylesheet" href="/style.css" />
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title><!-- PLACEHOLDER_TITLE --></title>
    <meta name="generator" content="elm-pages v${cliVersion}" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="theme-color" content="#ffffff" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta
      name="apple-mobile-web-app-status-bar-style"
      content="black-translucent"
    />
    <!-- PLACEHOLDER_HEAD_AND_DATA -->
  </head>
  <body>
    <div data-url="" display="none"></div>
    <!-- PLACEHOLDER_HTML -->
  </body>
</html>`;
}

/**
 * @param {string} processedTemplate
 */
function replaceTemplate(processedTemplate, info) {
  return processedTemplate
    .replace(
      /<!--\s*PLACEHOLDER_HEAD_AND_DATA\s*-->/,
      `${info.headTags}
                  <script id="__ELM_PAGES_BYTES_DATA__" type="application/octet-stream">${info.bytesData}</script>`
    )
    .replace(/<!--\s*PLACEHOLDER_TITLE\s*-->/, info.title)
    .replace(/<!--\s*PLACEHOLDER_HTML\s* -->/, info.html)
    .replace(/<!-- ROOT -->\S*<html lang="en">/m, info.rootElement);
}

/**
 * @param {string[]} parts
 * @returns {string}
 */
function pathJoin(...parts) {
  return parts.join("/");
}

module.exports = {
  wrapHtml,
  templateHtml,
  replaceTemplate,
};
