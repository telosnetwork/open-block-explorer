# Project Structure & Notes
├── public/
├── src/
│    ├── assets/ svgs & images
│    ├── boot/  files comprise the entrypoint when compiled (quasar)
│    ├── components/ vue sfcs
│    ├── css/ - sass styles
│    ├── layouts/
│    ├── pages/
│    ├── router/ - route & history management (route module example)
│    ├── store/ - app state management
│    ├── types/ - all types are located here and referenced via this dir
│    ├── App.vue - app mount component
├── test/ - contains jest unit tests (simple demo examples currently)
├── .eslintrc.js - linter settings
├── netlify.toml - env variables for netlify deployment
├── jest.config.js - jest unit testing settings & reporting thresholds
├── quasar.conf.js - quasar settings
├── .tsconfig.json - typescript settings

- This configuration supports development using both Vue 2 (options) and Vue 3 (composition) which will make upgrading/fully migrating easy in the future

- There are very basic examples in store, router, and tests, one or two of the components will be fleshed out to show style and full integration
