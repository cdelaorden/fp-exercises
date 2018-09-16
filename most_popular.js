const R = require('ramda')
const { of } = require('folktale/concurrency/task')
const { searchArtist } = require('./lib/spotify')
const { parseArgs } = require('./lib/io')

// getMostPopular :: { artist } -> { artist } -> { artist }
const getMostPopular = R.maxBy(R.prop('popularity'))

// use Applicative to search both at the same time
const findMostPopularInSpotify = ([name1, name2]) =>
  of(getMostPopular)
    .ap(searchArtist(name1))
    .ap(searchArtist(name2))
    .map(R.pick(['id', 'name', 'popularity']))

const start = Date.now()
parseArgs(2)
  .chain(findMostPopularInSpotify)
  .run()
  .promise()
  .then(console.log)
  .catch(err =>
    console.error(
      `Something failed! ${err.message || err.status || err.toString()}`
    )
  )
