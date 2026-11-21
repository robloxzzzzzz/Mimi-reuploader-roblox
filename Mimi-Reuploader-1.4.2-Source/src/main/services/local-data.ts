'use strict';

const path = require('node:path');
const { constants, copyFileSync, existsSync, writeFileSync } = require('node:fs');

function configureLocalData(app) {
  const current = app.getPath('userData');
  const legacy = path.join(app.getPath('appData'), 'ISpooferMotion');
  const useLegacyFolder = !app.commandLine.hasSwitch('user-data-dir') &&
    !existsSync(path.join(current, 'profile-secrets.json')) &&
    existsSync(path.join(legacy, 'profile-secrets.json'));
  if (useLegacyFolder) app.setPath('userData', legacy);

  const dataDirectory = app.getPath('userData');
  const marker = path.join(dataDirectory, '.mimi-data-migrated');
  if (existsSync(marker)) return;

  let foundLegacyFiles = false;
  let migrationFailed = false;
  for (const kind of ['jobs', 'session']) {
    const oldFile = path.join(dataDirectory, `ispoofer_${kind}.json`);
    const newFile = path.join(dataDirectory, `mimi_${kind}.json`);
    if (!existsSync(oldFile)) continue;
    foundLegacyFiles = true;
    try {
      copyFileSync(oldFile, newFile, constants.COPYFILE_EXCL);
    } catch (error) {
      if (error.code !== 'EEXIST') {
        migrationFailed = true;
        console.warn(`[MIMI DATA] Could not migrate ${kind}: ${error.code}`);
      }
    }
  }
  if (foundLegacyFiles && !migrationFailed) {
    try {
      writeFileSync(marker, '');
    } catch (error) {
      console.warn('[MIMI DATA] Could not mark migration complete:', error.code);
    }
  }
}

module.exports = { configureLocalData };
