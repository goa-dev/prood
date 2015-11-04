const branch = require('metalsmith-branch')
const templates = require('metalsmith-templates')
const metalsmith = require('metalsmith')
const serve = require('metalsmith-serve')
const markdown = require('metalsmith-markdown')
const collections = require('metalsmith-collections')
const excerpts = require('metalsmith-excerpts')
const permalinks = require('metalsmith-permalinks')
const autoprefixer = require('metalsmith-autoprefixer')
const postcss = require('metalsmith-postcss')
const fingerprint = require('metalsmith-fingerprint')
const ignore = require('metalsmith-ignore')
const concat = require('metalsmith-concat')
const copy = require('metalsmith-copy')
const sass = require('metalsmith-sass')
const babel = require('metalsmith-babel')
const path = require('path')

const POSTCSS_PLUGINS = []

metalsmith(__dirname)
  .source('./src')
  .destination('./build')

  // CSS
  .use(sass({
    outputDir: function(originalPath) {
      return originalPath.replace("sass", "css");
    }
  }))
  .use(concat({
    files: '**/*.css',
    output: 'css/build.css'
  }))
  .use(autoprefixer({browsers: ['> 1%', 'last 2 versions']}))
  .use(postcss(POSTCSS_PLUGINS))
  .use(fingerprint({pattern: ['css/build.css']}))
  .use(ignore(['css/build.css']))

  // JS
  .use(babel({
    presets: ['es2015']
  }))
  .use(concat({
    files: '**/*.js',
    output: 'js/build.js'
  }))

  .use(fingerprint({pattern: ['js/build.js']}))
  .use(ignore(['js/build.js']))

  // IMG
  .use(copy({
    pattern: '**/*.png',
    transform: (file) => {
      return path.join('./build', file)
    }
  }))

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
  .build((err) => {
    if (err) {
      throw err
    } else {
      console.log('Good, everything is ok')
    }
  })
