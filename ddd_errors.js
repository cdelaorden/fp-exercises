const R = require('ramda')
const { readFile, parseArgs } = require('./lib/io')
const daggy = require('daggy')
const Either = require('./lib/either')
const { of, rejected } = require('folktale/concurrency/task')
const { Right, Left, tryCatch } = Either

// Modeling possible errors with a Sum Type

const IOError = daggy.taggedSum('IOError', {
  FileNotFound: ['filename'],
  InvalidJSON: ['filename'],
  Other: ['error']
})

IOError.prototype.toHuman = function() {
  return this.cata({
    FileNotFound: function(filename) {
      return `File not found: ${filename}`
    },
    InvalidJSON: filename => `Invalid JSON detected in ${filename}`,
    Other: err => err
  })
}

const parseJSON = str => tryCatch(JSON.parse)(str).fold(rejected, of)

const readFileOrIOError = name =>
  readFile(name, 'utf-8').mapRejected(() => IOError.FileNotFound(name))

const readJSONFile = name =>
  readFileOrIOError(name).chain(s =>
    parseJSON(s).mapRejected(() => IOError.InvalidJSON(name))
  )

const app = parseArgs(1)
  .mapRejected(err => IOError.Other(err))
  .chain(([name]) => readJSONFile(name))

app
  .run()
  .promise()
  .then(console.log)
  .catch(
    R.compose(
      console.error,
      x => x.toHuman()
    )
  )
