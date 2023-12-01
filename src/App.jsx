import React, { useEffect } from 'react'
import { Layout, Modal, notification } from '@lockerpm/design'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

import {
  ExclamationCircleOutlined
} from '@ant-design/icons'

import './assets/css/index.scss'

import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import 'react-phone-number-input/style.css'

import { navigatePage } from './web-sh/src/utils/navigate'
import { DesktopService } from './components'

import common from './utils/common'

import AdminLayout from './web-sh/src/layouts/admin'
import AuthLayout from './web-sh/src/layouts/auth'
import ErrorsLayout from './web-sh/src/layouts/errors'
import PublicLayout from './web-sh/src/layouts/public'

import systemServices from './services/system'
import commonServices from './services/common'

import storeActions from './store/actions'

import i18n from './config/i18n'
import global from './web-sh/src/config/global'
import jsCore from './web-sh/src/core-js/index'

import pages from './pages'

const App = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const location = useLocation()

  notification.config({ placement: 'bottomLeft', duration: 3 })
  global.notification = (type, message, description) => { notification[type]({ message, description })}
  global.navigate = (name, params = {}, query = {}) => navigatePage(navigate, dispatch, name, params, query)
  global.pushSuccess = message => {
    global.notification(
      'success',
      t('notification.success.title'),
      message
    )
  }
  global.pushError = error => {
    const message = error?.response?.data?.message || error?.message
    global.notification(
      'error',
      t('notification.error.title'),
      message || t('notification.error.message.default')
    )
  }
  global.confirm = (handleOK = () => {}, options = {}) => Modal.confirm({
    title: options.title || t('common.confirm'),
    icon: <ExclamationCircleOutlined />,
    content: options.content || t('common.delete_question'),
    okText: options.okText || t('button.delete'),
    cancelText: t('button.cancel'),
    okButtonProps: options.okButtonProps || { danger: true },
    onOk: handleOK
  })

  const userInfo = useSelector(state => state.auth.userInfo)
  const currentPage = useSelector(state => state.system.currentPage)

  useEffect(() => {
    commonServices.init_server();
    const locale = systemServices.get_language()
    dispatch(storeActions.changeLanguage(locale))
    dispatch(storeActions.updateIsDesktop(true))
    global.store.dispatch(storeActions.updateIsConnected(true))
    i18n.changeLanguage(locale)
    initJsCore()
  }, [])

  useEffect(() => {
    const currentPage = common.getRouterByLocation(location)
    dispatch(storeActions.updateCurrentPage(currentPage))
  }, [location])

  const initJsCore = async () => {
    if (!global.jsCore) {
      global.jsCore = await jsCore()
    }
  }

  return (
    <Layout>
      <DesktopService />
      {
        currentPage?.type === 'admin' && userInfo && <AdminLayout
          routers={global.routers.ADMIN_ROUTERS}
          pages={pages}
        />
      }
      {
        currentPage?.type === 'auth' && <AuthLayout
          routers={global.routers.AUTH_ROUTERS}
          pages={pages}
        />
      }
      {
        currentPage?.type === 'error' && <ErrorsLayout
          routers={global.routers.ERROR_ROUTERS}
          pages={pages}
        />
      }
      {
        currentPage?.type === 'public' && <PublicLayout
          routers={global.routers.PUBLIC_ROUTERS}
          pages={pages}
        />
      }
    </Layout>
  )
}

export default App
