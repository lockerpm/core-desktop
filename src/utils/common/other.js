import global from '../../config/global'
import { Trans } from 'react-i18next'

const openNewTab = (link, openBrowser = true) => {
  const regex = global.patterns.LINK
  if (regex.test(link)) {
    let newLink = link
    if (!link.includes('http')) {
      newLink = `http://${link}`
    }
    if (openBrowser) {
      service.openShellUrl(newLink);
    } else {
      window.open(link, '_blank', "popup")
    }
  } else {
    global.pushError({ message: <Trans i18nKey='validation' values={{ name: 'URL'}}/>})
  }
}

const ssoRedirectUri = () => {
  return `${process.env.REACT_APP_BASE_URL}/sign-in?client_id=${global.constants.CLIENT_ID}`;
}

const redirectToAuthSSO = () => {
  service.openShellUrl(ssoRedirectUri());
}

const getPlatform = async () => {
  const result = await navigator.userAgentData.getHighEntropyValues(['architecture'])
  if (result.platform === 'Windows') {
    return 'windows'
  }
  if (result.platform.includes('mac')) {
    if (result.architecture === 'arm') {
      return 'mac-arm64'
    }
    return 'mac-x64'
  }
  return 'linux'
}

export default {
  openNewTab,
  ssoRedirectUri,
  redirectToAuthSSO,
  getPlatform,
}