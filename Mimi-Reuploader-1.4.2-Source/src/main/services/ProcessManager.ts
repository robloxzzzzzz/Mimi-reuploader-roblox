'use strict';

let isPaused = false;
let isCancelled = false;
let abortController = new AbortController();

const pauseResolvers = new Set();

function pauseReuploader() {
  isPaused = true;
}

function resumeReuploader() {
  isPaused = false;
  for (const resolve of pauseResolvers) resolve();
  pauseResolvers.clear();
}

function cancelReuploader() {
  isCancelled = true;
  abortController.abort(new Error('Operation cancelled'));
  resumeReuploader();
}

function resetRunControls() {
  isCancelled = false;
  abortController = new AbortController();
  resumeReuploader();
}

function checkCancelled() {
  if (isCancelled) throw new Error('Operation cancelled');
}

async function checkPaused() {
  checkCancelled();
  if (!isPaused) return;
  await new Promise((resolve) => pauseResolvers.add(resolve));
  checkCancelled();
}

function getAbortSignal() {
  return abortController.signal;
}

module.exports = {
  pauseReuploader,
  resumeReuploader,
  cancelReuploader,
  resetRunControls,
  checkCancelled,
  checkPaused,
  getAbortSignal,
};
