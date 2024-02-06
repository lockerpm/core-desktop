import common from "../web-sh/src/services/common";

async function reset_service() {
  await service.resetGRPC();
}

async function service_login(data) {
  if (global.store.getState().service.isConnected) {
    const cacheData = await service.getCacheData();
    await service.setCacheData({ ...cacheData, unlock_method: data.unlock_method })
    let hashedPassword = data?.hashedPassword
    let key = data?.keyB64
    if (data.password) {
      const makeKey = await coreServices.make_key(data.email, data.password)
      hashedPassword = await global.jsCore.cryptoService.hashPassword(data.password, makeKey)
      key = makeKey.keyB64
    }
    await service.login({
      email: data.email,
      key: key,
      hashedPassword: hashedPassword
    })
  }
}

async function service_logout() {
  if (global.store.getState().service.isConnected) {
    try {
      await service.logout();
      await service.setCacheData({});
    } catch (error) {
    }
  }
}


common.reset_service = reset_service;
common.service_login = service_login;
common.service_logout = service_logout;

export default {
  ...common
};
