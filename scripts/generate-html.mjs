// Post-build script: generates dist/client/index.html for Vercel static hosting.
// Finds the correct hashed asset filenames from the build output automatically.
import { readdirSync, writeFileSync } from "fs";
import { join } from "path";

const clientDir = join(process.cwd(), "dist/client/assets");
const files = readdirSync(clientDir);

// The client entry is the index JS that contains hydrateRoot / startClient
const css = files.find((f) => f.endsWith(".css"));
const js = files.find((f) => f.startsWith("index-") && f.endsWith(".js"));

if (!css || !js) {
  console.error("Could not find CSS or JS entry in dist/client/assets");
  process.exit(1);
}

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>HIDE.OS — Tannery ERP</title>
    <meta name="description" content="Production, inventory and ESG control for a Bangladesh tannery." />
    <link rel="stylesheet" href="/assets/${css}" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/assets/${js}"></script>
  </body>
</html>
`;

writeFileSync(join(process.cwd(), "dist/client/index.html"), html);
console.log(`Generated dist/client/index.html (${js}, ${css})`);
