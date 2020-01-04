declare module 'jexl' {

  /**
   * Transform functions take one or more arguments: The value to be
   * transformed, followed by anything else passed to it in the expression. They
   * must return either the transformed value, or a Promise that resolves with
   * the transformed value.
   *
   * More information: https://github.com/TomFrost/Jexl#transforms
   */
  export type JexlTransformFunction<R = any> = (...args: any) => R | Promise<R>

  /**
   * Expression objects are created via jexl.createExpression, jexl.compile, or
   * jexl.expr, and are a convenient way to ensure jexl expressions compile only
   * once, even if they're evaluated multiple times.
   */
  export interface JexlExpression {

    /**
     * Forces the expression to compile, even if it was compiled before. Note
     * that each compile will happen with the latest grammar and transforms from
     * the associated Jexl instance.
     */
    compile: () => JexlExpression

    /**
     * Evaluates the expression. The context map is optional.
     */
    eval: <C = any, R = any>(context?: C) => Promise<R>

    /**
     * Evaluates the expression and returns the result. The context map is
     * optional.
     */
    evalSync: <C = any, R = any>(context?: C) => R

  }

  /**
   * # Jexl
   *
   * Javascript Expression Language: Powerful context-based expression parser
   * and evaluator
   *
   * Source: https://github.com/TomFrost/Jexl
   */
  export class Jexl {
    /**
     * A reference to the Jexl constructor. To maintain separate instances of
     * Jexl with each maintaining its own set of transforms, simply
     * re-instantiate with new jexl.Jexl().
     */
    Jexl: Jexl

    /**
     * Adds a binary operator to the Jexl instance. A binary operator is one
     * that considers the values on both its left and right, such as "+" or
     * "==", in order to calculate a result. The precedence determines the
     * operator's position in the order of operations (please refer to
     * lib/grammar.js to see the precedence of existing operators). The provided
     * function will be called with two arguments: a left value and a right
     * value. It should return either the resulting value, or a Promise that
     * resolves to the resulting value.
     */
    addBinaryOp: (operator: string, precedence: number, fn: <R = any>(left: any, right: any) => R | Promise<R>) => void

    /**
     * Adds a unary operator to the Jexl instance. A unary operator is one that
     * considers only the value on its right, such as "!", in order to calculate
     * a result. The provided function will be called with one argument: the
     * value to the operator's right. It should return either the resulting
     * value, or a Promise that resolves to the resulting value.
     */
    addUnaryOp: (operator: string, fn: <R = any>(right: any) => R | Promise<R>) => void

    /**
     * Adds a transform function to this Jexl instance. See the Transforms
     * section above for information on the structure of a transform function.
     */
    addTransform: (name: string, transform: JexlTransformFunction) => void

    /**
     * Adds multiple transforms from a supplied map of transform name to
     * transform function.
     */
    addTransforms: (transforms: { [name: string]: JexlTransformFunction }) => void

    /**
     * Constructs an Expression object around the given Jexl expression string.
     * Expression objects allow a Jexl expression to be compiled only once but
     * evaluated many times. See the Expression API below. Note that the only
     * difference between this function and jexl.createExpression is that this
     * function will immediately compile the expression, and throw any errors
     * associated with invalid expression syntax.
     *
     * Expression Api: https://github.com/TomFrost/Jexl#expression
     */
    compile: (expression: string) => JexlExpression

    /**
     * Constructs an Expression object around the given Jexl expression string.
     * Expression objects allow a Jexl expression to be compiled only once but
     * evaluated many times. See the Expression API below.
     *
     * Expression Api: https://github.com/TomFrost/Jexl#expression
     */
    createExpression: (expression: string) => JexlExpression

    /**
     * Gets a previously set transform function, or undefined if no function of
     * that name exists.
     */
    getTransform: <R = any>(name: string) => JexlTransformFunction<R> | undefined

    /**
     * Evaluates an expression. The context map is optional.
     */
    eval: <C = any, R = any>(expression: string, context?: C) => Promise<R>

    /**
     * Evaluates an expression and returns the result. The context map is
     * optional.
     */
    evalSync: <C = any, R = any>(expression: string, context?: C) => R

    /**
     * A convenient bit of syntactic sugar for jexl.createExpression
     *
     * ```
     * const someNumber = 10
     * const expression = jexl.expr`5 + ${someNumber}`
     * console.log(expression.evalSync()) // 15
     * ```
     *
     * Note that expr will stay bound to its associated Jexl instance even if it's pulled out of context:
     *
     * ```
     * const { expr } = jexl
     * jexl.addTransform('double', val => val * 2)
     * const expression = expr`2|double`
     * console.log(expression.evalSync()) // 4
     * ```
     *
     */
    expr: (strs: TemplateStringsArray, ...args: string[]) => JexlExpression

    /**
     * Removes a binary or unary operator from the Jexl instance. For example,
     * "^" can be passed to eliminate the "power of" operator.
     */
    removeOp: (operator: string) => void
  }

  const _default: Jexl

  export default _default
}
