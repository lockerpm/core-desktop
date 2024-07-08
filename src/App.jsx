import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'

import {
  Layout,
  Modal,
  notification
} from '@lockerpm/design'

import {
  ExclamationCircleOutlined
} from '@ant-design/icons'

import commonComponents from './components/common'

import AdminLayout from './web-sh/src/layouts'
import OtherLayout from './web-sh/src/layouts/other'

import './components'
import pages from './pages'

import storeActions from './store/actions'
import commonServices from './services/common'

import i18n from './config/i18n'
import common from './utils/common'
import global from './config/global'
import jsCore from './web-sh/src/core-js/index'
import { navigatePage } from './web-sh/src/utils/navigate'

import './assets/css/index.scss'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

const { DesktopService } = commonComponents;

const App = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const location = useLocation()

  notification.config({ placement: 'bottomLeft', duration: 3 })
  global.notification = (type, message, description) => { notification[type]({ message, description }) }
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
  global.confirm = (handleOK = () => { }, options = {}) => Modal.confirm({
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
    const locale = common.getLanguage()
    dispatch(storeActions.changeLanguage(locale))
    i18n.changeLanguage(locale)
    initJsCore();
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
        currentPage?.type === 'auth' && <OtherLayout
          routers={global.routers.AUTH_ROUTERS}
          pages={pages}
        />
      }
      {
        currentPage?.type === 'error' && <OtherLayout
          routers={global.routers.ERROR_ROUTERS}
          pages={pages}
        />
      }
      {
        currentPage?.type === 'public' && <OtherLayout
          routers={global.routers.PUBLIC_ROUTERS}
          pages={pages}
        />
      }
    </Layout>
  )
}

export default App
