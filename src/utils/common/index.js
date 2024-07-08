import common from "../../web-sh/src/utils/common";
import other from "./other";
import share from "./share";


common.getPublicShareUrl = share.getPublicShareUrl;
common.openNewTab = other.openNewTab;
common.ssoRedirectUri = other.ssoRedirectUri;
common.redirectToAuthSSO = other.redirectToAuthSSO;

export default {
  ...common,
  ...other,
  ...share
}