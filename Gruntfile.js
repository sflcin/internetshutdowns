// Gruntfile.js

// our wrapper function (required by grunt and its plugins)
// all configuration goes inside this function
module.exports = function(grunt) {

  // ===========================================================================
  // CONFIGURE GRUNT ===========================================================
  // ===========================================================================
  grunt.initConfig({

    // all of our configuration will go here
    browserSync: {
      dev: {
        bsFiles: {
          src : [ '*.html', 'assets/**/*.css', 'assets/**/*.js']
        },
        options: {
          server: {
            baseDir: "./"
          }
          // watchTask: true,
          // injectChanges: false,
          // reloadDelay: 3000,
          // proxy: "localhost/sandbox"
        }
      }
    }
  });

  grunt.registerTask('default', ['browserSync']);

  // ===========================================================================
  // LOAD GRUNT PLUGINS ========================================================
  // ===========================================================================
  // we can only load these if they are in our package.json
  // make sure you have run npm install so our app can find these
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-browser-sync');
};
