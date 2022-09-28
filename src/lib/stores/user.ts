import { browser } from "$app/environment";
import type { Auth, User } from "firebase/auth";
import { get, derived, type Readable } from "svelte/store";
import { auth } from "./auth";

// the user store reflects the client-side auth state
function createUser() {
  const { subscribe } = derived<Readable<Auth>, User | null>(
    auth,
    ($auth, set) => {
      let unsubscribe = () => {};

      async function init() {
        if ($auth) {
          const { onAuthStateChanged } = await import("firebase/auth");
          unsubscribe = onAuthStateChanged($auth, set);
        }
      }

      if (browser) init();

      return unsubscribe;
    }
  );

  return { subscribe };
}

export const user = createUser();
export const getUid = () => {
  const u = get(user);
  return (u && u.uid) || "anonymous"; // 'anonymous' allows support messages to be saved by non-logged-in users
};
