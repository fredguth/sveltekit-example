// Forked from https://github.com/jacob-8/sveltefirets/
// Inspired by https://fireship.io/lessons/firestore-advanced-usage-angularfire/
import {
  type CollectionReference,
  type DocumentReference,
  type QueryConstraint,
  type PartialWithFieldValue,
  type WithFieldValue,
  type UpdateData,
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  addDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  getFirestore,
  enableIndexedDbPersistence,
  type Firestore,
} from "firebase/firestore";
import { browser } from "$app/environment";
import { getUid } from "$lib/stores/user";
import { app } from "$lib/stores/app";
import { get } from "svelte/store";

let db: Firestore;
async function getDb() {
  console.log("getDb...", db);
  if (db) return db;
  console.log("1 @ ", browser ? "browser" : "server");
  db = await getFirestore(get(app));
  if (browser) {
    console.log("3");
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code == "failed-precondition") {
        console.warn(
          "When multiple tabs open, Firestore persistence can only be enabled in one tab at a time."
        );
      } else if (err.code == "unimplemented") {
        console.warn(
          "The current browser does not support all of the features required to enable Firestore persistence."
        );
      }
    });
    return db;
  }
}

type CollectionPredicate<T> = string | CollectionReference<T>;
type DocPredicate<T> = string | DocumentReference<T>;

export function colRef<T>(ref: CollectionPredicate<T>): CollectionReference<T> {
  console.log("colRef...");
  const db = getDb();
  console.log({ db });
  return typeof ref === "string"
    ? (collection(db, ref) as CollectionReference<T>)
    : ref;
}

export function docRef<T>(ref: DocPredicate<T>): DocumentReference<T> {
  if (typeof ref === "string") {
    const pathParts = ref.split("/");
    const documentId = pathParts.pop();
    const collectionString = pathParts.join("/");
    return doc<T>(colRef(collectionString), documentId);
  } else {
    return ref;
  }
}

export async function getCollection<T>(
  path: CollectionPredicate<T>,
  queryConstraints: QueryConstraint[] = []
): Promise<T[]> {
  // console.log({ path, queryConstraints });

  const ref = typeof path === "string" ? colRef<T>(path) : path;
  console.log({ ref });
  const q = query(ref, ...queryConstraints);
  const collectionSnap = await getDocs(q);
  return collectionSnap.docs.map((docSnap) => ({
    ...docSnap.data(),
    id: docSnap.id,
  }));
}

export async function getDocument<T>(ref: DocPredicate<T>): Promise<T | null> {
  const docSnap = await getDoc(docRef(ref));
  return docSnap.exists() ? { ...(docSnap.data() as T), id: docSnap.id } : null;
}

export function add<T>(
  ref: CollectionPredicate<T>,
  data: WithFieldValue<T>,
  opts: {
    abbreviate?: boolean;
  } = {}
): Promise<DocumentReference<T>> {
  data[opts.abbreviate ? "ca" : "createdAt"] = serverTimestamp();
  data[opts.abbreviate ? "cb" : "createdBy"] = getUid();
  data[opts.abbreviate ? "ua" : "updatedAt"] = serverTimestamp();
  data[opts.abbreviate ? "ub" : "updatedBy"] = getUid();
  return addDoc(colRef(ref), data);
}

export async function set<T>(
  ref: DocPredicate<T>,
  data: PartialWithFieldValue<T>,
  opts: {
    abbreviate?: boolean;
    merge?: boolean;
  } = {}
): Promise<void> {
  const snap = await getDocument(ref);
  if (snap) {
    return await update(ref, data);
  }
  data[opts.abbreviate ? "ca" : "createdAt"] = serverTimestamp();
  data[opts.abbreviate ? "cb" : "createdBy"] = getUid();
  data[opts.abbreviate ? "ua" : "updatedAt"] = serverTimestamp();
  data[opts.abbreviate ? "ub" : "updatedBy"] = getUid();
  return await setDoc(docRef(ref), data, { merge: opts.merge });
} // could split apart into set and upsert if desired, https://stackoverflow.com/questions/46597327/difference-between-set-with-merge-true-and-update

export async function update<T>(
  ref: DocPredicate<T>,
  data: PartialWithFieldValue<T>,
  opts: {
    abbreviate?: boolean;
  } = {}
): Promise<void> {
  data[opts.abbreviate ? "ua" : "updatedAt"] = serverTimestamp();
  data[opts.abbreviate ? "ub" : "updatedBy"] = getUid();
  return updateDoc(docRef(ref), data as UpdateData<T>);
}

export function deleteDocument<T>(ref: DocPredicate<T>): Promise<void> {
  return deleteDoc(docRef(ref));
}

export async function docExists<T>(ref: DocPredicate<T>): Promise<boolean> {
  return (await getDoc(docRef(ref))).exists();
}
