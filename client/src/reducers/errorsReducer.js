import { GET_ERRORS } from '../actions/types';


//import isEmpty from "validator/es/lib/isEmpty";

//import { SET_CURRENT_USER } from '../actions/types';

const initialState = {};

export default function (state = initialState,action) {
    switch (action.type) {
        case GET_ERRORS:
            return action.payload;
        default:
            return state;
    }
}