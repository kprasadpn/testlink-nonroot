/* eslint-disable global-require */

'use strict';

/**
 * Bitnami database functions.
 * @namespace base-functions.database
 */

module.exports = {
  mysql: require('./mysql'),
  mongodb: require('./mongodb'),
  postgresql: require('./postgresql'),
};
