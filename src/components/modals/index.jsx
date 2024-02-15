import modals from "../../web-sh/src/components/modals";

import PasswordConfirmModal from "./PasswordConfirm";
import PairingConfirmModal from "./PairingConfirm";

modals.PasswordConfirmModal = PasswordConfirmModal;

const modalsComponents = {
  ...modals,
  PairingConfirmModal
}

export default modalsComponents