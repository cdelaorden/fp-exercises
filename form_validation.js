const R = require('ramda')
const daggy = require('daggy')
const { Success, Failure } = require('folktale/validation')
const Maybe = require('./lib/maybe')

const ValidationError = daggy.tagged('ValidationError', ['field', 'message'])

const notEmpty = ({ field, value }) =>
  !R.isNil(value) && value.trim()
    ? Success(value)
    : Failure([ValidationError(field, `${field} can't be empty`)])

const minLength = ({ field, minLength, value }) =>
  value.length >= minLength
    ? Success(value)
    : Failure([
        ValidationError(
          field,
          `${field} must have at least ${minLength} characters`
        )
      ])

const matchRegExp = ({ field, regexp, value, message = '' }) =>
  regexp.test(value)
    ? Success(value)
    : Failure([
        ValidationError(field, message || `${field} must match ${regexp}`)
      ])

const validEmail = ({ field, value }) =>
  matchRegExp({
    field,
    regexp: /\w+@\w+\.\w{2,}/,
    value,
    message: 'Not a valid email'
  })

const uniqueEmail = ({ field, value, message }) =>
  value === 'foo@bar.com'
    ? Failure([ValidationError(field, message)])
    : Success(value)

const validators = {
  notEmpty,
  minLength,
  matchRegExp,
  validEmail,
  uniqueEmail
}

const userRules = [
  {
    field: 'username',
    rule: 'notEmpty'
  },
  {
    field: 'username',
    rule: 'minLength',
    minLength: 6
  },
  {
    field: 'password',
    rule: 'notEmpty'
  },
  {
    field: 'password',
    rule: 'minLength',
    minLength: 8
  },
  {
    field: 'email',
    rule: 'validEmail',
    message: 'Not a valid email'
  },
  {
    field: 'email',
    rule: 'uniqueEmail',
    message: 'Email is in use'
  }
]

const validateWithRules = rules => data => {
  const applyRule = x => validators[x.rule]({ ...x, value: data[x.field] })
  return R.reduce(R.concat, Success(), R.map(applyRule, rules)).map(
    R.always(data)
  )
}

const validateUser = validateWithRules(userRules)
const user = {
  username: 'foobar',
  password: '12345678',
  email: 'foobar@bar.com'
}
// Validate user, version 1
/* const res = validateUser(user)

  const validateToApi = res.matchWith({
    Success: R.prop('value'),
    Failure: R.compose(
      R.map(R.pick(['field', 'message'])),
      R.prop('value')
      )
    })

    console.log('Validation result', res.toString())
    console.log('API errors', validateToApi)
    */

// Version 2 -> con clausuras
/* const fns = rulesToValidators(validators)(userRules)
const data = userRules.map(
  R.compose(
    R.assoc('value'),
    Maybe.fromNullable,
    R.flip(R.prop)(user),
    R.prop('field')
  )
)
 */

const createValidator = validators => rules => {
  // getRule :: [Rule] -> {RuleConfig} -> Maybe f
  const getRule = R.curry((validators, ruleConfig) => {
    return Maybe.fromNullable(R.prop(ruleConfig.rule, validators))
  })
  // rulesToValidators :: { validator: validatorFn } -> [{Rule}] -> [validatorFn]
  const rulesToValidators = validators => R.map(getRule(validators))
  // validate :: Maybe f, Maybe a -> Maybe f(a)
  const validate = (mFn, mValue) => mFn.ap(mValue).join()

  const fns = rulesToValidators(validators)(rules)

  return data => {
    const fnArgs = rules.map(r =>
      Maybe.fromNullable(R.prop(r.field, data)).map(v => R.assoc('value', v, r))
    )
    const results = R.zipWith(validate, fns.filter(m => !m.isNothing()), fnArgs)
    //console.log('validation results', results)
    return R.reduce(R.concat, Success(), results).map(R.always(data))
  }
}

const userValidator = createValidator(validators)(userRules)
const res = userValidator(user)
const validateToApi = res.matchWith({
  Success: R.prop('value'),
  Failure: R.compose(
    R.map(R.pick(['field', 'message'])),
    R.prop('value')
  )
})

console.log('Validation result', res.toString())
console.log('API result', validateToApi)
