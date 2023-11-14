import auth from "../../../web-sh/src/store/reducers/modules/auth"
import initial from "../../initial"

const userInfo = (state = initial.auth, action) => {
  switch (action.type) {
    default:
      return auth(state, action);
  }
};

export default userInfo;
