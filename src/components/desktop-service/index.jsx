import { useEffect, useState } from 'react'
import global from '../../web-sh/src/config/global'
import storeActions from '../../store/actions'

import authServices from '../../services/auth'

import { useSelector } from 'react-redux'

import PairingConfirmModal from './PairingConfirm'

function DesktopService() {
  const userInfo = useSelector((state) => state.auth.userInfo);
  const signInReload = useSelector((state) => state.auth.signInReload);

  const [pairingVisible, setPairingVisible] = useState(false);

  useEffect(() => {
    getServiceStatus();
  }, [])

  const getServiceStatus = async () => {
    const isConnected = await service.getServiceStatus();
    global.store.dispatch(storeActions.updateIsConnected(isConnected))
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
