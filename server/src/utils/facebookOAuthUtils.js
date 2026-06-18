const axios = require("axios");

const verifyFacebookToken = async (accessToken) => {
  if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
    return null;
  }

  const appToken = `${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET}`;

  const debugResponse = await axios.get(
    "https://graph.facebook.com/debug_token",
    {
      params: {
        input_token: accessToken,
        access_token: appToken,
      },
    },
  );

  if (!debugResponse.data?.data?.is_valid) {
    return null;
  }

  const profileResponse = await axios.get("https://graph.facebook.com/me", {
    params: {
      fields: "id,name,email",
      access_token: accessToken,
    },
  });

  return {
    email: profileResponse.data.email,
    name: profileResponse.data.name,
    providerId: profileResponse.data.id,
    emailVerified: true,
  };
};

module.exports = { verifyFacebookToken };
