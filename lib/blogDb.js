const R = require('ramda')
const { task, of, fromNodeback } = require('folktale/concurrency/task')
const daggy = require('daggy')
const DataStore = require('nedb')

exports.Post = daggy.tagged('Post', ['_id', 'author', 'title', 'body', 'tags'])
exports.Comment = daggy.tagged('Comment', [
  '_id',
  'author',
  'createdAt',
  'body'
])

exports.createDb = filename =>
  of(
    new DataStore({
      filename,
      autoload: true
    })
  )

exports.insert = db => fromNodeback(db.insert.bind(db))
exports.find = db => fromNodeback(db.find.bind(db))
