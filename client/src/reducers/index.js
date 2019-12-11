import { combineReducers } from 'redux';

import auth from './auth';
import error from './error';
import list from './list';
import loading from './loading';
import notification from './notifications';

export default combineReducers({ auth, error, list, loading, notification });
