const renderer = require("../../generator/src/render");
const path = require("path");
const fs = require("./dir-helpers.js");
const compiledElmPath = path.join(process.cwd(), "elm-stuff/elm-pages/elm.js");
const { parentPort, threadId, workerData } = require("worker_threads");
let Elm;

const mm = require("micromatch");
const matter = require("gray-matter");
const globby = require("globby");
const fsPromises = require("fs").promises;

async function run({ mode, pathname, serverRequest, portsFilePath }) {
  console.time(`${threadId} ${pathname}`);
  try {
    const renderResult = await renderer(
      portsFilePath,
      workerData.basePath,
      requireElm(mode),
      mode,
      pathname,
      serverRequest,
      function (patterns) {
        if (mode === "dev-server" && patterns.size > 0) {
          parentPort.postMessage({ tag: "watch", data: [...patterns] });
        }
      },
      true,
      {
        mm,
        matter,
        globby,
        fsPromises,
        getEnv: function (name) {
          return process.env[name];
        },
      }
    );

    if (mode === "dev-server") {
      parentPort.postMessage({ tag: "done", data: renderResult });
    } else if (mode === "build") {
      outputString(renderResult, pathname);
    } else {
      throw `Unknown mode ${mode}`;
    }
  } catch (error) {
    if (error.errorsJson) {
      parentPort.postMessage({ tag: "error", data: error.errorsJson });
    } else {
      parentPort.postMessage({ tag: "error", data: error });
    }
  }
  console.timeEnd(`${threadId} ${pathname}`);
}

function requireElm(mode) {
  if (mode === "build") {
    if (!Elm) {
      const warnOriginal = console.warn;
      console.warn = function () {};

      Elm = require(compiledElmPath);
      console.warn = warnOriginal;
    }
    return Elm;
  } else {
    delete require.cache[require.resolve(compiledElmPath)];
    return require(compiledElmPath);
  }
}

async function outputString(
  /** @type { { kind: 'page'; data: PageProgress } | { kind: 'api'; data: Object }  } */ fromElm,
  /** @type string */ pathname
) {
  switch (fromElm.kind) {
    case "html": {
      const args = fromElm;
      const normalizedRoute = args.route.replace(/index$/, "");
      await fs.tryMkdir(`./dist/${normalizedRoute}`);
      const template = await fs.readFileSync("./dist/template.html", "utf8");
      fs.writeFileSync(
        `dist/${normalizedRoute}/index.html`,
        renderTemplate(template, fromElm)
      );
      args.contentDatPayload &&
        fs.writeFileSync(
          `dist/${normalizedRoute}/content.dat`,
          Buffer.from(args.contentDatPayload.buffer)
        );
      parentPort.postMessage({ tag: "done" });
      break;
    }
    case "api-response": {
      const body = fromElm.body.body;
      console.log(`Generated ${pathname}`);
      fs.writeFileSyncSafe(path.join("dist", pathname), body);
      if (pathname === "/all-paths.json") {
        parentPort.postMessage({ tag: "all-paths", data: body });
      } else {
        parentPort.postMessage({ tag: "done" });
      }

      break;
    }
  }
}

function renderTemplate(template, renderResult) {
  const info = renderResult.htmlString;
  return template
    .replace(
      /<!--\s*PLACEHOLDER_HEAD_AND_DATA\s*-->/,
      `${info.headTags}
                  <script id="__ELM_PAGES_BYTES_DATA__" type="application/octet-stream">${info.bytesData}</script>`
    )
    .replace(/<!--\s*PLACEHOLDER_TITLE\s*-->/, info.title)
    .replace(/<!--\s*PLACEHOLDER_HTML\s* -->/, info.html)
    .replace(/<!-- ROOT -->\S*<html lang="en">/m, info.rootElement);
}

parentPort.on("message", run);

/** @typedef { { tag : 'PageProgress'; args : Arg[] } } PageProgress */
