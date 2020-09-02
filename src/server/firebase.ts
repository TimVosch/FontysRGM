import _firebase from "firebase/app";
import "firebase/database";
import { EventEmitter } from "events";

let instance: FirebaseClass = null;
export class FirebaseClass {
  private readonly app: _firebase.app.App;
  private readonly database: _firebase.database.Database;

  constructor(config: any) {
    this.app = _firebase.initializeApp(config);
    this.database = this.app.database();
  }

  /**
   * Starts listening for firebase updates
   */
  onChange(listener: Function) {
    return this.database.ref("/chain/").on("value", (value) => {
      const node = value.val().node;
      listener(node);
    });
  }

  /**
   *
   */
  stop(firebaseValue: any) {
    this.database.ref("/chain/").off("value", firebaseValue);
  }
}

export const firebase = (config?: any) => {
  if (instance === null) {
    if (config === undefined) {
      console.error(
        "firebase module has not been configured! Make sure to call firebase(config) at least once!"
      );
      return null;
    }
    instance = new FirebaseClass(config);
  }
  return instance;
};
