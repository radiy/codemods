import { jscodeshiftTester } from './helpers'
import requireJsToCommonJs from '../requirejs-to-commonjs'

jscodeshiftTester({
  module: requireJsToCommonJs,
  tests: {
    'ignores code without define()': 'var a; var b; document.hasFocus();',
    'replaces define with module.exports': `
    define(function(require) {
      var a = require('a')
      var b = require('b')
    
      return b.doSomethingWith(a)
    })`,
    'replaces object with module.exports': `
    define({
      a: 1,
      b: 2,
      c: 3,
    })
    `,
    'ignores define with no arguments': `define()`,
    'ignores non-global define': `
    function something() {
      return define({ a: 1 })
    }
    `,
    'handles define with two arguments': `
    define(['jQuery', 'backbone', 'underscore'], function($, Backbone, _) {
      var CONSTANT = 'a'

      function somefn() {}

      return Backbone.View.extend({})
    })
    `,
    'handles arrow function callback': `
    define(['jQuery', 'backbone', 'underscore'], ($, Backbone, _) => {
      var CONSTANT = 'a'

      function somefn() {}

      return Backbone.View.extend({})
    })
    `,
  },
})
