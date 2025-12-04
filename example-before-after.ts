// BEFORE (CommonJS)
const inquirer = require('inquirer');
const { buildConfig } = require('./config');
const utils = require('./utils/helpers');

module.exports = {
  build: () => {
    // ...
  }
};

// AFTER (ESM)
import inquirer from 'inquirer';
import { buildConfig } from './config.js';
import utils from './utils/helpers.js';

export const build = () => {
  // ...
};

// Or for default export:
export default {
  build: () => {
    // ...
  }
};
