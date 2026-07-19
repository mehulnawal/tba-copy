const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const verifyGoogleToken = async (idToken) => {
  if (!process.env.GOOGLE_CLIENT_ID) return null;
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return {
    email: payload.email,
    name: payload.name,
    providerId: payload.sub,
    emailVerified: payload.email_verified,
  };
};

const verifyGoogleAccessToken = async (accessToken) => {
  if (!process.env.GOOGLE_CLIENT_ID) return null;
  const { data } = await axios.get(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  return {
    email: data.email,
    name: data.name,
    providerId: data.sub,
    emailVerified: data.email_verified,
  };
};

module.exports = { verifyGoogleToken, verifyGoogleAccessToken };
