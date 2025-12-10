'use strict'
exports.__esModule = true
exports.migrate = void 0
// import { normalize, strings } from '@angular-devkit/core'
// import { updateWorkspace } from '@schematics/angular/utility/workspace'
var ts = require('typescript')
function updateFileContent(filePath, content) {
  var sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
  )
  var updatedContent = content
  var printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })
  var visitor = function (node, context) {
    var _a, _b
    if (
      ts.isExportAssignment(node) &&
      ts.isAsExpression(node.expression) &&
      ts.isObjectLiteralExpression(node.expression.expression)
    ) {
      var metaObject = node.expression.expression
      var componentProperty = metaObject.properties.find(function (prop) {
        return (
          ts.isPropertyAssignment(prop) &&
          ts.isIdentifier(prop.name) &&
          prop.name.text === 'component'
        )
      })
      if (componentProperty && ts.isPropertyAssignment(componentProperty)) {
        var componentType = componentProperty.initializer.getText()
        var metaNode = ts.factory.createVariableStatement(
          undefined,
          ts.factory.createVariableDeclarationList(
            [
              ts.factory.createVariableDeclaration(
                'meta',
                undefined,
                ts.factory.createTypeReferenceNode('Meta', [
                  ts.factory.createTypeReferenceNode(
                    componentType.replace(/^['"]|['"]$/g, ''),
                  ),
                ]),
                metaObject,
              ),
            ],
            ts.NodeFlags.Const,
          ),
        )
        var exportNode = ts.factory.createExportDefault(
          ts.factory.createIdentifier('meta'),
        )
        var storyTypeNode = ts.factory.createVariableStatement(
          [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
          ts.factory.createVariableDeclarationList(
            [
              ts.factory.createVariableDeclaration(
                'Story',
                undefined,
                ts.factory.createTypeReferenceNode('StoryObj', [
                  ts.factory.createTypeReferenceNode(
                    componentType.replace(/^['"]|['"]$/g, ''),
                  ),
                ]),
                undefined,
              ),
            ],
            ts.NodeFlags.Const,
          ),
        )
        var metaOutput = printer.printNode(
          ts.EmitHint.Unspecified,
          metaNode,
          sourceFile,
        )
        var storyTypeOutput = printer.printNode(
          ts.EmitHint.Unspecified,
          storyTypeNode,
          sourceFile,
        )
        var exportOutput = printer.printNode(
          ts.EmitHint.Unspecified,
          exportNode,
          sourceFile,
        )
        // Preserve existing empty lines before and after the replaced section
        var leadingWhitespace =
          ((_a = node.getFullText(sourceFile).match(/^\s*/)) === null ||
          _a === void 0
            ? void 0
            : _a[0]) || ''
        var trailingWhitespace =
          ((_b = node.getFullText(sourceFile).match(/\s*$/)) === null ||
          _b === void 0
            ? void 0
            : _b[0]) || ''
        updatedContent = content.replace(
          node.getFullText(sourceFile),
          ''
            .concat(leadingWhitespace)
            .concat(metaOutput, '\n\n')
            .concat(exportOutput, '\n')
            .concat(storyTypeOutput)
            .concat(trailingWhitespace),
        )
      }
    }
    return ts.visitEachChild(
      node,
      function (child) {
        return visitor(child, context)
      },
      context,
    )
  }
  var transformResult = ts.transform(sourceFile, [
    function (context) {
      return function (root) {
        return ts.visitNode(root, function (node) {
          return visitor(node, context)
        })
      }
    },
  ])
  transformResult.dispose()
  return updatedContent
}
function AddStoryObjImport(filePath, content) {
  var sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
  )
  var updatedContent = content
  var printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })
  var visitor = function (node, context) {
    var _a, _b
    if (
      ts.isImportClause(node) &&
      ts.isAsExpression(node.expression) &&
      ts.isObjectLiteralExpression(node.expression.expression)
    ) {
      var metaObject = node.expression.expression
      var componentProperty = metaObject.properties.find(function (prop) {
        return (
          ts.isPropertyAssignment(prop) &&
          ts.isIdentifier(prop.name) &&
          prop.name.text === 'component'
        )
      })
      if (componentProperty && ts.isPropertyAssignment(componentProperty)) {
        var componentType = componentProperty.initializer.getText()
        var metaNode = ts.factory.createVariableStatement(
          undefined,
          ts.factory.createVariableDeclarationList(
            [
              ts.factory.createVariableDeclaration(
                'meta',
                undefined,
                ts.factory.createTypeReferenceNode('Meta', [
                  ts.factory.createTypeReferenceNode(
                    componentType.replace(/^['"]|['"]$/g, ''),
                  ),
                ]),
                metaObject,
              ),
            ],
            ts.NodeFlags.Const,
          ),
        )
        var exportNode = ts.factory.createExportDefault(
          ts.factory.createIdentifier('meta'),
        )
        var storyTypeNode = ts.factory.createVariableStatement(
          [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
          ts.factory.createVariableDeclarationList(
            [
              ts.factory.createVariableDeclaration(
                'Story',
                undefined,
                ts.factory.createTypeReferenceNode('StoryObj', [
                  ts.factory.createTypeReferenceNode(
                    componentType.replace(/^['"]|['"]$/g, ''),
                  ),
                ]),
                undefined,
              ),
            ],
            ts.NodeFlags.Const,
          ),
        )
        var metaOutput = printer.printNode(
          ts.EmitHint.Unspecified,
          metaNode,
          sourceFile,
        )
        var storyTypeOutput = printer.printNode(
          ts.EmitHint.Unspecified,
          storyTypeNode,
          sourceFile,
        )
        var exportOutput = printer.printNode(
          ts.EmitHint.Unspecified,
          exportNode,
          sourceFile,
        )
        // Preserve existing empty lines before and after the replaced section
        var leadingWhitespace =
          ((_a = node.getFullText(sourceFile).match(/^\s*/)) === null ||
          _a === void 0
            ? void 0
            : _a[0]) || ''
        var trailingWhitespace =
          ((_b = node.getFullText(sourceFile).match(/\s*$/)) === null ||
          _b === void 0
            ? void 0
            : _b[0]) || ''
        updatedContent = content.replace(
          node.getFullText(sourceFile),
          ''
            .concat(leadingWhitespace)
            .concat(metaOutput, '\n\n')
            .concat(exportOutput, '\n')
            .concat(storyTypeOutput)
            .concat(trailingWhitespace),
        )
      }
    }
    return ts.visitEachChild(
      node,
      function (child) {
        return visitor(child, context)
      },
      context,
    )
  }
  var transformResult = ts.transform(sourceFile, [
    function (context) {
      return function (root) {
        return ts.visitNode(root, function (node) {
          return visitor(node, context)
        })
      }
    },
  ])
  transformResult.dispose()
  return updatedContent
}
function updateImports(filePath, sourceCode) {
  // const sourceFile = ts.createSourceFile('temp.ts', sourceCode, ts.ScriptTarget.Latest, true)
  var sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true,
  )
  // A function to add or replace Story import
  function modifyImport(importDeclaration) {
    var importClause = importDeclaration.importClause
    if (
      importClause &&
      importClause.namedBindings &&
      ts.isNamedImports(importClause.namedBindings)
    ) {
      var namedImports = importClause.namedBindings.elements
      var hasStory = namedImports.some(function (element) {
        return element.name.text === 'Story'
      })
      var hasStoryObj = namedImports.some(function (element) {
        return element.name.text === 'StoryObj'
      })
      if (hasStory) {
        // Replace Story with StoryObj
        for (
          var _i = 0, namedImports_1 = namedImports;
          _i < namedImports_1.length;
          _i++
        ) {
          var element = namedImports_1[_i]
          if (element.name.text === 'Story') {
            element.name.text = 'StoryObj'
          }
        }
      } else if (!hasStoryObj) {
        // Add StoryObj if not present
        namedImports.push(
          ts.createImportSpecifier(
            false,
            undefined,
            ts.createIdentifier('StoryObj'),
          ),
        )
      }
    }
  }
  // Visitor function to walk through the AST
  function visitor(node) {
    if (ts.isImportDeclaration(node)) {
      modifyImport(node)
    }
    return ts.visitEachChild(node, visitor, null)
  }
  // Visit the source file to apply changes
  var updatedSourceFile = ts.visitNode(sourceFile, visitor)
  // Generate the modified code from the updated AST
  var printer = ts.createPrinter()
  return printer.printFile(updatedSourceFile)
}
function migrate(options) {
  return function (tree, _context) {
    tree.visit(function (filePath) {
      var _a
      if (filePath.endsWith('.ts')) {
        var content =
          (_a = tree.read(filePath)) === null || _a === void 0
            ? void 0
            : _a.toString('utf-8')
        if (content) {
          var updatedContent = updateFileContent(filePath, content)
          if (updatedContent !== content) {
            tree.overwrite(filePath, updatedContent)
          }
        }
      }
    })
    return tree
  }
}
exports.migrate = migrate
