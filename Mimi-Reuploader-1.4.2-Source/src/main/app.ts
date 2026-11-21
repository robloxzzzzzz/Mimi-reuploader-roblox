const path = require('node:path');
const { configureLocalData } = require('./services/local-data');
const { app } = require('electron');
const { setupAppLifecycle, getMainWindow } = require('./window');
const { registerIpcHandlers } = require('./services/ipc-handlers');
const { DEVELOPER_MODE, initializeFileLogging } = require('./services/common');
const {
  startLocalhostPluginServer,
  stopLocalhostPluginServer,
} = require('./services/localhost-plugin-server');

let latestReplacementText = '';

function getLogsDir() {
  return path.join(app.getPath('userData'), 'mimi_logs');
}

function getLiveWebContents() {
  const win = getMainWindow();
  if (!win || win.isDestroyed() || !win.webContents || win.webContents.isDestroyed()) return null;
  return win.webContents;
}

function sendToRenderer(channel, payload) {
  const webContents = getLiveWebContents();
  if (webContents) {
    webContents.send(channel, payload);
    return true;
  }

  if (DEVELOPER_MODE) {
    console.warn(`[MAIN_PROCESS] Cannot send "${channel}"; renderer is not ready.`);
  }

  return false;
}

function sendTransferUpdate(transferData) {
  return sendToRenderer('transfer-update', transferData);
}

function sendReuploaderResultToRenderer(result) {
  const output = typeof result === 'string' ? result : result?.output;
  if (typeof output === 'string') latestReplacementText = output;
  return sendToRenderer('reuploader-result', result);
}

function sendStatusMessage(message) {
  return sendToRenderer('update-status-message', message);
}

function sendReuploaderLog(logData) {
  return sendToRenderer('reuploader-log', logData);
}

function sendReuploaderProgress(progressData) {
  return sendToRenderer('reuploader-progress', progressData);
}

function sendPluginScanResults(scanData) {
  return sendToRenderer('localhost-scan-results', scanData);
}

function bootstrap() {
  app.name = 'Mimi Reuploader';
  configureLocalData(app);
  if (process.platform === 'win32') {
    app.setAppUserModelId('app.mimi.reuploader');
  }

  process.on('uncaughtException', (error) => {
    console.error('UNCAUGHT EXCEPTION:', error);
    try {
      app.quit();
    } catch {
      process.exit(1);
    }
  });

  initializeFileLogging(getLogsDir());
  registerIpcHandlers(
    getMainWindow,
    sendTransferUpdate,
    sendReuploaderResultToRenderer,
    sendStatusMessage,
    sendReuploaderLog,
    sendReuploaderProgress,
  );
  return setupAppLifecycle().then(() => {
    startLocalhostPluginServer({
      sendScanResults: sendPluginScanResults,
      sendStatusMessage,
      getReplacementText: () => latestReplacementText,
    });
    app.once('before-quit', stopLocalhostPluginServer);
  });
}

bootstrap().catch((error) => {
  console.error('[APP ERROR] Failed to start Mimi Reuploader:', error);
  app.quit();
});
