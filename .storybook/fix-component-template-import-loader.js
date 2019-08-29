//
// Angular now builds with 'raw-loader@3.1.0', which ES Module export instead of
// CommonJS. This will fix the imports until storybook is updated for Angular
// v8.3.0.
//
// Based on this comment: https://github.com/TheLarkInn/angular2-template-loader/issues/86#issuecomment-495057702
//
module.exports = function(source, sourcemap) {
  this.cacheable && this.cacheable()
  const templateRegExp = /.(html|scss)('|")\)/g
  const newSource = source.replace(templateRegExp, (match) => `${match}.default`)
  if (this.callback)
      this.callback(null, newSource, sourcemap)
  else
      return newSource
}
