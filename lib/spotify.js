const R = require('ramda')
const got = require('got')
const { fromPromised } = require('folktale/concurrency/task')

// Grab token here with your Spotify credentials:
// https://developer.spotify.com/console/
const TOKEN =
  'BQD0LlibZgGY6hdrXF1tigLeowGsWStSNKokdE8eRPxDY1de3xtE_RbyLqRtDG3GRHh8rZYDJ2yoshcJGHFRSbR8A8yRVLpRpGB4O3YGsOvhZkR6Z8bPhm59N6rdu5inNwr0ZnUJbNtUHYp8gA'

const gotOpts = {
  json: true,
  headers: {
    Authorization: `Bearer ${TOKEN}`
  }
}

// apiGet :: String -> Task Error JSON
const apiGet = fromPromised(url => {
  //const start = Date.now()
  return got(url, gotOpts).then(res => res.body)
})

// sortByPopularityDesc :: [{Artist}] -> [{Artist}]
const sortByPopularityDesc = R.compose(
  R.reverse,
  R.sortBy(R.prop('popularity'))
)

// mostPopular :: JSON -> {Artist}
const mostPopular = R.compose(
  R.head,
  sortByPopularityDesc,
  R.path(['artists', 'items'])
)

// searchArtist :: String -> Task Error Artist
function searchArtist(name) {
  return apiGet(`https://api.spotify.com/v1/search?q=${name}&type=artist`).map(
    mostPopular
  )
}

// getRelatedArtists :: String -> Task Error [Artist]
function fetchRelatedArtists(artistId) {
  return apiGet(
    `https://api.spotify.com/v1/artists/${artistId}/related-artists`
  ).map(R.prop('artists'))
}

module.exports = {
  searchArtist,
  fetchRelatedArtists
}
