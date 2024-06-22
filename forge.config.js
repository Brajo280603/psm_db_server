const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
// import { FusesPlugin } from '@electron-forge/plugin-fuses';
// import { FuseV1Options, FuseVersion } from '@electron/fuses';


// export const packagerConfig = {
 const packagerConfig = {
  asar: true,
  icon: './src/static/wzt_icon.ico'
};
// export const rebuildConfig = {};
 const rebuildConfig = {};
// export const makers = [
 const makers = [
  {
    name: '@electron-forge/maker-squirrel',
    config: {
      icon:'./src/static/wzt_icon.ico',
      setupIcon:'./src/static/wzt_icon.ico',
    },
  },
  {
    name: '@electron-forge/maker-zip',
    // platforms: ['darwin'],
  },
  {
    name: '@electron-forge/maker-deb',
    config: {},
  },
  {
    name: '@electron-forge/maker-rpm',
    config: {},
  },

];
// export const plugins = [
 const plugins = [
  {
    name: '@electron-forge/plugin-auto-unpack-natives',
    config: {},
  },
  // Fuses are used to enable/disable various Electron functionality
  // at package time, before code signing the application
  new FusesPlugin({
    version: FuseVersion.V1,
    [FuseV1Options.RunAsNode]: false,
    [FuseV1Options.EnableCookieEncryption]: true,
    [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
    [FuseV1Options.EnableNodeCliInspectArguments]: false,
    [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
    [FuseV1Options.OnlyLoadAppFromAsar]: true,
  }),
];

module.exports = {
  packagerConfig,rebuildConfig,makers,plugins
}
