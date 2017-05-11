  loadComp(comp) {
    console.log('loading Comp: ', comp)
    this.animsLoaded = []
    // this.teardown() 
    _.each(comp, (name) => {
      loadAnimByName(name).then(data => {
        console.log('DAATAAAA: ', data)
        // this.currentFileInfo = data.currentFileInfo
        this.animsLoaded.push({
          fileInfo: data.currentFileInfo,
          animData: data.animData
        })
        this.setup(data.animData)
      })
    })

  },








  const loadAnimByName = (name) => {
  return new Promise((resolve, reject) => {
    firebase.database().ref('animations').child(name).once('value', snapshot => {
      const currentFileInfo = snapshot.val()
      loadFile(currentFileInfo).then(animData => {
        resolve({animData, currentFileInfo})
      })
    })
  })
}