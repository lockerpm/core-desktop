/* eslint-disable no-import-assign */
import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from 'react-redux';
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from 'react-router-dom';

import {
  Card,
  Input,
  Form,
  Button,
  Avatar,
  Row,
  Col,
  Spin
} from '@lockerpm/design';

import {
  ArrowLeftOutlined,
  UsbOutlined
} from "@ant-design/icons";

import formsComponents from "../../components/forms";;
import authComponents from "./components";

import images from "../../assets/images";

import commonServices from "../../services/common";
import authServices from "../../services/auth";

import global from "../../web-sh/src/config/global";
import common from "../../utils/common";

import '../../web-sh/src/pages/auth/css/auth.scss';

const { SecurityKey } = formsComponents;
const { Logo } = authComponents;

const { AuthBgImage } = images;

const Lock = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const isConnected = useSelector((state) => state.service.isConnected)
  const locale = useSelector((state) => state.system.locale);
  const userInfo = useSelector((state) => state.auth.userInfo);
  const isLoading = useSelector((state) => state.system.isLoading);

  const [loading, setLoading] = useState(false);
  const [callingAPI, setCallingAPI] = useState(false);
  const [logging, setLogging] = useState(false);
  const [form] = Form.useForm();
  const [serviceUser, setServiceUser] = useState(false)
  const [step, setStep] = useState(0);
  const [otherMethod, setOtherMethod] = useState(null)

  const query = common.convertStringToQuery(location.search);

  useEffect(() => {
    commonServices.fetch_user_info();
  }, [])

  useEffect(() => {
    if (userInfo?.email) {
      if (!userInfo?.is_factor2 && userInfo?.require_2fa && userInfo?.is_password_changed) {
        global.navigate(global.keys.SETUP_2FA, {}, { email: preLogin.email });
      } else if (!userInfo.is_password_changed || (userInfo.is_require_passwordless && userInfo.login_method === 'password')) {
        global.navigate(global.keys.AUTHENTICATE, {}, { email: userInfo.email })
      } else {
        getServiceUser();
      }
    }
  }, [userInfo?.email, isConnected])

  useEffect(() => {
    if (step === 1 && userInfo?.login_method === 'passwordless') {
      setOtherMethod('security_key');
    }
  }, [userInfo, step]);


  const description = useMemo(() => {
    if (userInfo?.sync_all_platforms) {
      return t('lock.cross_platform_sync_enable')
    }
    return userInfo?.login_method === 'passwordless' ? t('lock.connect_key') : t('lock.description')
  }, [userInfo])

  const handleUnlock = async () => {
    if (serviceUser) {
      await handleSubmit(serviceUser)
    } else {
      form.validateFields().then(async (values) => {
        await handleSubmit(values)
      })
    }
  }

  const handleSubmit = async (values) => {
    setCallingAPI(true);
    const payload = {
      ...values,
      keyB64: values.key,
      email: userInfo.email,
      username: userInfo.email,
      sync_all_platforms: userInfo.sync_all_platforms,
      unlock_method: values.unlock_method || otherMethod
    }
    await commonServices.unlock_to_vault(payload, query, () => {
      const returnUrl = query?.return_url ? decodeURIComponent(query?.return_url) : '/';
      navigate(returnUrl);
    })
    setCallingAPI(false)
  }

  const getServiceUser = async () => {
    setLoading(true);
    if (userInfo?.sync_all_platforms) {
      if (isConnected) {
        try {
          const serviceUser = await service.getCurrentUser();
          if (serviceUser?.email === userInfo.email) {
            const cacheData = await service.getCacheData();
            setOtherMethod(cacheData?.unlock_method || null);
            setServiceUser(serviceUser);
          } else {
            setStep(1)
          }
        } catch (error) {
          await commonServices.reset_service();
          setStep(1)
        }
      } else {
        setStep(1)
      }
    } else {
      setStep(1)
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    setLogging(true);
    await authServices.logout();
    setLogging(false);
  }

  const Footer = <Row gutter={[8, 0]}>
    <Col span={12}>
      <Button
        className="w-full"
        size="large"
        htmlType="submit"
        disabled={callingAPI}
        loading={logging}
        onClick={() => handleLogout()}
      >
        {t('sidebar.logout')}
      </Button>
    </Col>
    <Col span={12}>
      <Button
        className="w-full"
        size="large"
        type="primary"
        htmlType="submit"
        disabled={logging}
        loading={callingAPI}
        onClick={handleUnlock}
      >
        {t('lock.unlock')}
      </Button>
    </Col>
  </Row>

  return (
    <Spin spinning={isLoading || loading}>
      <div
        className="auth-page"
      >
        <div
          className="w-[600px]"
          style={{
            backgroundImage: `url(${AuthBgImage})`,
            backgroundSize: 'contain',
            paddingTop: 62,
            height: 'max-content'
          }}
        >
          <Logo />
          <div className="flex items-center justify-center">
            <Card
              className="w-[430px]"
              bodyStyle={{
                padding: '32px'
              }}
            >
              <div className="w-full flex items-center">
                {
                  step > 1 && <Button
                    className="mr-2"
                    type={'text'}
                    icon={<ArrowLeftOutlined />}
                    onClick={() => setStep(step - 1)}
                  />
                }
                <p className="text-2xl font-semibold">
                  {t('lock.title')}
                </p>
              </div>
              <p className="mb-6 mt-2">
                {description}
              </p>
              <Form
                form={form}
                key={locale}
              >
                <Form.Item>
                  <Input
                    placeholder={t('auth_pages.username')}
                    prefix={
                      <Avatar
                        src={userInfo?.avatar}
                      >
                        {userInfo?.email.slice(0, 1)?.toUpperCase()}
                      </Avatar>
                    }
                    value={userInfo?.name || userInfo?.email}
                    size="large"
                    readOnly={true}
                  />
                </Form.Item>
                <div>
                  {
                    !!serviceUser && <div>
                      {Footer}
                    </div>
                  }
                  {
                    !serviceUser && <div>
                      {
                        step === 1 && !otherMethod && <div>
                          {
                            userInfo?.login_method === 'password' && <div>
                              <Form.Item
                                name="password"
                                noStyle
                                rules={[
                                  global.rules.REQUIRED(t('lock.password')),
                                ]}
                              >
                                <Input.Password
                                  placeholder={t('lock.password')}
                                  size="large"
                                  disabled={callingAPI || logging}
                                  onPressEnter={handleUnlock}
                                />
                              </Form.Item>
                              <div className="mt-6">
                                {Footer}
                              </div>
                            </div>
                          }
                          <div>
                            {
                              userInfo?.login_method === 'password' && <p className="my-4 text-center">
                                {t('auth_pages.sign_in.or_login_with')}
                              </p>
                            }
                            <Button
                              className="w-full"
                              size="large"
                              ghost
                              type="primary"
                              icon={<UsbOutlined />}
                              disabled={loading || callingAPI}
                              onClick={() => setOtherMethod('security_key')}
                            >
                              {t('auth_pages.sign_in.your_security_key')}
                            </Button>
                          </div>
                        </div>
                      }
                      {
                        step === 1 && otherMethod === 'security_key' && <div>
                          <SecurityKey
                            changing={callingAPI}
                            isLogin={true}
                            userInfo={userInfo}
                            onConfirm={(password) => handleSubmit({
                              password
                            })}
                          />
                        </div>
                      }
                      {
                        !callingAPI && <Button
                          className="w-full mt-6"
                          size="large"
                          htmlType="submit"
                          loading={logging}
                          onClick={() => handleLogout()}
                        >
                          {t('sidebar.logout')}
                        </Button>
                      }
                    </div>
                  }
                </div>
              </Form>
            </Card>
          </div>
        </div>
      </div>
    </Spin>
  );
}

export default Lock;