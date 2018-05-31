import _ from 'lodash'
import OBJLoader from 'three-obj-loader'
import OBJExporter from 'three-obj-exporter'
import save from 'save-file'
import Hammer from 'hammerjs'

OBJLoader(THREE)

const assetsPath = 'models-low/'

let currentSegment

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
    this.tickCount = 0
    this.container = new THREE.Group()
    this.el.object3D.add(this.container)

    loadAssets(assetsData).then(()=> {


      const geo = new THREE.SphereGeometry( 0.01, 32, 32 )
      const mat = new THREE.MeshBasicMaterial( {color: 0x0000ff} )
      const sp = new THREE.Mesh( geo, mat )
      const sc = this.el.sceneEl.object3D
      sc.add(sp)


      currentSegment = this.spawn()
      console.log('currentSegment: ', currentSegment)

      const mc = new Hammer (document.getElementById('scene'))

      mc.on('tap', e => {

        currentSegment = this.spawnNext(currentSegment)

        const geometry = new THREE.SphereGeometry( 0.01, 32, 32 )
        const material = new THREE.MeshBasicMaterial( {color: 0xff0000} )
        const sphere = new THREE.Mesh( geometry, material )
        const parent = this.el.sceneEl.object3D
        const scene = this.el.sceneEl.object3D
        // parent.updateMatrixWorld()
        parent.add( sphere )

        // const vector = new THREE.Vector3();
        // vector.setFromMatrixPosition( currentSegment.matrixWorld );
        // console.log('ps: ', currentSegment.position)

        const wp = currentSegment.getWorldPosition()
        console.log('wp: ', wp)
        const {x, y, z} = wp
        sphere.position.set(x, y, z)

        window.scene = parent
        window.scene = scene
        window.sphere = sphere
      })

    })

  },

  update: function() {
  },

  tick: function(time) {
    this.tickCount++
    if (this.tickCount % 10 == 0) {
      // this.spawn()
    }
  },

  spawn: function() {

    const asset = assetsData[2]
    const segment = asset.obj.clone()
    segment.spawnPoints = asset.spawnPoints
    // const obj3D = this.el.object3D
    this.container.add(segment)
    return segment
    
    // console.log('this: ', this.el.object3D)


  },

  spawnNext: function(parentSegment) {
    const asset = assetsData[2]
    const segment = asset.obj.clone()
    segment.spawnPoints = asset.spawnPoints
    const spawnPoint = parentSegment.spawnPoints[0]
    const {x, y, z} = spawnPoint.position
    segment.position.set(x, y, z)
    segment.rotateY(_.random(Math.PI*4))

    parentSegment.add(segment)

    return segment  
  }

})











