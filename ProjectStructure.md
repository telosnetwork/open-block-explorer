# Project Structure & Notes

├── public/<br>
├── src/<br>
&emsp;&emsp;├── api/ - third party and chain api methods<br>
&emsp;&emsp;├── assets/ - svgs & images<br>
&emsp;&emsp;├── boot/ - global property files comprise the entrypoint when compiled (quasar)<br>
&emsp;&emsp;├── components/ - vue sfcs<br>
&emsp;&emsp;├── config/ - network configuration files <br>
&emsp;&emsp;&emsp;&emsp;&emsp;├── chains/ - network specific settings <br>
&emsp;&emsp;├── css/ - sass styles<br>
&emsp;&emsp;├── layouts/<br>
&emsp;&emsp;├── pages/<br>
&emsp;&emsp;├── router/ - route & history management<br>
&emsp;&emsp;├── store/ - app state management<br>
&emsp;&emsp;├── types/ - typescript types<br>
&emsp;&emsp;├── utils/ - shared methods<br>
&emsp;&emsp;├── App.vue - app mount component<br>
├── test/ - contains jest unit tests<br>
├── .env.example - set default network and enable network sidebar<br>
├── .eslintrc.js - linter settings<br>
├── netlify.toml - env variables for netlify deployment<br>
├── jest.config.js - jest unit testing settings & reporting thresholds<br>
├── ProjectStructure.md - this file<br>
├── quasar.conf.js - quasar settings<br>
├── .tsconfig.json - typescript settings<br>
