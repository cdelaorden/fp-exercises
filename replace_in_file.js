const R = require('ramda')
const { readFile, writeFile } = require('./lib/io')

const log = x => console.log(x.toString())

const replaceInFile = (sourceFile, outFile, pattern, replace) =>
  readFile(sourceFile, 'utf-8')
    .map(R.replace(pattern, replace))
    .chain(str => writeFile(outFile, str))

const app = replaceInFile('./config.json', 'config2.json', /3001/, '8088')

app
  .run()
  .promise()
  .then(
    R.compose(
      log,
      R.always('SUCCESS')
    )
  )
  .catch(log)
