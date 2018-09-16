const R = require('ramda')
const { createStore } = require('redux')
const initialState = {}

const TYPES = {
  INIT_FORM: 'INIT_FORM',
  DESTROY_FORM: 'DESTROY_FORM',
  CHANGE_FIELD: 'CHANGE_FIELD',
  FOCUS_FIELD: 'FOCUS_FIELD',
  BLUR_FIELD: 'BLUR_FIELD',
  SET_VALIDITY: 'SET_VALIDITY'
}

const buildReducer = (initialState, actionHandlers) => (
  state = initialState,
  action
) =>
  R.is(Function, R.prop(action.type, actionHandlers))
    ? actionHandlers[action.type](state, action)
    : state

const formReducer = buildReducer(initialState, {
  [TYPES.INIT_FORM]: (state, { payload: { form } }) =>
    R.assocPath([form], {}, state),

  [TYPES.DESTROY_FORM]: (state, { payload: { form } }) =>
    R.dissocPath([form], state),

  [TYPES.CHANGE_FIELD]: (state, { payload: { form, field, value } }) =>
    R.assocPath([form, 'values', field], value, state),

  [TYPES.FOCUS_FIELD]: (state, { payload: { form, field } }) =>
    R.assocPath([form, 'meta', field, 'focus'], true, state),

  [TYPES.BLUR_FIELD]: (state, { payload: { form, field } }) =>
    R.assocPath([form, 'meta', field, 'focus'], false, state),

  [TYPES.SET_VALIDITY]: (state, { payload: { form, field, isValid } }) =>
    R.assocPath([form, 'meta', field, 'valid'], !!isValid, state)
})

const store = createStore(formReducer)

store.subscribe(() =>
  console.log('New State', JSON.stringify(store.getState(), null, 2))
)

store.dispatch({
  type: TYPES.FOCUS_FIELD,
  payload: { form: 'test_form', field: 'username' }
})
store.dispatch({
  type: TYPES.CHANGE_FIELD,
  payload: {
    form: 'test_form',
    field: 'username',
    value: 'Winnie'
  }
})

store.dispatch({
  type: TYPES.BLUR_FIELD,
  payload: { form: 'test_form', field: 'username' }
})

store.dispatch({
  type: TYPES.SET_VALIDITY,
  payload: { form: 'test_form', field: 'username', isValid: false }
})

store.dispatch({
  type: TYPES.DESTROY_FORM,
  payload: { form: 'test_form' }
})
