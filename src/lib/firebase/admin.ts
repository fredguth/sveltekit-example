import { initializeApp } from "firebase-admin";
import { getAuth } from "firebase-admin/auth";

const useEmulator = true;

if (useEmulator) {
  process.env["FIREBASE_AUTH_EMULATOR_HOST"] = "127.0.0.1:9099";
}

// this is the server-side firebase client
export const app = initializeApp({ projectId: "fir-sveltekit-f2ad0" });
export const auth = getAuth(app);

export const createCustomToken = async (
  providerId: string,
  providerUid: string
) => {
  let token = null;
  try {
    const userId = `${providerId}:${providerUid}`;
    const customClaims = {
      cpf: providerUid,
      providerId,
      providerUid,
    };
    token = await auth.createCustomToken(userId, customClaims);
  } catch (e) {
    console.log({ e });
  }
  return token;
};
