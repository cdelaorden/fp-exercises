const daggy = require('daggy')

const Either = daggy.taggedSum('Either', {
  Left: ['x'],
  Right: ['a']
})

Either.prototype.map = function(f) {
  return this.cata({
    Left: function(e) {
      return Either.Left(e)
    },
    Right: function(a) {
      return Either.Right(f(a))
    }
  })
}

Either.prototype.chain = function(f) {
  return this.cata({
    Left: function(e) {
      return Either.Left(e)
    },
    Right: function(a) {
      return f(a)
    }
  })
}

Either.prototype.fold = function(ifError, ifSuccess) {
  return this.cata({
    Left: function(err) {
      return ifError(err)
    },
    Right: function(a) {
      return ifSuccess(a)
    }
  })
}

Either.of = function(x) {
  return Either.Right(x)
}

Either.tryCatch = fn => (...args) => {
  try {
    const v = fn.apply(null, args)
    return Either.Right(v)
  } catch (err) {
    return Either.Left(err.message || err.toString())
  }
}

module.exports = Either
