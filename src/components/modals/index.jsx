import modalsComponents from "../../web-sh/src/components/modals";

import PasswordConfirmModal from "./PasswordConfirm";
import PairingConfirmModal from "./PairingConfirm";

modalsComponents.PasswordConfirmModal = PasswordConfirmModal;

const desktopModalsComponents = {
  ...modalsComponents,
  PairingConfirmModal
}

export default desktopModalsComponents