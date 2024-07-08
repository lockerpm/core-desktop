import React, { } from 'react';
import moment from 'moment';
import { IntlProvider } from 'react-intl';
import { connect } from 'react-redux';

import { ConfigProvider } from '@lockerpm/design';

import vi_VN from '@lockerpm/design/es/locale/vi_VN';
import en_US from '@lockerpm/design/es/locale/en_US';
import locale from '../locale/index';

import 'moment/locale/vi';

import global from '../config/global';

const Locales = (props) => {
  const localeIntl = {
    locale: props.locale,
    messages: props.locale === global.constants.LANGUAGE.EN ? locale.en : locale.vi,
  };
  moment.locale(props.locale);
  return (
    <IntlProvider {...localeIntl}>
      <ConfigProvider
        locale={props.locale === global.constants.LANGUAGE.EN ? en_US : vi_VN}
      >
        {props.children}
      </ConfigProvider>
    </IntlProvider>
  );
};

export default connect(
  (state) => ({
    locale: state.system.locale,
  }),
  null
)(Locales);
