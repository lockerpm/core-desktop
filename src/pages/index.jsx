import pages from "../web-sh/src/pages";

import auth from "./auth";
import admin from "./admin";
export default {
  ...pages,
  ...auth,
  ...admin,
}