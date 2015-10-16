/**
 * Dependencies
 */
var branch = require('metalsmith-branch');
var templates = require('metalsmith-templates');
var metalsmith = require('metalsmith');
var serve = require('metalsmith-serve');
var markdown = require('metalsmith-markdown');
var collections = require('metalsmith-collections');
var excerpts = require('metalsmith-excerpts');
var permalinks = require('metalsmith-permalinks');
var autoprefixer = require('metalsmith-autoprefixer');
var postcss = require('metalsmith-postcss');
var fingerprint = require('metalsmith-fingerprint');
var ignore = require('metalsmith-ignore');
var concat = require('metalsmith-concat');
var copy = require('metalsmith-copy');
var path = require('path');

var plugins = [
]
var supported = {browsers: ['> 1%', 'last 2 versions', 'IE >= 9']}

/**
 * Build
 */
metalsmith(__dirname)
  .source('./src')
  .destination('./build')

  // CSS
  .use(concat({
      files: '**/*.css',
      output: 'css/build.css'
    })
  )
  .use(autoprefixer(supported))
  .use(postcss(plugins))
  .use(fingerprint({pattern: ['css/build.css']}))
  .use(ignore(['css/build.css']))

  // JS
  .use(concat({
      files: '**/*.js',
      output: 'js/build.js'
    })
  )
  .use(fingerprint({pattern: ['js/build.js']}))
  .use(ignore(['js/build.js']))

  // IMG
  .use(copy({
      pattern: '**/*.png',
      transform: function(file) {
        return path.join('./build', file)
      }
    })
  )

  .use(markdown())
  .use(excerpts())
  .use(collections({
    posts: {
      pattern: 'posts/**/**.html',
      sortBy: 'publishDate',
      reverse: true
    }
  }))
  .use(branch('posts/**/**.html')
      .use(permalinks({
        pattern: 'posts/:title',
        relative: false
      }))
  )
  .use(branch('!posts/**/**.html')
      .use(branch('!index.md').use(permalinks({
        relative: false
      })))
  )
  .use(templates({
    engine: 'jade'
  }))

  // Serve and watch for changes
  .use(serve({
    port: 8080,
    verbose: true
  }))

  // Build site
  .build(function(err){
    if (err) {
      throw err
    } else {
      console.log('Good, everything is ok')
    }
  });
