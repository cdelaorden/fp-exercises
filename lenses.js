const R = require('ramda')

const data = {
  id: 1,
  login: 'foobar',
  name: 'John',
  lastName: 'McEnroe',
  address: {
    street: 'Sesame St',
    number: 25,
    zipcode: 'zip25',
    country: 'USA'
  },
  preferences: {
    tags: ['foobar', 'foobaz', 'qubax']
  }
}

const makePathLens = path => R.lens(R.path(path), R.assocPath(path))

const idL = makePathLens(['id'])
const addressL = makePathLens(['address'])
const streetL = R.compose(
  addressL,
  R.lens(R.path(['street']), R.assocPath(['street']))
)
const tagsL = makePathLens(['preferences', 'tags'])
const firstL = makePathLens([0])
const firstTagL = R.compose(
  tagsL,
  firstL
)

console.log('Set id = 25', R.set(idL, 25, data))
console.log('Set street to FOO', R.set(streetL, 'Street Fighter 2', data))
console.log('Set 1st tag to BOOM', R.set(firstTagL, 'BOOM', data))
console.log('Map over tags', R.over(tagsL, R.map(R.toUpper), data))
