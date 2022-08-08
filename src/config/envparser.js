// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenv = require('dotenv');
const parsedEnv = dotenv.config().parsed;

module.exports = function () {
  for (let key in parsedEnv) {
    if (typeof parsedEnv[key] !== 'string') {
      parsedEnv[key] = JSON.stringify(parsedEnv[key]);
    }
  }
  return parsedEnv;
};
