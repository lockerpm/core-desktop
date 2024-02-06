import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from 'react-redux';
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import {
  Card,
  Button,
} from '@lockerpm/design';

import {
  ArrowLeftOutlined
} from "@ant-design/icons";

import authFormsComponents from "../../../web-sh/src/pages/auth/components/forms";

import ssoConfigServices from "../../../web-sh/src/services/sso-config";
import authServices from "../../../services/auth";

import common from "../../../utils/common";

const { SignInForm } = authFormsComponents;

const Enterprise = (props) => {
  const {
    loading,
    onSubmit = () => { }
  } = props;
  const { t } = useTranslation();
  const isConnected = useSelector((state) => state.service.isConnected);
  const signInReload = useSelector((state) => state.auth.signInReload);

  const [step, setStep] = useState(0);
  const [ssoConfig, setSsoConfig] = useState(null);
  const [existed, setExisted] = useState(false);
  const [checking, setChecking] = useState(false);

  const ssoAccount = authServices.sso_account();

  useEffect(() => {
    checkExist();
  }, [])

  useEffect(() => {
    if (ssoConfig) {
      checkSsoConfig();
    }
  }, [isConnected, ssoConfig, signInReload])

  const checkExist = async () => {
    setChecking(true)
    const response = await ssoConfigServices.check_exists();
    setExisted(response?.existed)
    if (response?.existed) {
      const ssoConfig = response.sso_configuration;
      setSsoConfig(ssoConfig)
    } else {
      setSsoConfig(null)
      setStep(1)
    }
    setChecking(false)
  }

  const checkSsoConfig = async () => {
    if (isConnected) {
      if (step === 0) {
        setChecking(true)
        const cacheData = await service.getCacheData();
        if (cacheData?.email) {
          authServices.update_sso_account({ email: cacheData.email })
          setStep(1);
        }
        setChecking(false)
      }
    } else {
      setStep(0)
    }
  }

  const isBack = useMemo(() => {
    if (ssoAccount) {
      return step > 2
    }
    if (existed) {
      return step > 0
    }

    return step > 1
  })

  const signOtherAccount = () => {
    authServices.update_sso_account(null);
    if (isConnected) {
      service.setCacheData({})
    }
    setStep(0)
  }

  const redirectToAuthSSO = (ssoConfiguration) => {
    if (ssoConfiguration?.sso_provider_options?.authorization_endpoint) {
      common.redirectToAuthSSO(ssoConfiguration.sso_provider_options)
    } else {
      setStep(1)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-center">
        <Card
          className="w-[400px]"
          bodyStyle={{
            padding: '32px'
          }}
        >
          <div className="w-full flex items-center mb-6">
            {
              isBack && <Button
                className="mr-2"
                type={'text'}
                icon={<ArrowLeftOutlined />}
                onClick={() => setStep(step - 1)}
              />
            }
            <p className="text-2xl font-semibold">
              {t('auth_pages.sign_in.title')}
            </p>
          </div>
          {
            step === 0 && <div>
              <Button
                className="w-full"
                size="large"
                type="primary"
                loading={loading || checking}
                onClick={() => redirectToAuthSSO(ssoConfig)}
              >
                {t('auth_pages.sign_in.single_sign_on')}
              </Button>
            </div>
          }
          {
            step > 0 && <div>
              <SignInForm
                loading={loading}
                step={step}
                onSubmit={onSubmit}
                setStep={setStep}
              />
            </div>
          }
          {
            ssoAccount && <div className="mt-4 text-center">
              <span>
                {t('auth_pages.authenticate.note')}
                <Button
                  type="link"
                  className="font-semibold"
                  onClick={signOtherAccount}
                >
                  {t('auth_pages.sign_in.label')}
                </Button>
              </span>
            </div>
          }
        </Card>
      </div>
    </div>
  );
}

export default Enterprise;