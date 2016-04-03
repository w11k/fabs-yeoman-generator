'use strict';

var yeoman = require('yeoman-generator');
var lodash = require('lodash');

var settings = {};
var questions = {};

var yesNoQuestion = function (name, message, defaultValue) {
  defaultValue = defaultValue || 0;

  return {
    type : 'list',
    name : name,
    message : message,
    choices: [
      { name: 'No', value: false },
      { name: 'Yes', value: true }
    ],
    default : defaultValue
  };
};

var _;

var generator = yeoman.generators.Base.extend({


  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);

    _ = this._;

    questions.projectName = {
      type    : 'input',
      name    : 'name',
      message : 'Project name',
      default : this.appname || 'app' // current folder name
    };

    questions.projectVersion = {
      type    : 'input',
      name    : 'version',
      message : 'Project version',
      default : '0.1.0'
    };

    questions.bower = yesNoQuestion(
      'bower',
      'Use Bower to manage your frontend dependencies? (Highly recommended)',
      1
    );

    questions.git = yesNoQuestion(
      'git',
      'Use Git as version control system?',
      1
    );

    questions.less = yesNoQuestion(
      'less',
      'Use LESS as CSS precompiler?',
      1
    );

    questions.sass = yesNoQuestion(
      'sass',
      'Use SASS as CSS precompiler? (Note: You have to install ruby and compass manually!)',
      0
    );

    questions.ngAnnotate = yesNoQuestion(
      'ngAnnotate',
      'Use ng-annotate to create AngularJS\'s function-array-notation automatically',
      1
    );

    questions.jsHint = yesNoQuestion(
      'jsHint',
      'Use JSHint to check JavaScript code? (Highly recommended)',
      1
    );

    questions.ie8 = yesNoQuestion(
      'ie8',
      'Add support for IE8?',
      0
    );

    questions.ie9 = yesNoQuestion(
      'ie9',
      'Add to support for IE9?',
      0
    );

    questions.spec = yesNoQuestion(
      'spec',
      'Do you want to write spec tests?',
      1
    );

    questions.e2e = yesNoQuestion(
      'e2e',
      'Do you want to write end-to-end tests?',
      1
    );

    questions.testBrowsers = {
      type    : 'checkbox',
      name    : 'testBrowsers',
      message : 'Which browsers do you want to use to run tests with?',
      choices: [ 'PhantomJS', 'Chrome', 'Firefox', 'Internet Explorer', 'Safari'],
      default : ['PhantomJS'],
      when: function (answers) {
        return answers.spec || answers.e2e;
      }
    };

    questions.proxy = yesNoQuestion(
      'proxy',
      'Do you want to add a proxy to your backend to avoid CORS problems?',
      1
    );

    questions.proxy_host = {
      type: 'input',
      name: 'proxy_host',
      message: 'What is the host of the proxy?',
      default: 'localhost',
      when: function (answers) {
        return answers.proxy;
      }
    };

    questions.proxy_port = {
      type: 'input',
      name: 'proxy_port',
      message: 'What is the port of the proxy?',
      default: '8080',
      when: function (answers) {
        return answers.proxy;
      }
    };

    questions.proxy_context = {
      type: 'input',
      name: 'proxy_context',
      message: 'What is the context / url prefix of requests that should be redirected to the proxy?',
      default: '/api',
      when: function (answers) {
        return answers.proxy;
      }
    };
  },

  promptingProject: function () {
    var done = this.async();
    this.prompt([
      questions.projectName,
      questions.projectVersion
    ],
    function (answers) {
      lodash.extend(settings, answers);
      settings.nameDashed = _.slugify(answers.name);
      done();
    });
  },

  promptingAngular: function () {
    var done = this.async();
    this.prompt([{
        type    : 'input',
        name    : 'angularModule',
        message : 'Name of main AngularJS module',
        default : _.slugify(settings.name) + '.app'
      }],
      function (answers) {
        lodash.extend(settings, answers);
        done();
      });
  },

  promptingFeatures: function () {
    var done = this.async();
    this.prompt([
        questions.bower,
        questions.git,
        questions.jsHint,
        questions.less,
        questions.sass,
        questions.ngAnnotate,
        questions.ie8,
        questions.ie9,
        questions.spec,
        questions.e2e,
        questions.testBrowsers,
        questions.proxy,
        questions.proxy_host,
        questions.proxy_port,
        questions.proxy_context
      ],
      function (answers) {
        lodash.extend(settings, answers);

        settings.proxies = [];

        if (settings.proxy) {
          settings.proxies.push({
            context: settings.proxy_context,
            host: settings.proxy_host,
            port: settings.proxy_port

          });
        }

        done();
      });
  },

  createToolConfigs: function () {
    console.log('Creating tool config files');

    if (settings.bower) {
      this.copy('_.bowerrc', '.bowerrc');
    }

    if (settings.git) {
      this.copy('_.gitignore', '.gitignore');
    }

    if (settings.jsHint) {
      this.copy('_.jshintrc', '.jshintrc');
    }
  },

  createProjectFiles: function () {
    console.log('Creating project files');

    this.copy('_Gruntfile.js', 'Gruntfile.js');
    this.template('_README.md.template', 'README.md', settings);

    this.template('_package.json.template', 'package.json', settings);
    this.template('_bower.json.template', 'bower.json', settings);
  },

  createFabsFiles: function () {
    console.log('Creating fabs files');

    this.copy('build-config/_developer.config.tpl.js', 'build-config/developer.config.tpl.js');
    this.template('build-config/_project.config.js.template', 'build-config/project.config.js', settings);
  },

  createSourceFiles: function () {
    console.log('Creating source files');

    this.mkdir('assets');

    this.template('src/_app.js.template', 'src/' + settings.nameDashed + '.js', settings);
    this.template('src/_index.html.template', 'src/index.html', settings);

    if (settings.spec) {
      this.template('src/_app.spec.js.template', 'src/' + settings.nameDashed + '.spec.js', settings);
    }

    if (settings.e2e) {
      this.template('src/_app.e2e.js.template', 'src/' + settings.nameDashed + '.e2e.js', settings);
    }

    if (settings.spec || settings.e2e) {
      this.template('src/_app.mock.js.template', 'src/' + settings.nameDashed + '.mock.js', settings);
    }

    if (settings.less) {
      this.template('src/_app.less', 'src/' + settings.nameDashed + '.less', settings);
    }

    if (settings.sass) {
      this.template('src/_app.scss', 'src/' + settings.nameDashed + '.scss', settings);
    }

    if (settings.sass === false && settings.less === false) {
      this.template('src/_app.css', 'src/' + settings.nameDashed + '.css', settings);
    }
  },

  installNpmAndBower: function () {
    this.installDependencies({
      npm: true,
      bower: settings.bower,
      skipInstall: this.options['skip-install'],
      skipMessage: true
    });
  },

  printFinishMessage: function () {
    console.log('Finished successfully! Have fun with AngularJS and fabs');
  }
});

module.exports = generator;
