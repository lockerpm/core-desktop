import common from "../web-sh/src/services/common";

async function reset_service() {
  await service.resetGRPC();
}

common.reset_service = reset_service;

export default {
  ...common
};
