import _ from 'lodash'
import OBJLoader from 'three-obj-loader'
import OBJExporter from 'three-obj-exporter'
import save from 'save-file'
import Hammer from 'hammerjs'

OBJLoader(THREE)

const assetsPath = 'models-low/'

const pace = 5
const paceMultiplier = 50
window.playing = false

let segments = []
let currentSegment
const colorPalettes = [
  ['#ffffff', '#000000', '#ffffff'],
  ['#000000', '#ffffff', '#000000'],
  ['#AEF3E7', '#C33C54', '#37718E'],
  ['#002A32', '#F40076', '#FFC6AC'],
  ['#00BD9D', '#FFFBFA', '#F7567C'],
  ['#FF0054', '#390099', '#FFBD00'],
  ['#AFFC41', '#3C1642', '#B2FF9E'],
  ['#00171F', '#FFEEF2', '#00A7E1'],
  ['#FF92C2', '#595758', '#FFFFFF'],
  ['#EDF0DA', '#8F5C38', '#FFFFFF'],
  ['#EDF0DA', '#AA4465', '#FFFFFF'],
  ['#45503B', '#E5EBEA', '#FFFFFF'],
  ['#EE6055', '#AAF683', '#FFFFFF'],
  ['#F40696', '#FAAFBE', '#FFFFFF']
]

// const colors = _.sample(colorPalettes)
const colors = colorPalettes[0]

const assetsData = [




 {
    objFilename: assetsPath + 'plant2-0.obj',
    obj: null,
    sku: 'base',
    spawnPoints: [
    ]
 },

 {
    objFilename: assetsPath + 'plant2-bigblumpy.obj',
    obj: null,
    sku: 'base2',
    spawnPoints: [
    ]
 },


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

 {
    objFilename: assetsPath + 'plant2-2prong-cactus-fork.obj',
    obj: null,
    sku: 'base6',
    spawnPoints: [
      {
        position: {x: -0.591, y: 15.509, z: -8.914},
        rotation: {x: -4.526, y: 0.000, z: 0.000}
      },
      {
        position: {x: 5.588, y: 23.067, z: -0.302},
        rotation: {x: 2.636, y: 3.161, z: 4.526}
      },
    ]
 },

 {
    objFilename: assetsPath + 'plant2-curvefan.obj',
    obj: null,
    sku: 'base7',
    spawnPoints: [
      {
        position: {x: 15.513, y: 31.730, z: 9.991},
        rotation: {x: -39.706, y: 0.000, z: 0.000}
      },
      {
        position: {x: 16.746, y: 28.190, z: -3.726},
        rotation: {x: -49.504, y: -8.652, z: 35.237}
      },
      {
        position: {x: 15.143, y: 18.675, z: -10.272},
        rotation: {x: -49.504, y: -8.652, z: 14.209}
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


AFRAME.registerComponent('scatter', {
  init: function() {

    console.log('scatter here')

    this.geo = new THREE.IcosahedronGeometry(0.005)

    const spawn = () => {

      // const mat = new THREE.MeshBasicMaterial( { color: 'white', transparent: false, opacity: 0.7} )
      const mat = new THREE.MeshBasicMaterial( { color: 0x555555})
      // const mat = new THREE.MeshStandardMaterial( { color: 0xffffff, transparent: true, opacity: 0.2 } )
      const mesh = new THREE.Mesh(this.geo, mat)
      const spread = 1.1
      // console.log('spawn: ', _.random(-2.1, 2.1))
      const initPos = [_.random(-spread, spread), _.random(-spread, spread), _.random(-spread, spread)]
      mesh.position.set(...initPos)
      mesh.rotateY(_.random(Math.PI*4))
      mesh.rotateX(_.random(Math.PI*4))
      mesh.rotateZ(_.random(Math.PI*4))
      this.el.object3D.add(mesh)


    }

    _.times(1000, spawn)


  }
})


AFRAME.registerComponent('vine', {

  init: function() {

    this.tickCount = 0
    this.container = new THREE.Group()
    this.el.object3D.add(this.container)

    loadAssets(assetsData).then(()=> {

      currentSegment = this.spawn()

      segments.push(currentSegment)

      // const mc = new Hammer (document.getElementById('scene'))

      // mc.on('tap', e => {
      //   this.step()
      // })

      if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
       
        window.addEventListener("touchstart", e => {
          window.playing = true
        })

        window.addEventListener("touchend", e => {
          window.playing = false
        })

      }

      document.addEventListener('keydown', e => {
        // console.log('kd: ', e.keyCode)
        if (e.code == 'Space') {
          window.playing = true
        }
      })

      document.addEventListener('keyup', e => {
        console.log('kd: ', e)
        if (e.code == 'Space') {
          window.playing = false
        }
      })

      // mc.on('press', e => {
      //   window.playing = !window.playing
      // })

    })

  },

  update: function() {
  },

  tick: function(time) {
    this.tickCount++
    if (this.tickCount % pace == 0) {
      if (window.playing) { 
        this.step()
      }
      // this.spawn()
    }
  },

  makeSegment: function() {
    const asset = assetsData[_.random(4, 6)]
    const segment = asset.obj.clone()
    const mat = new THREE.MeshBasicMaterial( { color: colors[0] } )
    segment.children[0].material = mat
    segment.spawnPoints = asset.spawnPoints
    return segment
  },

  spawn: function() {
    // const asset = assetsData[_.random(1, 4)]
    const segment = this.makeSegment()
    this.container.add(segment)
    return segment
  },

  spawnNext: function(parentSegment) {
    const segment = this.makeSegment()

    const spawnPoint = parentSegment.spawnPoints[_.random(parentSegment.spawnPoints.length-1)]
    const {x, y, z} = spawnPoint.position
    segment.position.set(x, y, z)
    const {x:rx, y:ry, z:rz} = spawnPoint.rotation
    segment.rotation.set(THREE.Math.degToRad(rx), THREE.Math.degToRad(ry), THREE.Math.degToRad(rz))
    segment.parentSegment = parentSegment
    segment.rotateY(_.random(Math.PI*4))
    segment.scale.set(0.01, 0.01, 0.01)
    const tween = new TWEEN.Tween(segment.scale)
      .to({x: 1, y: 1, z: 1}, pace * paceMultiplier - 20)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start()


    parentSegment.add(segment)

    return segment  
  },

  step: function() {
    currentSegment = this.spawnNext(currentSegment)
    segments.push(currentSegment)


    // const geometry = new THREE.SphereGeometry( 3, 32, 32 )
    // const material = new THREE.MeshBasicMaterial( {color: 0xff0000} )
    // const sphere = new THREE.Mesh( geometry, material )
    const scene = this.el.sceneEl.object3D
    // this.container.add( sphere )

    currentSegment.updateMatrixWorld()

    const lp = new THREE.Vector3()
    const wp = currentSegment.localToWorld(lp)
    const holder = document.getElementById('holder').object3D
    const pp = holder.worldToLocal(lp)
    // console.log('holder: ', holder)
    // const pp = this.container.worldToLocal(lp)
    const {x, y, z} = pp
    // sphere.position.set(x, y, z)

    // this.container.add( currentSegment )
    // currentSegment.position.set(x, y, z)

    // holder.position.set(-x, -y, -z)
    // this.container.position.set(-x, -y, -z)

    // const tween = new TWEEN.Tween(this.container.position)
    const tween = new TWEEN.Tween(holder.position)
      .to({x:-x, y:-y, z:-z}, pace * paceMultiplier)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start()

    // if (segments.length > 10) {
    //   const segToRemove = segments.shift()
    //   this.container.remove(segToRemove)
    // }

  }

})











