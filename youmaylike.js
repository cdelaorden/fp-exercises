const R = require('ramda')
const daggy = require('daggy')
const { parseArgs } = require('./lib/io')
const { waitAll } = require('folktale/concurrency/task')
const { searchArtist, fetchRelatedArtists } = require('./lib/spotify')

const ArtistSummary = daggy.tagged('ArtistSummary', [
  'id',
  'name',
  'popularity'
])

ArtistSummary.prototype.equals = function(other) {
  return this.id === other.id
}

// searchAllArtists :: [String] -> Task Error [Artist]
const searchAllArtists = R.compose(
  waitAll,
  R.map(searchArtist)
)

// getArtistIds :: [Artists] -> [String]
const getArtistIds = R.map(R.prop('id'))

// fetchAllRelated :: [String] -> Task Error [[Artists]]
const fetchAllRelated = R.compose(
  waitAll,
  R.map(fetchRelatedArtists),
  R.reject(R.isNil)
)

// createSummaries :: [[{ Artist }]] -> [[{ ArtistSummary }]]
const createSummaries = R.map(
  R.map(
    R.compose(
      ArtistSummary.from,
      R.pick(['id', 'name', 'popularity', 'images'])
    )
  )
)
// sortByPopularity :: [{ ArtistSummary }] -> [ArtistSummary]
const sortByPopularity = R.compose(
  R.reverse,
  R.sortBy(R.prop('popularity'))
)

// isSameArtist :: ArtistSummary, ArtistSummary -> Bool
const isSameArtist = (a, b) => a.equals(b)

// findCommonArtists :: [[ ArtistSummary ]] -> [ArtistSummary]
const findCommonArtists = artists =>
  artists.length ? artists.reduce(R.innerJoin(isSameArtist)) : []

// makeCommonArtistList :: [[Artist]] -> [ArtistSummary]
const makeCommonArtistList = R.compose(
  sortByPopularity,
  findCommonArtists,
  createSummaries
)

/**
 * Finds similar artists based on 2 or more names
 * using the Spotify API
 * See lib/spotify.js to set the TOKEN (expires quickly!)
 * app :: (args) -> [{ id, name, popularity, images }]
 */
function app() {
  return parseArgs(2)
    .chain(searchAllArtists)
    .map(getArtistIds)
    .chain(fetchAllRelated)
    .map(makeCommonArtistList)
}

const printResults = R.compose(
  console.log,
  R.map(R.prop('name'))
)

app()
  .map(printResults)
  .run()
  .promise()
  .catch(err => console.log('ERROR:', err.message || err.toString()))
