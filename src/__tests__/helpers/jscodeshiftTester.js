'use strict'

const prettier = require('prettier')

expect.addSnapshotSerializer({
  test: val => typeof val === 'string',
  print: val => val,
})

function format(code) {
  return prettier.format(code, {
    semi: false,
    singleQuote: true,
    trailingComma: 'es5',
  })
}

function runTest({ module, name, input, options = {} }) {
  // Handle ES6 modules using default export for the transform
  const transform = module.default || module

  if (!transform) {
    throw new Error('No transform module supplied')
  }

  // Jest resets the module registry after each test, so we need to always get
  // a fresh copy of jscodeshift on every test run.
  let jscodeshift = require('jscodeshift')
  if (module.parser) {
    jscodeshift = jscodeshift.withParser(module.parser)
  }

  const mockApi = { jscodeshift, stats: () => {} }
  const output = transform({ source: input }, mockApi, options) || ''

  test(name, () => {
    expect(format(input)).toMatchSnapshot('input')
    expect(format(output)).toMatchSnapshot('output')
  })
}

module.exports = function jscodeshiftTester({ module, tests = {} }) {
  describe(module.name, () => {
    Object.entries(tests).forEach(([name, input]) => {
      runTest({ module, name, input })
    })
  })
}
