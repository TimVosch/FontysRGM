require("dotenv").config();
const firebase = require("firebase");
const app = firebase.initializeApp(JSON.parse(process.env.FIREBASE_CONFIG));

app
  .database()
  .ref("/chain/")
  .set({
    node: {
      nextScreen: 51,
    },
  });

setTimeout(() => {
  process.exit(0);
}, 500);
