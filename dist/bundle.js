'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var mz_fs = require('mz/fs');
var rollup = require('rollup');
var nodeResolve = _interopDefault(require('rollup-plugin-node-resolve'));
var commonjs = _interopDefault(require('rollup-plugin-commonjs'));
var babel = _interopDefault(require('rollup-plugin-babel'));
var path = require('path');

function rollit(source, options){

    options = options || {};
    options.deepRequire || false;
    options.showWarning || false;
    options.wrap || false;
    options.sourceMap || false;

    const babelSettings = getBabelSettings();

    let plugins = [
        {
            resolveId: function (importee, importer) {

                if(importer && /^\//.test(importee)){
                    return importee;
                }
                return null;
            }
        }
    ];

    if(options.deepRequire){
        plugins = plugins.concat([
            nodeResolve({
                jsnext: true,
                main: true,
                module: true
            }),
            commonjs()
        ]);
    }


    plugins.push(babel(babelSettings));

    return rollup.rollup({
        entry: source,
        plugins: plugins,
        acorn: {
            allowHashBang: true
        },
        onwarn: (warning)=>{
            //No need for warnings.
            //Try to act like a normal child process.
            //Otherwise show warnings for debug.
            if(options.showWarning){
                console.warn(warning);
            }
        }
    }).then(bundle=>{

        let settings = {
            format: 'cjs',
            //Source maps are enabled
            //though I don't know what for?
            sourceMap: options.sourceMap
        };

        //Maybe the code should produce a module.
        //To use a module:
        //import vm from 'vm';
        //import compile from 'compile_es_for_node';
        //compile(isCodeString, {module: true})
        //.then(result=>{
        //    //Using some vm method
        //    //Return an iife
        //    vm.runInThisContext(result.code)
        //    (exports, require, module, __filename, __dirname);
        //});
        if(options.wrap){
            if(Object.prototype.toString.call(options.wrap) === '[object Array]'){
                settings.banner = `(function (${options.wrap.join(', ')}){ `;
            }else if(typeof options.wrap === 'boolean'){
                settings.banner = `(function (exports, require, module, __filename, __dirname) { `;
            }

            settings.footer = '\n});';
        }

        let gen = bundle.generate(settings);


        /*TODO
        Fix source map support.
        Right now source maps don't work inside vm*/

        let code = gen.code;


        let bangReg = /\n#[!][^\n]+?\n/;

        //Get rid of that pesky hash bang.
        if(bangReg.test(code)){
            code = code.replace(bangReg, '\n\n');
        }

        if(options.sourceMaps){
            code += ['\n/', '/# sourceMappingURL=', gen.map.toUrl(), '\n'].join('');
        }

        //\n
        return {
            code: code,
            map: gen.map
        };

    });

}

function getBabelSettings(){

    return {
        presets: [
            ["env", {
                "targets": {
                    "node": "current"
                },
                modules: false
            }]
        ],
        sourceMaps: true
    };
}

module.exports = rollit;
