const R = require('ramda')
const { readFile } = require('./lib/io')
const Task = require('folktale/concurrency/task')

// change [Task Error String] to Task [Error String] using Traversable
const files = ['./package.json', './form_validation.js']
const readManyFiles = R.traverse(Task.of, f => readFile(f, 'utf-8'), files)
readManyFiles
  .run()
  .promise()
  .then(console.log)
  .catch(err => console.error(`Failed, file not found: ${err.path}`))
