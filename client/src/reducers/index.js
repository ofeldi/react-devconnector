import { combineReducers } from 'redux';
import authReducer from './authReducers';
import errorsReducer from './errorsReducer';

export default combineReducers({
    auth:authReducer,
    errors:errorsReducer
})