import React, { } from "react";
import { } from 'react-redux';
import { useTranslation } from "react-i18next";

import {
  Modal,
} from '@lockerpm/design';

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