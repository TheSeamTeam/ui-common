import {
  // apply, chain,
  // mergeWith, move,
  Rule, SchematicsException,
  Tree,
  SchematicContext,
  // url, template
} from '@angular-devkit/schematics'
// import { normalize, strings } from '@angular-devkit/core'
// import { updateWorkspace } from '@schematics/angular/utility/workspace'
import * as ts from 'typescript'

import { Schema as MigrateToCSF3Schema } from './schema'

function updateFileContent(filePath: string, content: string): string {
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  )

  let updatedContent = content

  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })

  const visitor = (node: ts.Node, context: ts.TransformationContext): ts.Node => {
    if (
      ts.isExportAssignment(node) &&
      ts.isAsExpression(node.expression) &&
      ts.isObjectLiteralExpression(node.expression.expression)
    ) {
      const metaObject = node.expression.expression

      const componentProperty = metaObject.properties.find(
        prop =>
          ts.isPropertyAssignment(prop) &&
          ts.isIdentifier(prop.name) &&
          prop.name.text === 'component'
      )

      if (componentProperty && ts.isPropertyAssignment(componentProperty)) {
        const componentType = componentProperty.initializer.getText()

        const metaNode = ts.factory.createVariableStatement(
          undefined,
          ts.factory.createVariableDeclarationList(
            [
              ts.factory.createVariableDeclaration(
                'meta',
                undefined,
                ts.factory.createTypeReferenceNode('Meta', [
                  ts.factory.createTypeReferenceNode(
                    componentType.replace(/^['"]|['"]$/g, '')
                  ),
                ]),
                metaObject
              ),
            ],
            ts.NodeFlags.Const
          )
        )

        const exportNode = ts.factory.createExportDefault(
          ts.factory.createIdentifier('meta')
        )

        const storyTypeNode = ts.factory.createVariableStatement(
          [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
          ts.factory.createVariableDeclarationList(
            [
              ts.factory.createVariableDeclaration(
                'Story',
                undefined,
                ts.factory.createTypeReferenceNode('StoryObj', [
                  ts.factory.createTypeReferenceNode(
                    componentType.replace(/^['"]|['"]$/g, '')
                  ),
                ]),
                undefined
              ),
            ],
            ts.NodeFlags.Const
          )
        )

        const metaOutput = printer.printNode(ts.EmitHint.Unspecified, metaNode, sourceFile)
        const storyTypeOutput = printer.printNode(ts.EmitHint.Unspecified, storyTypeNode, sourceFile)
        const exportOutput = printer.printNode(ts.EmitHint.Unspecified, exportNode, sourceFile)

        // Preserve existing empty lines before and after the replaced section
        const leadingWhitespace = node.getFullText(sourceFile).match(/^\s*/)?.[0] || ''
        const trailingWhitespace = node.getFullText(sourceFile).match(/\s*$/)?.[0] || ''

        updatedContent = content.replace(
          node.getFullText(sourceFile),
          `${leadingWhitespace}${metaOutput}\n\n${exportOutput}\n${storyTypeOutput}${trailingWhitespace}`
        )
      }
    }
    return ts.visitEachChild(node, child => visitor(child, context), context)
  }

  const transformResult = ts.transform(sourceFile, [context => root => ts.visitNode(root, node => visitor(node, context))])
  transformResult.dispose()

  return updatedContent
}

export function migrate(options: MigrateToCSF3Schema): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    tree.visit(filePath => {
      if (filePath.endsWith('.ts')) {
        const content = tree.read(filePath)?.toString('utf-8')
        if (content) {
          const updatedContent = updateFileContent(filePath, content)
          if (updatedContent !== content) {
            tree.overwrite(filePath, updatedContent)
          }
        }
      }
    })
    return tree
  }
}
