import actions from '../../web-sh/src/store/actions'
import authActions from './auth'

export default {
  ...actions,
  ...authActions
}