const authConfig = {
  domain: process.env.REACT_APP_AUTH0_DOMAIN,
  clientId: process.env.REACT_APP_AUTH0_CLIENT_ID,
  authorizationParams: {
    redirect_uri: process.env.REACT_APP_AUTH0_REDIRECT_URI,
    audience: process.env.REACT_APP_AUTH0_AUDIENCE
  }
};

export default authConfig;
