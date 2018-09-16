const { task, fromNodeback } = require('folktale/concurrency/task')
const fs = require('fs')
// parseArgs :: IO -> [ String ]
exports.parseArgs = minArgs =>
  task(
    resolver =>
      process.argv.length >= minArgs + 2
        ? resolver.resolve(process.argv.slice(2))
        : resolver.reject(`Usage: node ${
            process.argv[1]
          } param [param] [...param]
           Expected at least ${minArgs} arguments`)
  )

exports.readFile = fromNodeback(fs.readFile)
exports.writeFile = fromNodeback(fs.writeFile)
