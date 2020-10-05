# perenv.macro.js

A Babel macro to conditionally import something based on environmental variables.

## Why is this a macro?

This prevents the `import` from ever being part of the application code if the environmental variable is not set at build time.

Perfect for environmental specific configuration that has side effects.

This prevents things like mocks, development settings, whatever... from ever getting into built application code.

This was specifically created for msw but has a lot of other applications.

## Installation

```
npm install --save-dev perenv.macro
```

or

```
yarn add --dev perenv.macro
``` 

## Usage

Once you've
[configured `babel-plugin-macros`](https://github.com/kentcdodds/babel-plugin-macros/blob/master/other/docs/user.md)
you can import `perenv.macro`.


### `loadPerEnv`


#### String Signature

```javascript
loadPerEnv(path, envar, ?value)
```
|Argument | Description|
|----|----|
|path | Node resolveable path to import (relative path or package name)|
|envar| The environmental variable to inspect |
|value (optional) | Conditionally load the import if the envar is equal to this value |

#### Object Signature

```javascript
loadPerEnv({path, identifier}, envar, ?value)
```
|Argument | Description|
|----|----|
|path | Node resolveable path to import (relative path or package name)|
|identifier | Identifier to use if imported (You probably want to use `loadPerEnvMap` instead of this) |
|envar| The environmental variable to inspect |
|value (optional) | Conditionally load the import if the envar is equal to this value |

#### Usage

If the environmental variable `ENABLE_MY_CONFIGURATION` is set `loadPerEnv` will transpile like this

```javascript
// export ENABLE_MY_CONFIGURATION=1

import { loadPerEnv } from "perEnv.macro";
loadPerEnv('./a_configuration_file.js', 'ENABLE_MY_CONFIGURATION');

      ↓ ↓ ↓ ↓ ↓ ↓

import "./a_configuration_file.js";
```

if it is not set it will transpile like this

```javascript
// unset ENABLE_MY_CONFIGURATION

import { loadPerEnv } from "perEnv.macro";
loadPerEnv('./a_configuration_file.js', 'ENABLE_MY_CONFIGURATION');

      ↓ ↓ ↓ ↓ ↓ ↓

// Intentionally blank
```

You can also conditionally load something based on the value of the environmental variable.


```javascript
// export NODE_ENV=dev
import { loadPerEnv } from "perEnv.macro";
loadPerEnv('./config_dev.js', 'NODE_ENV', "dev");
loadPerEnv('./config_prod.js', 'NODE_ENV', "production");

      ↓ ↓ ↓ ↓ ↓ ↓

import "./config_dev.js";
```

If you want to use the exports of a file, you can use an object as the first argument

```javascript
// export NODE_ENV=dev

import { loadPerEnv } from "perEnv.macro";
loadPerEnv({path: './feature.js', identifier: 'feature'}, 'NODE_ENV', "dev");

      ↓ ↓ ↓ ↓ ↓ ↓

import * as feature from "./feature.js";
```

### `loadPerEnvMap`


#### Signature

```javascript
loadPerEnvMap(map, envar, ?nullable = false)
```
|Argument | Description|
|----|----|
|map | A key-value map representing what is to be imported based on the value of the envar|
|envar| The environmental variable to inspect |
|nullable (optional) | It is safe to return null if value is not found in map |


#### Usage


Allows you to use a map of different imports based on the value of your envars

```javascript
// export NODE_ENV=production

import { loadPerEnvMap } from "perEnv.macro";
loadPerEnvMap({dev: './new_feature.js', production: './feature.js'}, 'NODE_ENV');

      ↓ ↓ ↓ ↓ ↓ ↓

import "./feature.js";
```

Use an assignment to declare the import namespace, handy to keep linters quiet

```javascript
// export NODE_ENV=production

import { loadPerEnvMap } from "perEnv.macro";
const feature = loadPerEnvMap({dev: './new_feature.js', production: './feature.js'}, 'NODE_ENV');

      ↓ ↓ ↓ ↓ ↓ ↓

import * as feature from "./feature.js";
```

Enable the `nullable` flag to allow for cases where the envar value may not be in the map.


```javascript

// export NODE_ENV=CI
// or
// unset NODE_ENV

import { loadPerEnvMap } from "perEnv.macro";
const feature = loadPerEnvMap({dev: './new_feature.js', production: './feature.js'}, 'NODE_ENV', true);

      ↓ ↓ ↓ ↓ ↓ ↓

const feature = null
```

Or in the case that no assignment is made

```javascript

// export NODE_ENV=CI
// or
// unset NODE_ENV

import { loadPerEnvMap } from "perEnv.macro";
loadPerEnvMap({dev: './new_feature.js', production: './feature.js'}, 'NODE_ENV', true);

      ↓ ↓ ↓ ↓ ↓ ↓

// Intentionally blank
```

## Use Cases

### Enable `msw` in testing environments without adding it to source at build time
```javascript
// index.js
import { loadPerEnv } from "perEnv.macro";
loadPerEnv('mocks.js', 'ENABLE_MOCKS');
```

### Mock window objects that will be available in a deployment environment, but not as part of a micro-frontend project

```javascript
// index.js
import { loadPerEnv } from "perEnv.macro";
loadPerEnv('mocks.js', 'ISOLATED_MICROFRONTEND');

// mocks.js

window.globalStore = {
    // a mock implementation
}

```

### Prevent polyfills during development

```javascript
// index.js
import { loadPerEnv } from "perEnv.macro";
loadPerEnv('polyfills.js', 'NODE_ENV', 'production');
```


### Feature flags at build time

```javascript
// index.js
import { loadPerEnv } from "perEnv.macro";
loadPerEnv({path: 'new_feature.js', identifier: 'feature'}, 'FEATURE_FLAG_X', 'enabled');
loadPerEnv({path: 'old_feature.js', identifier: 'feature'}, 'FEATURE_FLAG_X', 'disabled');
```


## Special thanks

* [import-all.macro](https://github.com/kentcdodds/import-all.macro) as a template for this readme and demonstation of the import pattern.
* [ms.macro](https://github.com/knpwrs/ms.macro) for the transpile testing function.
* [Babel Types documentation](https://babeljs.io/docs/en/babel-types) because this would be impossible without it.
