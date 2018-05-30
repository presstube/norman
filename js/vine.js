import _ from 'lodash'
import OBJLoader from 'three-obj-loader'
import OBJExporter from 'three-obj-exporter'
import save from 'save-file'

OBJLoader(THREE)

const assetsPath = 'models-low/'

const assetsData = [

 {
    objFilename: assetsPath + 'plant2-bulby.obj',
    obj: null,
    sku: 'base1',
    spawnPoints: [
    ]
 },

 {
    objFilename: assetsPath + 'plant2-longus.obj',
    obj: null,
    sku: 'base4',
    spawnPoints: [
      {
        position: {x: 0.459, y: 34.732, z: -13.111},
        rotation: {x: 2.312, y: -0.296, z: -6.474}
      },
    ]
 },

 {
    objFilename: assetsPath + 'plant2-1.obj',
    obj: null,
    sku: 'base5',
    spawnPoints: [
      {
        position: {x: -3.221, y: 12.151, z: 2.394},
        rotation: {x: 8.480, y: 3.094, z: 11.918}
      },
      {
        position: {x: 2.769, y: 16.596, z: -2.746},
        rotation: {x: -2.807, y: -5.339, z: 3.151}
      },
    ]
 },

]

const loadAsset = function(filename) {
  return new Promise(function(resolve, reject) {
    // console.log('loadAsset: ', filename)
    const loader = new THREE.OBJLoader()
    loader.load(filename, obj => {
      resolve(obj)
    }, xhr => {
      // console.log((xhr.loaded / xhr.total * 100) + '% loaded')
    }, error => {
      console.log('Error loading an obj: ', error);
      reject(error)
    })
  })
}

const loadAssets = assetsData => {
  const loadingPromises = assetsData.map(assetData => {
    console.log('loading: ', assetData.objFilename)
    return loadAsset(assetData.objFilename)
      .then(obj => {
        assetData.obj = obj
      })
  })
  return Promise.all(loadingPromises)
}





AFRAME.registerComponent('vine', {

  init: function() {

    console.log('vine here')

    this.tickCount = 0

    loadAssets(assetsData).then(()=> {
      console.log('assets loaded')
    })
  },

  update: function() {
  },

  tick: function(time) {
    this.tickCount++
    if (this.tickCount % 10 == 0) {
      this.spawn()
    }
  },

  spawn: function() {
  }

})