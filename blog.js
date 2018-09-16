const { waitAll } = require('folktale/concurrency/task')
const { loadDb, insert, find } = require('./lib/blogDb')

loadDb('./blogdb')
  .chain(db => {
    const insertPost = insert(db)
    const findPosts = find(db)

    return findPosts({}).and(
      insertPost({
        title: 'Task post!',
        author: 'Charlie'
      })
    )
  })
  .run()
  .promise()
  .then(console.log)
  .catch(console.error)
