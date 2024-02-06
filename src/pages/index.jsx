import auth from "./auth";
import admin from "./admin";

import pages from "../web-sh/src/pages";

export default {
  ...pages,
  ...auth,
  ...admin,
}