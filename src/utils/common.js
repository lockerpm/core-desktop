import common from "../web-sh/src/utils/common";
import global from "../web-sh/src/config/global";

const openNewTab = (link) => {
  const regex = global.patterns.LINK
  if (regex.test(link)) {
    System.Diagnostics.Process.Start(link);
  } else {
    global.pushError(t('validation', { name: 'URL' }))
  }
}

export default {
  ...common,
  openNewTab,
}