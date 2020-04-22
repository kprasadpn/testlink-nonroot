'use strict';

const semver = require('semver');

$app.helpers.setupDatabase = function(databaseHandler) {
  const schemaFile = $file.join(
    $app.installdir,
    '/install/sql/mysql/testlink_create_tables.sql'
  );
  const dataSqlFile = $file.join(
    $app.installdir,
    '/install/sql/mysql/testlink_create_default_data.sql'
  );
  const functionSqlFile = $file.join(
    $app.installdir,
    '/install/sql/mysql/testlink_create_udf0.sql'
  );

  databaseHandler.database(databaseHandler.connection.name).executeFile(schemaFile);
  const app = $app;
  $file.substitute(
    dataSqlFile,
    '\'admin\',MD5(\'admin\'), 8,\'\', \'Testlink\',\'Administrator\', \'en_GB\'',
    `'${app.username}',MD5('${app.password}'), 8,'${app.email}', '${app.username}','Administrator', '${app.language}'`,
    {abortOnUnmatch: true}
  );
  $file.substitute(
    dataSqlFile,
    'MD5(\'admin\')',
    `MD5('${app.password}')`,
    {abortOnUnmatch: true}
  );
  databaseHandler.database(databaseHandler.connection.name).executeFile(dataSqlFile);
  databaseHandler.database(databaseHandler.connection.name).executeFile(functionSqlFile);
  databaseHandler.database(databaseHandler.connection.name).set('users', 'locale', $app.language, {where: {id: '1'}});
};

$app.helpers.getDBVersion = function(databaseHandler) {
  return databaseHandler.database(databaseHandler.connection.name).get('db_version', 'version')
    .toString()
    .replace(/^DB\s+/, '');
};

$app.helpers.getMigrationSqlFiles = function(dbVersion) {
  const baseMigrationDir = $file.join($app.installdir, 'install/sql/alter_tables');
  const migrationDirs = $file.glob('*', {cwd: baseMigrationDir});

  const applicableDirs = migrationDirs.filter(function(v) {
    if (!semver.coerce(v)) {
      return false;
    }
    return semver.gt(semver.coerce(v), semver.coerce(dbVersion));
  });
  const sortedApplicableDirs = semver.sort(applicableDirs);

  let sqlFiles = [];
  sortedApplicableDirs.forEach((d) => {
    sqlFiles = sqlFiles.concat($file.glob($file.join(baseMigrationDir, d, 'mysql', `DB.${d}`, '*', '*.sql'),
      {exclude: ['**/.*']}));
  });
  return sqlFiles;
};

$app.helpers.upgradeDatabase = function(databaseHandler) {
  const dbVersion = semver.coerce($app.helpers.getDBVersion(databaseHandler));
  const appVersion = semver.coerce($app.version);

  if (semver.gt(appVersion, dbVersion)) {
    $app.info('New TestLink version detected');
    if (appVersion.major === dbVersion.major && appVersion.minor === dbVersion.minor) {
      $app.info('Patch version detected, starting upgrade process...');

      const sqlFiles = $app.helpers.getMigrationSqlFiles(dbVersion);

      sqlFiles.forEach((sqlFile) => {
        $app.debug(`Executing "${sqlFile}"...`);
        databaseHandler.database(databaseHandler.connection.name).execute($file.read(sqlFile));
      });
    } else {
      $app.info('Major versions upgrade detected. Please upgrade the application manually');
    }
  }
};
