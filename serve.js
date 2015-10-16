/**
 * Dependencies
 */
var branch = require('metalsmith-branch');
var templates = require('metalsmith-templates');
var metalsmith = require('metalsmith');
var rename = require('metalsmith-rename');
var serve = require('metalsmith-serve');
var markdown = require('metalsmith-markdown');
var collections = require('metalsmith-collections');
var excerpts = require('metalsmith-excerpts');
var permalinks = require('metalsmith-permalinks');

/**
 * Build
 */
metalsmith(__dirname)
  .source('./src')
  .destination('./build')
  .use(markdown())
  .use(excerpts())
  .use(collections({
    posts: {
      pattern: 'posts/**.html',
      sortBy: 'publishDate',
      reverse: true
    }
  }))
  .use(branch('posts/**.html')
      .use(permalinks({
        pattern: 'posts/:title',
        relative: false
      }))
  )
  .use(branch('!posts/**.html')
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
