import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";
import LocaleProvider from "./utils/provider";
import App from "./App";

import reportWebVitals from "./web-sh/src/reportWebVitals";

import i18n from './config/i18n';
import { I18nextProvider } from 'react-i18next';

import "./web-sh/src/index.css";

const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(
  <React.Fragment>
    <Provider store={store}>
      <LocaleProvider>
        <HashRouter>
          <I18nextProvider i18n={i18n}>
            <App />
          </I18nextProvider>
        </HashRouter>
      </LocaleProvider>
    </Provider>
  </React.Fragment>
);

reportWebVitals();
