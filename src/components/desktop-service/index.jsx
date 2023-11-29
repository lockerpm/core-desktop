import { useEffect, useState } from 'react'
import global from '../../web-sh/src/config/global'
import storeActions from '../../store/actions'

import authServices from '../../services/auth'

import { useSelector } from 'react-redux'

function DesktopService() {
  const userInfo = useSelector((state) => state.auth.userInfo);

  useEffect(() => {
    service.onEvent(async (e, event, data) => {
      switch (event) {
        case 'serviceReady':
          global.store.dispatch(storeActions.updateIsReady(true))
          break;
        case 'pairingConfirmation':
          global.store.dispatch(storeActions.updateApproveCode(data.approveCode));
          global.store.dispatch(storeActions.updateClientId(data.clientId));
          global.store.dispatch(storeActions.updateClientType(data.clientType));
          break;
        case 'pairingConfirmed':
          global.store.dispatch(storeActions.updateIsReady(true))
        break;
        case 'fidoRequestTouch':
          global.store.dispatch(storeActions.updateIsTouch(true));
        break;
        case 'fidoRequestFingerprint':
          global.store.dispatch(storeActions.updateIsFingerprint(true));
        break;
        case 'userLogin':
          global.store.dispatch(storeActions.updateIsReady(true))
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
  }, [userInfo])

  return (
    <></>
  )
}

export default DesktopService
