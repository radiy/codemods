module.exports = function requireJsToCommonJs(file, api) {
  const j = api.jscodeshift

  function toModuleExportsExpression(right) {
    const left = j.memberExpression(
      j.identifier('module'),
      j.identifier('exports')
    )
    const operator = '='
    return j.expressionStatement(j.assignmentExpression(operator, left, right))
  }

  function requireStatement(value) {
    return j.callExpression(j.identifier('require'), [j.literal(value)])
  }

  function exportizeFunctionBody(body = []) {
    return body.map(node => {
      return node.type === 'ReturnStatement'
        ? toModuleExportsExpression(node.argument)
        : node
    })
  }

  function commonJsRequire({ variableName, modulePath }) {
    return j.variableDeclaration('var', [
      j.variableDeclarator(
        j.identifier(variableName),
        requireStatement(modulePath)
      ),
    ])
  }

  function isFunctionExpression(node) {
    return (
      node.type === 'FunctionExpression' ||
      node.type === 'ArrowFunctionExpression'
    )
  }

  return j(file.source)
    .find(j.CallExpression)
    .filter(({ node }) => node.callee.name === 'define')
    .at(0)
    .forEach(path => {
      // TODO find a better way to detect global define() functions
      const isDefineAtGlobalScope = path.parent.parent.node.type === 'Program'
      if (!isDefineAtGlobalScope) {
        return
      }

      const defineArguments = path.node.arguments
      if (defineArguments.length === 1) {
        const arg = defineArguments[0]
        if (arg.type === 'FunctionExpression') {
          j(path).replaceWith(j.program(exportizeFunctionBody(arg.body.body)))
        }
        if (arg.type === 'ObjectExpression') {
          j(path).replaceWith(j.program([toModuleExportsExpression(arg)]))
        }
      } else if (defineArguments.length === 2) {
        const [first, second] = defineArguments
        if (first.type !== 'ArrayExpression' && !isFunctionExpression(second)) {
          return
        }

        const requireNames = first.elements.map(element => element.value)
        const variableNames = second.params.map(param => param.name)

        const requireStatements = variableNames.map((name, i) => {
          return commonJsRequire({
            variableName: name,
            modulePath: requireNames[i],
          })
        })

        j(path).replaceWith(
          j.program([
            ...requireStatements,
            ...exportizeFunctionBody(second.body.body),
          ])
        )
      }
    })
    .toSource()
}
