import { getCollection } from "$lib/firebase/firestore";
import { limit, orderBy } from "firebase/firestore";

import { redirect, error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
type Todo = {
  uid: string;
  created_at: Date;
  text: string;
  done: boolean;
  pending_delete: boolean;
};
export const load: PageLoad = async () => {
  try {
    const todos = await getCollection<Todo>(`todos`, [
      limit(5),
      orderBy("updatedAt", "desc"),
    ]);
    if (todos) {
      return { todos };
    } else {
      throw redirect(301, "/");
    }
  } catch (err) {
    throw error(500, err);
  }
};
// export const load: PageLoad = async ({ locals }) => {
// locals.userid comes from src/hooks.server.ts
// console.log({ locals });
// const todos = await getCollection<Todo>(`user/${locals.userid}/todos`, [
//   limit(20),
//   orderBy("updatedAt", "desc"),
// ]);
// return { todos };
// };

// export const actions: Actions = {
//   add: async ({ request, locals }) => {
//     const form = await request.formData();

//     await api("POST", `todos/${locals.userid}`, {
//       text: form.get("text"),
//     });
//   },
//   edit: async ({ request, locals }) => {
//     const form = await request.formData();

//     await api("PATCH", `todos/${locals.userid}/${form.get("uid")}`, {
//       text: form.get("text"),
//     });
//   },
//   toggle: async ({ request, locals }) => {
//     const form = await request.formData();

//     await api("PATCH", `todos/${locals.userid}/${form.get("uid")}`, {
//       done: !!form.get("done"),
//     });
//   },
//   delete: async ({ request, locals }) => {
//     const form = await request.formData();

//     await api("DELETE", `todos/${locals.userid}/${form.get("uid")}`);
//   },
// };
