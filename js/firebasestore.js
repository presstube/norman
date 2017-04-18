
import * as firebase from 'firebase'
import * as firebaseui from 'firebaseui'
import _ from 'lodash'

firebase.initializeApp({
  apiKey: "AIzaSyBxE0HZfnB7uF2J57oTmjFX-0mLeBfJI-0",
  authDomain: "cloudstoragespike.firebaseapp.com",
  databaseURL: "https://cloudstoragespike.firebaseio.com",
  projectId: "cloudstoragespike",
  storageBucket: "cloudstoragespike.appspot.com",
  messagingSenderId: "10638532760"
})

const uploadAnimData = (filename, animData) => {

  const upload = (filename) => {

    const uploadRef = firebase.storage().ref().child('animData/' + filename + '.json'),
          file = new Blob([JSON.stringify(animData)], {type: 'application/json'})

    return uploadRef.put(file).then(function(snapshot) {
      const animationsRef = firebase.database().ref('animations/' + filename)
      animationsRef.set({
        filename,
        downloadURL: snapshot.downloadURL
      })
    })

  }

  if (!filename) {
    getRandomUniqueName().then(name => {
      upload(name)
    })
  } else {
    upload(filename)
  }

}

const getRandomName = () => {
  const first = ['mulgy', 'trulmy', 'gildered', 'marbled', 'troubling', 'lorgussy', 'shingled', 'brumpled', 'clumbied', 'fropley'],
        second = ['frump', 'dank', 'prunt', 'limp', 'groft', 'plex', 'bung', 'tap', 'ront', 'clam', 'brine', 'shift', 'crank'],
        third = ['shanks', 'lumps', 'glops', 'hinges', 'hunguses', 'hops', 'squeefs', 'clamps', 'clumps','donks', 'flops']

  // if (Math.random() < 0.5) {
  //   return 'troubling-tap-clamps'
  // } else {
  //   return `${_.sample(first)}-${_.sample(second)}-${_.sample(third)}`
  // }
    return `${_.sample(first)}-${_.sample(second)}-${_.sample(third)}`

}

const getRandomUniqueName = () => {
  // recursive promise checking existence of name in DB
  return new Promise((resolve, reject) => {
    let name = getRandomName()
    console.log('checking existence of name: ', name)
    firebase.database().ref('animations').once('value', snapshot => {
      if(snapshot.hasChild(name)) {
        console.log('that name is taken')
        resolve(null)
      } else {
        console.log('it doesnt have that name')
        resolve(name)
      }
    })
  }).then(name => {
    return !name ?
      getRandomUniqueName() : 
      name
  })
}




firebase.auth().onAuthStateChanged(user => {
  if (user) {
    console.log('already signed in')

    // firebase.auth().signOut()


  } else {
    const ui = new firebaseui.auth.AuthUI(firebase.auth())
    ui.start('#firebaseui-auth-container', {
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      ],
      callbacks: {
        signInSuccess: () => false,
      }
    })
  }
})




export {uploadAnimData}
