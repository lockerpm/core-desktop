import React, { } from "react";
import {
  Modal,
} from '@lockerpm/design';

import { } from 'react-redux';
import { } from '@ant-design/colors';

import { useTranslation } from "react-i18next";
import { } from "@ant-design/icons";

import formsComponents from "../forms";

const { Pairing } = formsComponents;

const PairingConfirmModal = (props) => {
  const { t } = useTranslation()
  const {
    visible = false,
    onClose = () => {},
  } = props;

  return (
    <Modal
      title={t('')}
      open={visible}
      onCancel={onClose}
      width={460}
      footer={false}
    >
      <Pairing
        onConfirm={onClose}
      />
    </Modal>
  );
}

export default PairingConfirmModal;