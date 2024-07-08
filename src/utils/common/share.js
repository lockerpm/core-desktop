import { Utils } from "../../web-sh/src/core-js/src/misc/utils";

const getPublicShareUrl = (send) => {
  const accessId = send.accessId;
  const key = Utils.fromBufferToUrlB64(send.key)
  return `${process.env.REACT_APP_BASE_URL}/quick-shares/${accessId}#${encodeURIComponent(
    key
  )}`
}

export default {
  getPublicShareUrl,
}