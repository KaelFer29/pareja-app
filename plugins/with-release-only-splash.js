const { withMainActivity } = require('expo/config-plugins');

const REGISTER_CALL = 'SplashScreenManager.registerOnActivity(this)';
const RELEASE_ONLY_CALL = `if (BuildConfig.DEBUG) setTheme(R.style.AppTheme) else ${REGISTER_CALL}`;

function withReleaseOnlySplash(config) {
  return withMainActivity(config, (modConfig) => {
    const { contents } = modConfig.modResults;
    if (contents.includes(RELEASE_ONLY_CALL)) {
      return modConfig;
    }
    if (!contents.includes(REGISTER_CALL)) {
      throw new Error(
        `No se encontró ${REGISTER_CALL} en MainActivity. Revisa si cambió expo-splash-screen y actualiza este plugin.`,
      );
    }
    modConfig.modResults.contents = contents.replace(REGISTER_CALL, RELEASE_ONLY_CALL);
    return modConfig;
  });
}

module.exports = withReleaseOnlySplash;
