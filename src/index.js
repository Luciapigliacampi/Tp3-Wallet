import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Auth0Provider } from '@auth0/auth0-react';

const domain = 'dev-8z4fhyln1sr7ues7.us.auth0.com';
const clientId = 'gg1xBiTPgSNUIO2DbA5HQ6t7I3nClenl';
const audience = 'https://dev-8z4fhyln1sr7ues7.us.auth0.com/api/v2/'; // <- después lo agregás acá

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        // audience: audience, // descomentá esta línea cuando agregues el audience
      }}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);

reportWebVitals();



