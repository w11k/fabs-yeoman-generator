'use strict';

var grunt = require('grunt');

module.exports = function () {
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-conventional-changelog');

  grunt.registerTask('release', [
    'bump',
    'changelog'
  ]);

  grunt.initConfig({
    bump: {
      options: {
        files: ['package.json', 'generator-fabs/package.json'],
        commit: true,
        commitMessage: 'chore(project): bump version to %VERSION%',
        commitFiles: ['package.json', 'generator-fabs/package.json'],
        createTag: false,
        push: false
      }
    }
  });
};
