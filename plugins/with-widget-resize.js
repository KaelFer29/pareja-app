const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

function withWidgetResize(config, { widgets }) {
  return withDangerousMod(config, [
    'android',
    (modConfig) => {
      const xmlFolder = path.join(modConfig.modRequest.platformProjectRoot, 'app/src/main/res/xml');

      for (const [name, sizes] of Object.entries(widgets)) {
        const xmlPath = path.join(xmlFolder, `widgetprovider_${name.toLowerCase()}.xml`);
        if (!fs.existsSync(xmlPath)) {
          throw new Error(`No se encontró el widget ${name} en ${xmlPath}`);
        }

        const attributes = Object.entries(sizes)
          .map(([key, value]) => `    android:${key}="${value}"`)
          .join('\n');
        const xml = fs
          .readFileSync(xmlPath, 'utf8')
          .replace(/\n\s*android:minResize(Width|Height)="[^"]*"/g, '')
          .replace(/(android:minHeight="[^"]*")/, `$1\n${attributes}`);
        fs.writeFileSync(xmlPath, xml);
      }

      return modConfig;
    },
  ]);
}

module.exports = withWidgetResize;
