
import * as firebase from "firebase"
import * as firebaseui from "firebaseui"

const config = {
  apiKey: "AIzaSyBxE0HZfnB7uF2J57oTmjFX-0mLeBfJI-0",
  authDomain: "cloudstoragespike.firebaseapp.com",
  databaseURL: "https://cloudstoragespike.firebaseio.com",
  projectId: "cloudstoragespike",
  storageBucket: "cloudstoragespike.appspot.com",
  messagingSenderId: "10638532760"
}

firebase.initializeApp(config)


// document.addEventListener('keydown', e => {
//   // console.log('keydown: ', e.key)
//   if (e.key == 'S') {
//     uploadAnimData('bongo.json', {
//       blah: 'bongobongo', 
//       bloo: 123,
//       blee: [1, 2, 3]
//     })
//   } 
// })

const uiConfig = {
        signInSuccessURL: '',
        signInOptions: [
          firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        ],
        tosURL: 'myTOS.txt',
        callbacks: {
          signInSuccess: (currentUser, credential, redirectUrl) => {
            // Do something.
            // Return type determines whether we continue the redirect automatically
            // or whether we leave that to developer to handle.
            // console.log('signin success')
            return false // to allow the success page to be same as signin
          },
        }
      },
      ui = new firebaseui.auth.AuthUI(firebase.auth())

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // firebase.auth().signOut()
    console.log('already signed in')
  } else {
    ui.start('#firebaseui-auth-container', uiConfig)
  }
});


const uploadAnimData = (filename, animData) => {
  const uploadRef = firebase.storage().ref().child('animData/' + filename),
        file = new Blob([JSON.stringify(animData)], {type: 'application/json'})

  return uploadRef.put(file).then(function(snapshot) {
    console.log('upload succeeded whoooo: ', snapshot.downloadURL)
  })
}

export {uploadAnimData}