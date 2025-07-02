import firebase from '@react-native-firebase/app';

const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    appId: ""
};

if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
}

export default firebase;