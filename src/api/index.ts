/**
 * Add another endpoint resource:
 *  - add a unique file in src/api/
 *  - for new method,  export and import here, add to api export
 *  - for existing method enpoint, export from service file and update the import statement here
 */
import { getAccount } from './hyperion'; //  e.g. './new-service' method name stays the same

export const api = {
  getAccount
};
