const daggy = require('daggy')

const Maybe = daggy.taggedSum('Maybe', {
  Some: ['x'],
  Nothing: []
})

Maybe.prototype.map = function(f) {
  return this.cata({
    Some: function(x) {
      return Maybe.Some(f(x))
    },
    Nothing: function() {
      return Maybe.Nothing
    }
  })
}

Maybe.prototype.join = function() {
  return this.cata({
    Some: function(x) {
      return x
    },
    Nothing: () => Maybe.Nothing
  })
}

Maybe.prototype.chain = function(f) {
  return this.cata({
    Some: function(x) {
      return f(x)
    },
    Nothing: function() {
      return Maybe.Nothing
    }
  })
}
Maybe.of = function(x) {
  return Maybe.Some(x)
}

Maybe.prototype.fold = function(g, f) {
  return this.cata({
    Some: function(x) {
      return f(x)
    },
    Nothing: function() {
      return g()
    }
  })
}

Maybe.prototype.ap = function(otherF) {
  return this.cata({
    Some: function(f) {
      if (!Maybe.is(otherF)) {
        throw new Error(
          'Maybe.ap expects to be called with another Maybe! Got ' +
            otherF.toString()
        )
      }
      return otherF.map(x => f(x))
    },
    Nothing: function() {
      return Maybe.Nothing
    }
  })
}

Maybe.prototype.isNothing = function() {
  return this.cata({
    Some: function(_) {
      return false
    },
    Nothing: function() {
      return true
    }
  })
}

Maybe.fromNullable = function(n) {
  return n == null ? Maybe.Nothing : Maybe.Some(n)
}

module.exports = Maybe
