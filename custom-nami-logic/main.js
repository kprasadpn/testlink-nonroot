'use strict';

const handlerSelector = require('./lib/handlers/selector');
const volumeFunctions = require('./lib/volume')($app);
const componentFunctions = require('./lib/component')($app);

const php = $modules['com.bitnami.php'];

$app.postInstallation = function() {
  const webserverHandler = handlerSelector.getHandler('webServer', 'apache', {cwd: $app.installdir});
  webserverHandler.setInstallingPage();
  webserverHandler.start();

  $app.debug('Preparing apache environment...');
  webserverHandler.addAppVhost($app.name, {
    type: 'php',
    httpPort: $app.httpPort,
    httpsPort: $app.httpsPort,
  });

  const databaseHandler = handlerSelector.getHandler('database', {
    variation: 'mariadb',
    name: $app.databaseName,
    user: $app.databaseUser,
    password: $app.databasePassword,
    host: $app.databaseServerHost,
    port: $app.databaseServerPort,
  }, {cwd: $app.installdir});
  databaseHandler.checkConnection();

  $app.info('Preparing PHP environment...');
  php.configure({
    memory_limit: $app.phpMemoryLimit,
  });

  if (!volumeFunctions.isInitialized($app.persistDir)) {
    $app.debug('Installing Testlink...');
    $hb.renderToFile('config_db.inc.php.tpl', 'config_db.inc.php', {
      type: 'mysql',
      host: `${databaseHandler.connection.host}:${databaseHandler.connection.port}`,
      password: databaseHandler.connection.password,
      user: databaseHandler.connection.user,
      name: databaseHandler.connection.name,
    });
    $hb.renderToFile('custom_config.inc.php.tpl', 'custom_config.inc.php');
    $file.substitute(
      'config.inc.php',
      'define(\'TL_ABS_PATH\', dirname(__FILE__)',
      `define('TL_ABS_PATH', "${$app.installdir}"`,
      {abortOnUnmatch: true}
    );
    $app.helpers.setupDatabase(databaseHandler);
    volumeFunctions.prepareDataToPersist($app.dataToPersist);
  } else {
    volumeFunctions.restorePersistedData($app.dataToPersist);
  }
  $app.helpers.upgradeDatabase(databaseHandler);
  //testlink if ($app.version === $app.helpers.getDBVersion(databaseHandler)) {
    // T26483 - Move the install dir just in case the user needs to use it for the upgrading procedures
    //testlink $app.debug('Move install subdir to new location');
    //testlink $file.move('install', '../testlink_install');
  //testlink }

  //testlink componentFunctions.configurePermissions(['upload_area', 'logs', 'gui/templates_c/'], {
    //testlink user: webserverHandler.user,
    //testlink group: webserverHandler.group,
  //testlink });
  webserverHandler.removeInstallingPage();
  webserverHandler.stop();

  componentFunctions.printProperties({
    'Username': $app.username,
    'Password': $app.password,
    'Admin email': $app.email,
    'Language': $app.language,
  });
};
