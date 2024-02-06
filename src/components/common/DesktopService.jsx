import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import desktopModalsComponents from '../modals'

import authServices from '../../services/auth'
import storeActions from '../../store/actions'

import global from '../../web-sh/src/config/global'

const { PairingConfirmModal } = desktopModalsComponents;

function DesktopService() {
  const userInfo = useSelector((state) => state.auth.userInfo);
  const signInReload = useSelector((state) => state.auth.signInReload);

  const [pairingVisible, setPairingVisible] = useState(false);

  useEffect(() => {
    getServiceStatus();
  }, [])

  const getServiceStatus = async (retry = 0) => {
    global.store.dispatch(storeActions.toggleLoading(true));
    const isConnected = await service.getServiceStatus();
    global.store.dispatch(storeActions.updateIsConnected(isConnected));
    if (!isConnected && retry < 4) {
      console.log(`Service is not ready, retry ${retry + 1} time(s)`)
      await service.resetGRPC()
      getServiceStatus(retry + 1)
    } else {
      console.log(`Service is ready after retrying ${retry} time(s)`)
      global.store.dispatch(storeActions.toggleLoading(false));
    }
  }

  service.onEvent(async (e, event, data) => {
    switch (event) {
      case 'serviceReady':
        global.store.dispatch(storeActions.updateIsConnected(true));
        break;
      case 'pairingConfirmation':
        global.store.dispatch(storeActions.updateApproveCode(data.approveCode));
        global.store.dispatch(storeActions.updateClientId(data.clientId));
        global.store.dispatch(storeActions.updateClientType(data.clientType));
        setPairingVisible(true)
        break;
      case 'pairingConfirmed':
        setPairingVisible(false)
        break;
      case 'fidoRequestTouch':
        global.store.dispatch(storeActions.updateIsTouch(true));
        break;
      case 'fidoRequestFingerprint':
        global.store.dispatch(storeActions.updateIsFingerprint(true));
        break;
      case 'customMessageReceived':
        if (data.signInReload) {
          global.store.dispatch(storeActions.updateSignInReload(!signInReload));
        }
        break;
      case 'userLogin':
        break;
      case 'userLock':
        if (data.email === userInfo?.email && userInfo?.sync_all_platforms) {
          authServices.redirect_login();
        }
        break;
      case 'userLogout':
        if (data.email === userInfo?.email && userInfo?.sync_all_platforms) {
          await service.logout();
          authServices.logout();
        }
        break;
      default:
        break;
    }
  })

  return (
    <>
      <PairingConfirmModal
        visible={pairingVisible}
        onClose={() => setPairingVisible(false)}
      />
    </>
  )
}

export default DesktopService