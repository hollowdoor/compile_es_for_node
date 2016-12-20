"use strict";
const compile = require('../');
const vm = require('vm');
compile('script.js', {wrap: true})
.then(result=>{
    //console.log(result.code)
    vm.runInNewContext(result.code, {
        console: console
    })(exports, require, module, __filename, __dirname);
})
.catch(err=>{
    console.log(err)
});
