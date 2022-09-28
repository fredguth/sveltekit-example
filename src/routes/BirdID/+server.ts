// Custom authentication provider example

import { createCustomToken } from "$lib/firebase/admin";
import { auth } from "$lib/stores/auth";
import type { RequestHandler } from "@sveltejs/kit";
import { dev } from "$app/environment";
import {
  PUBLIC_BIRDID_CLIENT_ID_DEV,
  PUBLIC_BIRDID_CLIENT_ID,
  PUBLIC_BIRDID_CLIENT_SECRET_DEV,
  PUBLIC_BIRDID_CLIENT_SECRET,
} from "$env/static/public";

const client_id = dev ? PUBLIC_BIRDID_CLIENT_ID_DEV : PUBLIC_BIRDID_CLIENT_ID;
const client_secret = dev
  ? PUBLIC_BIRDID_CLIENT_SECRET_DEV
  : PUBLIC_BIRDID_CLIENT_SECRET;
export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const { username, password } = body;
  if (!username || !password) {
    return {
      status: 400,
      body: JSON.stringify({
        message: "CPF and OTP required.",
      }),
    };
  }
  const BirdID_URI = "https://api.birdid.com.br/v0/oauth";
  const getAccessTokenResponse = await fetch(`${BirdID_URI}/pwd_authorize`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id,
      client_secret,
      username,
      password,
      grant_type: "password",
      scope: "authentication_session",
    }),
  });
  if (!getAccessTokenResponse.ok) {
    const error = JSON.stringify(await getAccessTokenResponse.json());
    return {
      status: 401,
      body: JSON.stringify({
        message: "Failed to authenticate with BirdID: " + error,
      }),
    };
  }
  // authenticated by BirdId, authenticate at Firebase with CustomToken
  console.log("successfully authenticated with BirdId.");
  try {
    // successfully  authentication with BirdId and Firebase
    const token = await createCustomToken("birdid", username);
    await auth.signInWith("token", token);
    return {
      status: 302,
    };
  } catch (e) {
    // cannot authenticate to firebase
    console.log("error authenticating to firebase.");
    return {
      status: 500,
      body: JSON.stringify({
        message: "Error authenticating to firebase: " + e,
      }),
    };
  }
};
