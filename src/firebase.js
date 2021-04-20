import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

var config = {
  apiKey: "AIzaSyACaQ_9_96iE_Fu2UFqHZLcP8dcIhLI49s",
  authDomain: "slack-clone-2947f.firebaseapp.com",
  projectId: "slack-clone-2947f",
  storageBucket: "slack-clone-2947f.appspot.com",
  messagingSenderId: "239560725489",
  appId: "1:239560725489:web:33919675679ba1b56b2a50",
};

firebase.initializeApp(config);

export default firebase;
