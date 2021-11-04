// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      // require('karma-ie-launcher'),
      require('karma-firefox-launcher'),
      // require('karma-safari-launcher'),
      // require('karma-opera-launcher'),
      // require('karma-edge-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        // you can add configuration options for Jasmine here
        // the possible options are listed at https://jasmine.github.io/api/edge/Configuration.html
        // for example, you can disable the random execution with `random: false`
        // or set a specific seed with `seed: 4321`
      },
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    jasmineHtmlReporter: {
      suppressAll: true // removes the duplicated traces
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, '../coverage'),
      reports: ['html', 'lcovonly'],
      fixWebpackSourcePaths: true
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    customLaunchers: {
      ChromeDebugging: {
        base: 'Chrome',
        flags: [
          '--remote-debugging-port=9333'
        ]
      },
      ChromeHeadless: {
        base: 'Chrome',
        flags: [
          '--headless',
          '--disable-gpu',
          '--no-sandbox',
          '--remote-debugging-port=9333',
        ]
      },
      // IE9: {
      //   base: 'IE',
      //   'x-ua-compatible': 'IE=EmulateIE9'
      // },
      // IE8: {
      //   base: 'IE',
      //   'x-ua-compatible': 'IE=EmulateIE8'
      // },
      // IE_no_addons: {
      //   base:  'IE',
      //   flags: ['-extoff']
      // }
    },
    browsers: [
      'ChromeDebugging'
      // 'IE_no_addons'
      // 'IE'
      // 'IE9'
      // 'IE8'
      // 'Edge'
      // 'Firefox'
      // 'FirefoxDeveloper'
      // 'FirefoxAurora'
      // 'FirefoxNightly'
      // 'Safari'
      // 'Opera'
    ],
    singleRun: false,
    // restartOnFileChange: true
  });
};
