const fs = require('fs');
const path = require('path');

// 1. Patch watchpack
const watchpackFile = path.resolve(__dirname, '../node_modules/next/dist/compiled/watchpack/watchpack.js');
if (fs.existsSync(watchpackFile)) {
  let content = fs.readFileSync(watchpackFile, 'utf8');
  const target = 'new Set(["EINVAL","ENOENT"])';
  const replacement = 'new Set(["EINVAL","ENOENT","EISDIR","ENOTDIR"])';
  if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(watchpackFile, content, 'utf8');
    console.log('[1/3] Successfully patched watchpack.js for Windows EISDIR');
  } else if (content.includes(replacement)) {
    console.log('[1/3] watchpack.js is already patched.');
  }
}

// 2. Patch @vercel/nft
const nftFile = path.resolve(__dirname, '../node_modules/next/dist/compiled/@vercel/nft/index.js');
if (fs.existsSync(nftFile)) {
  let content = fs.readFileSync(nftFile, 'utf8');
  const target = 'if(e.code!=="EINVAL"&&e.code!=="ENOENT"&&e.code!=="UNKNOWN")throw e;return null';
  const replacement = 'if(e.code!=="EINVAL"&&e.code!=="ENOENT"&&e.code!=="UNKNOWN"&&e.code!=="EISDIR"&&e.code!=="ENOTDIR")throw e;return null';
  let patched = false;
  if (content.includes(target)) {
    content = content.replace(target, replacement);
    patched = true;
  }
  const target2 = 'if(e==="EINVAL"||e==="UNKNOWN"){t&=L}';
  const replacement2 = 'if(e==="EINVAL"||e==="UNKNOWN"||e==="EISDIR"){t&=L}';
  if (content.includes(target2)) {
    content = content.replace(target2, replacement2);
    patched = true;
  }
  if (patched) {
    fs.writeFileSync(nftFile, content, 'utf8');
    console.log('[2/3] Successfully patched @vercel/nft for Windows EISDIR');
  } else {
    console.log('[2/3] @vercel/nft is already patched or target not matched.');
  }
}

// 3. Patch flight-client-entry-plugin
const flightFile = path.resolve(__dirname, '../node_modules/next/dist/build/webpack/plugins/flight-client-entry-plugin.js');
if (fs.existsSync(flightFile)) {
  let content = fs.readFileSync(flightFile, 'utf8');
  const original = "const modId = pluginState.serverActionModules[name][layer[name] === _constants.WEBPACK_LAYERS.actionBrowser ? 'client' : 'server'];";
  const safe = "const modId = pluginState.serverActionModules[name]?.[layer[name] === _constants.WEBPACK_LAYERS.actionBrowser ? 'client' : 'server'];";
  const originalEdge = "const modId = pluginState.edgeServerActionModules[name][layer[name] === _constants.WEBPACK_LAYERS.actionBrowser ? 'client' : 'server'];";
  const safeEdge = "const modId = pluginState.edgeServerActionModules[name]?.[layer[name] === _constants.WEBPACK_LAYERS.actionBrowser ? 'client' : 'server'];";
  
  let flightPatched = false;
  if (content.includes(original)) {
    content = content.replace(original, safe);
    flightPatched = true;
  }
  if (content.includes(originalEdge)) {
    content = content.replace(originalEdge, safeEdge);
    flightPatched = true;
  }
  if (flightPatched) {
    fs.writeFileSync(flightFile, content, 'utf8');
    console.log('[3/3] Successfully patched flight-client-entry-plugin.js for safe serverActionModules');
  } else {
    console.log('[3/3] flight-client-entry-plugin.js is already patched.');
  }
}

// 4. Patch build/index.js for Windows mkdir EPERM
const buildIndexFile = path.resolve(__dirname, '../node_modules/next/dist/build/index.js');
if (fs.existsSync(buildIndexFile)) {
  let content = fs.readFileSync(buildIndexFile, 'utf8');
  const target = `await (0, _promises.mkdir)(_path.default.dirname(routeTypesFilePath), {
                    recursive: true
                });`;
  const replacement = `try {
                  await (0, _promises.mkdir)(_path.default.dirname(routeTypesFilePath), {
                    recursive: true
                  });
                } catch(e) {
                  if (e.code !== 'EPERM' && e.code !== 'EEXIST') throw e;
                }`;
  if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(buildIndexFile, content, 'utf8');
    console.log('[4/4] Successfully patched build/index.js for mkdir EPERM');
  } else {
    console.log('[4/4] build/index.js already patched or target not found.');
  }
}

// 5. Patch bundle5.js for Windows clean output handleError
const bundle5File = path.resolve(__dirname, '../node_modules/next/dist/compiled/webpack/bundle5.js');
if (fs.existsSync(bundle5File)) {
  let content = fs.readFileSync(bundle5File, 'utf8');
  const target = 'handleError=v=>{if(v.code==="ENOENT"){log(`${q} was removed during cleaning by something else`);handleParent();return xe()}return xe(v)};';
  const replacement = 'handleError=v=>{if(v.code==="ENOENT"||v.code==="EPERM"||v.code==="EACCES"){log(`${q} was removed during cleaning by something else`);handleParent();return xe()}return xe(v)};';
  if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(bundle5File, content, 'utf8');
    console.log('[5/5] Successfully patched bundle5.js for Windows clean output handleError');
  } else {
    console.log('[5/5] bundle5.js already patched or target not found.');
  }
}
