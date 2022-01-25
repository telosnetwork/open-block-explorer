import dotenv from 'dotenv';
const parsedEnv = dotenv.config().parsed;

module.exports = function () {
  for (let key in parsedEnv) {
    if (typeof parsedEnv[key] === 'string') {
      parsedEnv[key] = JSON.stringify(parsedEnv[key]);
    }
  }
  return parsedEnv;
};
