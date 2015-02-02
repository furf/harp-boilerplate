module.exports = function(grunt) {

  var config = grunt.file.readYAML('config/grunt.yml');
  var semver = require('semver');

  // Load tasks
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-harp');
  grunt.loadNpmTasks('grunt-newer');
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-prompt');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-svgstore');

  // Configure tasks
  grunt.initConfig({

    // Parse package.json
    pkg: grunt.file.readJSON('package.json'),

    // https://github.com/npm/node-semver
    semver: semver,

    // https://github.com/sindresorhus/grunt-shell
    shell: {},

    // https://github.com/shovon/grunt-harp
    harp: {
      server: {
        server: true,
        port: config.tasks.harp.server.port
      },
      dist: {
        source: '.',
        dest: config.tasks.harp.dist.dest
      }
    },

    // https://github.com/gruntjs/grunt-contrib-imagemin
    imagemin: {
      options: {
        optimizationLevel: config.tasks.imagemin.optimizationLevel
      },
      dynamic: {
        files: [{
          expand: true,
          cwd: config.tasks.imagemin.src + '/',
          src: ['**/*.{png,jpg,gif}'],
          dest: config.tasks.imagemin.dest + '/'
        }]
      }
    },

    // https://github.com/FWeinb/grunt-svgstore
    svgstore: {
      options: {
        cleanup: ['style', 'fill', 'stroke'],
        prefix: config.tasks.svgstore.prefix,
        svg: {
          style: 'display:none;'
        }
      },
      default: {
        src: config.tasks.svgstore.src,
        dest: config.tasks.svgstore.dest
      }
    },

    // https://github.com/gruntjs/grunt-contrib-jshint
    jshint: {
      all: [
        'Gruntfile.js',
        'public/scripts/**/*.js'
      ]
    },

    // https://github.com/gruntjs/grunt-contrib-watch
    watch: {

      livereload: {
        files: ['public/**/*'],
        options: {
          livereload: config.tasks.watch.livereload
        }
      },

      imagemin: {
        files: 'resources/images',
        tasks: function() {
          console.log(arguments);
        }
      },

      svgstore: {
        files: config.tasks.svgstore.src,
        tasks: 'svgstore'
      }
    },

    // https://github.com/sindresorhus/grunt-concurrent
    concurrent: {
      develop: {
        tasks: [
          'server',
          'watch'
        ],
        options: {
          logConcurrentOutput: true
        }
      }
    },

    // https://github.com/jsoverson/grunt-open
    open: {
      dev: {
        path: 'http://localhost:' + config.tasks.harp.server.port + '/',
        app: 'Google Chrome'
      }
    },

    // https://github.com/vojtajina/grunt-bump
    bump: {
      options: {
        files: [
          'harp.json',
          'package.json',
          'bower.json'
        ],
        updateConfigs: ['pkg'],
        commit: false,
        commitMessage: 'Release v%VERSION%',
        commitFiles: [
          'harp.json',
          'package.json',
          'bower.json'
        ],
        createTag: false,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: false,
        pushTo: 'upstream',
        gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
        globalReplace: false
      }
    },

    prompt: {
      bump: {
        options: {
          questions: [{
            config: 'increment',
            type: 'list',
            message: 'Bump version from <%= pkg.version %> to:',
            choices: [{
              value: 'patch',
              name: '<%= semver.inc(pkg.version, "patch").bold.white %> PATCH   (when you make backwards-compatible bug fixes)'
            }, {
              value: 'minor',
              name: '<%= semver.inc(pkg.version, "minor").bold.white %> MINOR   (when you add functionality in a backwards-compatible manner)'
            }, {
              value: 'major',
              name: '<%= semver.inc(pkg.version, "major").bold.white %> MAJOR   (when you make incompatible API changes)'
            }, {
              value: 'custom',
              name: '<%= "?.?.?".bold.white %> CUSTOM  (specify version)'
            }]
          }, {
            config: 'custom',
            type: 'input',
            message: 'Specify version:',
            when: function(answers) {
              return answers.increment === 'custom';
            },
            validate: function(value) {
              var valid = semver.valid(value);
              return !!valid || 'Version must be a valid semver, such as 1.2.3-rc1. See http://semver.org/ for more details.';
            },
          }],
          then: function(results) {

            var task;

            if (results.custom) {
              grunt.option('setversion', results.custom);
              task = 'bump';
            } else {
              task = 'bump:' + results.increment;
            }

            grunt.task.run(task);
          }
        }
      }
    }

  });

  // Register tasks
  grunt.registerTask('server', ['harp:server']);
  grunt.registerTask('compile', ['harp:dist']);
  grunt.registerTask('develop', [
    'svgstore',
    'newer:imagemin',
    'open:dev',
    'concurrent:develop'
  ]);
  grunt.registerTask('deploy', [
    'svgstore',
    'newer:imagemin',
    'jshint',
    'compile',
    'prompt:bump'
  ]);

  // Alias tasks
  grunt.registerTask('serve', 'server');
  grunt.registerTask('default', 'develop');
};