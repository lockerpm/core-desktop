import React, { } from "react";
import { useSelector } from 'react-redux';
import { useTranslation } from "react-i18next";

import {
  Card,
  Button
} from '@lockerpm/design';

import {
  ReloadOutlined
} from "@ant-design/icons";

import { } from '@ant-design/colors';

import global from "../../web-sh/src/config/global";

const PairingForm = (props) => {
  const { t } = useTranslation()
  const {
    callingAPI = false,
    onConfirm = () => {}
  } = props;

  const approveCode = useSelector((state) => state.service.approveCode)
  const clientId = useSelector((state) => state.service.clientId);
  const clientType = useSelector((state) => state.service.clientType);

  const resetClient = async () => {
    try {
      await service.resetPairingCode(clientId)
    } catch (error) {
      global.pushError(error)
    }
  }

  const confirmClient = async () => {
    try {
      await service.confirmPairingClient(clientId, clientType);
      onConfirm();
    } catch (error) {
      global.pushError(error)
    }
  }

  return (
    <div className="pairing-form text-center">
      <div>
        <p className="mb-10 mt-6 text-left">
          {t('passwordless.confirm_code')}
        </p>
        {
          approveCode && <div className="flex justify-center">
            <Card className="mb-6 w-full" bodyStyle={{ padding: '6px 24px' }}>
              <p className="font-semibold text-xl">{approveCode}</p>
            </Card>
          </div>
        }
        {
          approveCode ? <Button
            type="primary"
            className="w-full"
            size="large"
            loading={callingAPI}
            onClick={() => confirmClient()}
          >
            {t('button.confirm')}
          </Button> : <Button
            type="primary"
            size="large"
            className="w-full"
            onClick={() => service.sendPairingRequest()}
          >
            {t('button.continue')}
          </Button>
        }
        {
          approveCode && <div>
            <Button
              type="text"
              size="large"
              className="mt-2 w-full"
              icon={<ReloadOutlined />}
              onClick={() => resetClient()}
            >
              {t('passwordless.reset_code')}
            </Button>
          </div>
        }
      </div>
    </div> 
  );
}

export default PairingForm;