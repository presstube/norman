
import * as firebase from 'firebase'
import * as firebaseui from 'firebaseui'
import _ from 'lodash'
import $ from 'jquery'

firebase.initializeApp({
  apiKey: "AIzaSyCYUVhlNStwAarauyhI2BDgbtQrVKHpGhc",
  authDomain: "norman-mala.firebaseapp.com",
  databaseURL: "https://norman-mala.firebaseio.com",
  projectId: "norman-mala",
  storageBucket: "norman-mala.appspot.com",
  messagingSenderId: "853624178535"
})

// let currentFileInfo = null

const save = (animData, fileInfo) => {

  return new Promise((resolve, reject) => {

    const upload = (filename) => {
      const uploadRef = firebase.storage().ref().child('animData/' + filename + '.json'),
            file = new Blob([JSON.stringify(animData)], {type: 'application/json'})
      return uploadRef.put(file).then(function(snapshot) {
        const animationsRef = firebase.database().ref('animations/' + filename)
              fileInfo = {
                filename,
                downloadURL: snapshot.downloadURL,
                createdAt: firebase.database.ServerValue.TIMESTAMP
              }
        animationsRef.set(fileInfo)
        console.log(filename + ' succesfully uploaded!')
        resolve(fileInfo)
      })
    }

    if (!fileInfo) {
      getRandomUniqueName().then(upload)
    } else {
      upload(fileInfo.filename)
    }

  })  

}

const getRandomName = () => {
  const first = ['mulgy', 'trulmy', 'gildered', 'marbled', 'troubling', 'lorgussy', 'shingled', 'brumpled', 'clumbied', 'fropley'],
        second = ['frump', 'dank', 'prunt', 'limp', 'groft', 'plex', 'bung', 'tap', 'ront', 'clam', 'brine', 'shift', 'crank'],
        third = ['shanks', 'lumps', 'glops', 'hinges', 'hunguses', 'hops', 'squeefs', 'clamps', 'clumps','donks', 'flops']
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

// TODO: DRY up loadPrev & loadNext

const loadPrev = (fileInfo) => {
  console.log('loading prev from fileInfo: ', fileInfo)
  return new Promise((resolve, reject) => {
    firebase.database().ref('animations').once('value', snapshot => {
      const fileInfos = _.orderBy(snapshot.val(), ['createdAt'], ['desc'])
      if (!fileInfo) {
        fileInfo = _.first(fileInfos)
      } else {
        const currentIndex = _.findIndex(fileInfos, fi => fi.filename === fileInfo.filename)
        if (currentIndex === fileInfos.length - 1) {
          fileInfo = _.first(fileInfos)
        } else { 
          fileInfo = _.nth(fileInfos, currentIndex + 1)
        }
      }
      loadFile(fileInfo).then(file => {
        resolve({file, fileInfo})
      })
    })
  })
}

const loadNext = (fileInfo) => {
  return new Promise((resolve, reject) => {
    firebase.database().ref('animations').once('value', snapshot => {
      const fileInfos = _.orderBy(snapshot.val(), ['createdAt'], ['asc'])
      if (!fileInfo) {
        fileInfo = _.first(fileInfos)
      } else {
        const currentIndex = _.findIndex(fileInfos, fi => fi.filename === fileInfo.filename)
        if (currentIndex === fileInfos.length - 1) {
          fileInfo = _.first(fileInfos)
        } else { 
          fileInfo = _.nth(fileInfos, currentIndex + 1)
        }
      }
      loadFile(fileInfo).then(file => {
        resolve({file, fileInfo})
      })
    })
  })
}


const loadAnimByName = (name) => {

  console.log('loading by name func: ', name)
  return new Promise((resolve, reject) => {
    firebase.database().ref('animations').child(name).once('value', snapshot => {
      const fileInfo = snapshot.val()
      loadFile(fileInfo).then(file => {
        resolve({file, fileInfo})
      })
    })
  })
}

const loadFile = (fileInfo) => {
  return new Promise((resolve, reject) => {
    $.getJSON(fileInfo.downloadURL, file => {
      resolve(file)
    })
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


const deleteComp = ({
    filename,
    downloadURL,
    createdAt
  }) => {
    console.log('DELETING: ', filename, downloadURL, createdAt)
    const storageRef = firebase.storage().ref().child('animData/' + filename + '.json')
    storageRef.delete().then(()=> {
      console.log('removed json from storage: ', filename)
      const animationsRef = firebase.database().ref('animations/' + filename)
      animationsRef.remove().then(() => {
        console.log('removed ref: ', filename)
      })
    })

}


export {
  loadAnimByName,
  save,
  loadPrev,
  loadNext,
  deleteComp
}





























