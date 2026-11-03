// Native WeChat Mini Game entry. No browser adapter or webview is required.
const createSurvivor = require('./js/survivor/engine');
GameGlobal.survivor = createSurvivor(wx);
