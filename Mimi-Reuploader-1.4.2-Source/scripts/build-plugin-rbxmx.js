'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'dist');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const version = String(process.argv[2] || pkg.version || '0.0.0');
if (!/^\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/i.test(version)) {
  throw new Error(`Invalid plugin version: ${version}`);
}
const outPath = path.join(outDir, `Mimi-Reuploader-Studio-${version}.rbxmx`);

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function guid(name) {
  return `RBX_${name.replace(/[^A-Za-z0-9_]/g, '_')}`;
}

function propString(name, value) {
  return `<string name="${name}">${escapeXml(value)}</string>`;
}

function propBool(name, value) {
  return `<bool name="${name}">${value ? 'true' : 'false'}</bool>`;
}

function sourceProp(value) {
  return `<ProtectedString name="Source">${escapeXml(value)}</ProtectedString>`;
}

function item(className, ref, props, children = '') {
  return `
  <Item class="${className}" referent="${guid(ref)}">
    <Properties>
      ${props.join('\n      ')}
    </Properties>
    ${children}
  </Item>`;
}

function scriptItem(className, ref, name, source, disabled = false) {
  return item(className, ref, [
    propBool('Disabled', disabled),
    '<Content name="LinkedSource"><null></null></Content>',
    propString('Name', name),
    sourceProp(source),
  ]);
}

fs.mkdirSync(outDir, { recursive: true });

const pluginSource = fs
  .readFileSync(path.join(root, 'src', 'plugin', 'plugin.lua'), 'utf8')
  .replace(/__MIMI_REUPLOADER_VERSION__/g, version);

const mainScript = scriptItem(
  'Script',
  'MimiReuploaderPlugin',
  'Mimi Reuploader',
  pluginSource,
  false,
);

const xml = `<?xml version="1.0" encoding="utf-8"?>
<roblox version="4">
  <External>null</External>
  <External>nil</External>
  <Item class="Folder" referent="${guid('Root')}">
    <Properties>
      ${propString('Name', 'Mimi Reuploader')}
    </Properties>
    ${mainScript}
  </Item>
</roblox>
`;

fs.writeFileSync(outPath, xml, 'utf8');
fs.copyFileSync(outPath, path.join(root, 'src', 'assets', 'Mimi-Reuploader-Studio.rbxmx'));
console.log(`Built Roblox Studio plugin: ${outPath}`);
