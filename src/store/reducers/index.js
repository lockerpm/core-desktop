import { combineReducers } from "redux";
import modules from "./modules";

const rootReducer = combineReducers({
  ...modules
});

export default rootReducer;
