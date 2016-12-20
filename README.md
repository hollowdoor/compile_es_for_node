compile-es-for-node
=======

Install
-------

`npm install --save compile-es-for-node`

Usage
-----

```javascript
"use strict";
const compile = require('../');
const vm = require('vm');

//script.js is some script in the current working directory.
compile('script.js', {
    //Set should this create an iife to pass globals into?
    //(default false)
    //These are iife parameters.
    wrap: ['exports', 'require', 'module', '__filename', '__dirname'] /*This is the same as wrap:true*/,
    //Show rollup warnings? (default false)
    showWarning: false,
    //Should the compiler seek deep into modules?
    //If set true then any modules that can be will be compiled.
    //(default false)
    deepRequire: false
})
.then(result=>{
    /*
    result = {code, map}
    result.map = sourceMaps
    */
    vm.runInNewContext(result.code, {
        console: console
    })(exports, require, module, __filename, __dirname);
})
.catch(err=>{
    console.log(err)
});

```

Results
-------

results have a `code` property, and a `map` property.

`code` is the compiled code.

The `map` property contains the source maps.

Like rollup use `results.map` like so:

```javascript
 map.toString() // – shorthand for JSON.stringify( map )
 map.toUrl() // – generates a data URI, suitable for appending to a file
```

About
-----

This module supports the common usage of the rollup module.

Any es2015 modules are compiled, and es2015 syntax (and into the future) is as compiled using babel.

See the [babel-preset-env](https://github.com/babel/babel-preset-env) to see what what babel is doing to your code.

Source maps don't do anything yet, but they are there for the future.
