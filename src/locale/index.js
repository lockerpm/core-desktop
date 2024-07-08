
import EN from '../web-sh/src/locale/en.json';
import VI from '../web-sh/src/locale/vi.json';
import ZH from '../web-sh/src/locale/zh.json';

import en from './en.json';
import vi from './vi.json';
import zh from './zh.json';

const mergeJsonContent = (oldData, newData) => {
  if (!newData) {
    return oldData
  }
  if (typeof oldData !== 'object') {
    return newData || oldData
  }
  const jsonData = { ...oldData, ...newData }
  const keys = Object.keys(jsonData)
  keys.forEach(key => {
    jsonData[key] = mergeJsonContent(oldData[key], newData[key])
  });
  return jsonData;
}

export default {
  mergeJsonContent,
  en: mergeJsonContent(EN, en),
  vi: mergeJsonContent(VI, vi),
  zh: mergeJsonContent(ZH, zh),
}