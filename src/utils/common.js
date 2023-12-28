import common from "../web-sh/src/utils/common";
import global from "../web-sh/src/config/global";

const openNewTab = (link) => {
  const regex = global.patterns.LINK
  if (regex.test(link)) {
    service.openShellUrl(link);
  } else {
    global.pushError(t('validation', { name: 'URL' }))
  }
}

const getPublicShareUrl = (send) => {
  const accessId = send.accessId;
  const key = Utils.fromBufferToUrlB64(send.key)
  return `${process.env.REACT_APP_BASE_URL}/quick-shares/${accessId}#${encodeURIComponent(
    key
  )}`
}

const ssoRedirectUri = () => {
  return `${process.env.REACT_APP_BASE_URL}/sign-in?client_id=${global.constants.CLIENT_ID}`;
}

const redirectToAuthSSO = () => {
  service.openShellUrl(ssoRedirectUri());
}


common.openNewTab = openNewTab;
common.getPublicShareUrl = getPublicShareUrl;
common.ssoRedirectUri = ssoRedirectUri;
common.redirectToAuthSSO = redirectToAuthSSO;

export default {
  ...common,
}