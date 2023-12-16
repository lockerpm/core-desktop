import common from "../web-sh/src/services/common";

async function reset_service() {
  await service.resetGRPC();
}

export default {
  ...common,
  reset_service
};
