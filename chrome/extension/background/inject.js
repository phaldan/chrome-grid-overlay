import * as MessageActions from '../../../app/constants/MessageActions';

function isInjected() {
  return chrome.tabs.executeScriptAsync({
    code: `var injected = window.reactExampleInjected;
      window.reactExampleInjected = true;
      injected;`,
    runAt: 'document_start'
  });
}

function loadScript(name, tabId, cb) {
  if (process.env.NODE_ENV === 'production') {
    chrome.tabs.executeScript(tabId, { file: `/js/${name}.bundle.js`, runAt: 'document_end' }, cb);
  } else {
    // dev: async fetch bundle
    fetch(`http://localhost:3000/js/${name}.bundle.js`)
    .then(res => res.text())
    .then((fetchRes) => {
      // Load redux-devtools-extension inject bundle,
      // because inject script and page is in a different context
      const request = new XMLHttpRequest();
      request.open('GET', 'chrome-extension://lmhkpmbekcpmknklioeibfkpmmfibljd/js/redux-devtools-extension.js');  // sync
      request.send();
      request.onload = () => {
        if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
          chrome.tabs.executeScript(tabId, { code: request.responseText, runAt: 'document_start' });
        }
      };
      chrome.tabs.executeScript(tabId, { code: fetchRes, runAt: 'document_end' }, cb);
    });
  }
}

function initiateConfiguration(tab, storedConfiguration) {
  chrome.tabs.sendMessage(tab.id, {
    action: MessageActions.INITIATE_GRID,
    data: storedConfiguration
  }, (response) => {
    if (!response) {
      setTimeout(() => {
        initiateConfiguration(tab, storedConfiguration);
      }, 100);
    }
  });
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'loading' || tab.url.startsWith('chrome://newtab/') || tab.url.startsWith('chrome-devtools://')) return;

  const result = await isInjected();
  if (chrome.runtime.lastError || result[0]) return;

  loadScript('inject', tab.id, () => {
    chrome.storage.local.get(({ state }) => {
      const url = new URL(tab.url);
      const initialState = (state === undefined) ? { grids: [] } : JSON.parse(state);
      const storedconfiguration = initialState.grids.find(grid => grid.host === url.host);
      if (storedconfiguration) {
        initiateConfiguration(tab, storedconfiguration);
      }
    });
  });
});
