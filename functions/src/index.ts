import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import * as logger from "firebase-functions/logger";

setGlobalOptions({maxInstances: 10});

export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

/*
next steops:

Write your function(s) in functions/src/ and export from index.ts.
Validate locally:
npm --prefix functions run lint
npm --prefix functions run build
Start emulators from repo root:
firebase emulators:start
Test your HTTP function locally (example):
http://127.0.0.1:5001/seedmoney-15f8e/us-central1/helloWorld
In another terminal, run your app:
npm run dev
When behavior is correct, deploy:
firebase deploy --only functions

*/
