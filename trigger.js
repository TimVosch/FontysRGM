require("dotenv").config();

// Get ARGS
if (process.argv.length < 3) {
  console.log("\nRequires one argument: RGMID\n");
  process.exit(1);
}

let nextScreen = null;
try {
  nextScreen = parseInt(process.argv[2]);
} catch (e) {
  console.error("Could not parse number");
  process.exit(1);
}

const firebase = require("firebase");
const app = firebase.initializeApp(JSON.parse(process.env.FIREBASE_CONFIG));

app.database().ref("/chain/").set({
  node: {
    nextScreen,
  },
});

setTimeout(() => {
  process.exit(0);
}, 500);
