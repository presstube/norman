import _ from 'lodash'
import OBJLoader from 'three-obj-loader'
import OBJExporter from 'three-obj-exporter'
import save from 'save-file'
// import Pitchfinder from 'pitchfinder'
// import {getAmount, updateBuyButtonName, getShowingStripeDialog} from './ecommerce.js'

let tree
let branchGenMax = 4
const maxiMaxington = 12
let tickCount = 0
let mic
let active = false
const newBranchScale = 0.8
const branchTweenSpeed = 30
const minMicThreshold = 0.01

OBJLoader(THREE)

// const assetsPath = 'models/'
const assetsPath = 'models-low/'
const branchGenerations = []
const branches = []

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

// console.log('colors: ', colors)



// const assetsData = [

//  {
//     objFilename: assetsPath + 'plant-0.obj',
//     obj: null,
//     spawnPoints: [
//    ]
//  },

//  {
//     objFilename: assetsPath + 'plant-1.obj',
//     obj: null,
//     spawnPoints: [
//       {
//         position: {x: -0.059, y: 18.964, z: 7.072},
//         rotation: {x: -13.464508185574346, y: 0, z: 31.684566070734526}
//       },
//    ]
//  },

//  {
//     objFilename: assetsPath + 'plant-2.obj',
//     obj: null,
//     spawnPoints: [
//       {
//         position: {x: 3.967, y: 17.351, z: 1.968},
//         rotation: {x: 12.891550390443523, y: 18.793015680291003, z: -37.299552463016596}
//       },
//       {
//         position: {x: -5.859, y: 23.943, z: 10.078},
//         rotation: {x: 13.349916626548183, y: 42.16969372162859, z: 38.216284935225914}
//       },
//    ]
//  },

//  {
//     objFilename: assetsPath + 'plant-3.obj',
//     obj: null,
//     spawnPoints: [
//       {
//         position: {x: -2.454, y: 11.775, z: -2.283},
//         rotation: {x: -8.021409131831525, y: -6.875493541569878, z: 47.15442653926675}
//       },
//       {
//         position: {x: 10.088, y: 13.853, z: -2.813},
//         rotation: {x: -14.667719555349075, y: 8.651662706475431, z: -73.5677808947977}
//       },
//       {
//         position: {x: 1.751, y: 23.458, z: -3.32},
//         rotation: {x: -1.9480565034447992, y: 7.39115555718762, z: 16.100114043176134}
//       },
//    ]
//  },
// ]

const assetsData = [

 {
    objFilename: assetsPath + 'plant-base-1-dec-79kverts.obj',
    obj: null,
    sku: 'base',
    spawnPoints: [
    ]
 },

 // {
 //    objFilename: assetsPath + 'plant2-0.obj',
 //    obj: null,
 //    sku: 'base',
 //    spawnPoints: [
 //    ]
 // },

 // {
 //    objFilename: assetsPath + 'plant2-bulby.obj',
 //    obj: null,
 //    sku: 'base1',
 //    spawnPoints: [
 //    ]
 // },

 // {
 //    objFilename: assetsPath + 'plant2-bigblumpy.obj',
 //    obj: null,
 //    sku: 'base2',
 //    spawnPoints: [
 //    ]
 // },

 // {
 //    objFilename: assetsPath + 'plant2-longus.obj',
 //    obj: null,
 //    sku: 'base4',
 //    spawnPoints: [
 //      {
 //        position: {x: 0.459, y: 34.732, z: -13.111},
 //        rotation: {x: 2.312, y: -0.296, z: -6.474}
 //      },
 //    ]
 // },

 // {
 //    objFilename: assetsPath + 'plant2-1.obj',
 //    obj: null,
 //    sku: 'base5',
 //    spawnPoints: [
 //      {
 //        position: {x: -3.221, y: 12.151, z: 2.394},
 //        rotation: {x: 8.480, y: 3.094, z: 11.918}
 //      },
 //      {
 //        position: {x: 2.769, y: 16.596, z: -2.746},
 //        rotation: {x: -2.807, y: -5.339, z: 3.151}
 //      },
 //    ]
 // },

 // {
 //    objFilename: assetsPath + 'plant2-2prong-cactus-fork.obj',
 //    obj: null,
 //    sku: 'base6',
 //    spawnPoints: [
 //      {
 //        position: {x: -0.591, y: 15.509, z: -8.914},
 //        rotation: {x: -4.526, y: 0.000, z: 0.000}
 //      },
 //      {
 //        position: {x: 5.588, y: 23.067, z: -0.302},
 //        rotation: {x: 2.636, y: 3.161, z: 4.526}
 //      },
 //    ]
 // },

 // {
 //    objFilename: assetsPath + 'plant2-curvefan.obj',
 //    obj: null,
 //    sku: 'base7',
 //    spawnPoints: [
 //      {
 //        position: {x: 15.513, y: 31.730, z: 9.991},
 //        rotation: {x: -39.706, y: 0.000, z: 0.000}
 //      },
 //      {
 //        position: {x: 16.746, y: 28.190, z: -3.726},
 //        rotation: {x: -49.504, y: -8.652, z: 35.237}
 //      },
 //      {
 //        position: {x: 15.143, y: 18.675, z: -10.272},
 //        rotation: {x: -49.504, y: -8.652, z: 14.209}
 //      },
 //    ]
 // },

]

const findAssetIndexFromFilename = filename => {
  return _.findIndex(assetsData, o => { 
    return o.objFilename == filename
  })
}

const loadTree = (treeData, tree) => {
  regrowBranch(treeData, tree.el.object3D)
}

const regrowBranch = (data, parent) => {
  const assetIndex = findAssetIndexFromFilename(data.objFilename)
  const branch = assetsData[assetIndex].obj.clone()
  const r = data.rotation
  const p = data.position
  const s = data.scale
  branch.rotation.set(r.x, r.y, r.z)
  branch.position.set(p.x, p.y, p.z)
  branch.scale.set(s.x, s.y, s.z)
  parent.add(branch)
  data.children.forEach(childData => {
    regrowBranch(childData, branch.children[0])
  })
}


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

const generateBranch = (index = null) => {
  if (index === null) {
    index = _.random(0, assetsData.length-1)
    if (branchGenerations.length < 4 ) {
      index = _.random(4, assetsData.length-1)
    } else if (branchGenerations.length === maxiMaxington-1) {
      index = 0
    }
  } 
  const sample = assetsData[index]
  // const sample = assetsData[0]
  const branch = sample.obj.clone()
  // branch.children[0].material.color = {r: 0.3, g: 0.3, b: 0.3}
  // const mat = new THREE.MeshBasicMaterial( { color: 0xf40696 } )
  // const mat = new THREE.MeshBasicMaterial( { color: 0xf40696 } )
  const mat = new THREE.MeshBasicMaterial( { color: colors[0] } )
  // branch.children[0].material.flatShading = true
  branch.children[0].material = mat
  // branch.children[0].material.color = new THREE.Color( 0xf40696 )
  // branch.children[0].material.color = new THREE.Color( 0x666666 )

  branch.data = sample
  return branch
}

const growTree = (tree, index = null) => {
  if (branchGenerations.length === 0) {
    const branch = generateBranch()
    tree.el.object3D.add(branch)
    branch.rotateY(_.random(Math.PI*4))
    branchGenerations[0] = [branch]
    // branch.rotateAmount = _.random(-0.1, 0.1)
    // branches.push(branch)
  } else {
    const lastBranchGens = _.last(branchGenerations)
    const newBranchGen = _.flatten(lastBranchGens.map(branch => {
      return growBranch(branch, index)
    }))
    branchGenerations.push(newBranchGen)
  }
}

const growBranch = (branch, index = null) => {
  return branch.data.spawnPoints.map(spawnPoint => {
    const newBranch = generateBranch(index)
    const spPos = spawnPoint.position
    const spRot = spawnPoint.rotation
    newBranch.position.set(spPos.x, spPos.y, spPos.z)
    newBranch.rotation.set(THREE.Math.degToRad(spRot.x), THREE.Math.degToRad(spRot.y), THREE.Math.degToRad(spRot.z))
    newBranch.scale.set(0.01,0.01,0.01)
    // newBranch.scale.set(0.8,0.8,0.8)

    newBranch.rotateY(_.random(Math.PI*4))
    newBranch.rotateAmount = _.random(-0.05, 0.05)
    branch.children[0].add(newBranch)
    branches.push(newBranch)
    
    const tween = new TWEEN.Tween(newBranch.scale)
      // .to({x:0.8, y:0.8, z:0.8}, 50)
      .to({x:newBranchScale, y:newBranchScale, z:newBranchScale}, branchTweenSpeed)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start()

    return newBranch
  })
}

const retractTree = () => {
  if (branchGenerations.length > 0) {
    const lastBranchGen = branchGenerations.pop().forEach(retractBranch)
  }
}

const retractBranch = branch => {
  
  _.remove(branches, branch)
      // branch.parent.remove(branch)

  const tween = new TWEEN.Tween(branch.scale)
    .to({x:0, y:0, z:0}, branchTweenSpeed)
    .easing(TWEEN.Easing.Quadratic.In)
    .onComplete(() => {
      branch.parent.remove(branch)
    })
    .start()

  // console.log('bbbb: ', branches)
}

const handleWindowResize = function() {
  const scene = document.querySelector("a-scene")
  scene.style.height = window.innerHeight + 'px'
  // if(getShowingStripeDialog()) {
  //   // scene.style.width = (window.innerWidth / 2) + 'px'
  //   scene.style.width = (document.body.clientWidth / 2) + 'px'
  // } else {
  //   scene.style.width = document.body.clientWidth + 'px'
  // }

  scene.style.width = document.body.clientWidth + 'px'

  // const halfHeight = window.innerHeight / 2
  // const buttonContainer = document.getElementById('button-container')
  // buttonContainer.style.top = (halfHeight + window.innerHeight / 4) + 'px'
  // buttonContainer.style.left = ((window.innerWidth / 2) - 200) + 'px'
}

window.addEventListener('resize', handleWindowResize);

const exportOBJ = scene => {
  const exporter = new OBJExporter()
  const data = exporter.parse(scene)
  window.exporter = exporter
  window.scene = scene
  save(data, 'tree.obj', (err, data) => {
      if (err) throw err;
  })
}

const capTree = tree => {
  if (branchGenerations.length > 0) {
    growTree(tree, _.random(0, 2))
    // _.last(branchGenerations).map(branch => {
    //   growBranch(branch, _.random(0, 2))
    // })
  }
}

export const freeze = () => {
  if (active === true && branchGenerations.length > 0) {
    active = false
    // capTree(this)
    const freezeButton = document.getElementById('freeze-button')
    freezeButton.innerHTML = "UNFREEZE"
    // const plane = document.getElementById('plane')
    // const tween = new TWEEN.Tween(plane.object3D.position)
    //   .to({ y: -0.5 }, 100)
    //   .easing(TWEEN.Easing.Quadratic.InOut)
    //   .start();
  }

}

export const unfreeze = () => {
  if (active === false) {
    // active = true
    const freezeButton = document.getElementById('freeze-button')
    freezeButton.innerHTML = "FREEZE"

    start()

    // const plane = document.getElementById('plane')
    // const tween = new TWEEN.Tween(plane.object3D.position)
    //   .to({ y: -2 }, 100)
    //   .easing(TWEEN.Easing.Quadratic.InOut)
    //   .start();  
  }
}

const toggleFreeze = () => {
  if (active) {
    freeze()
  } else {
    unfreeze()
  }
}

const makeSchema = () => {
  return branchGenerations.map(generation => {
    return generation.map(branch => {
      return {
        position: branch.position, 
        rotation: branch.rotation,
        objFilename: branch.data.objFilename,
        spawnPoints: branch.data.spawnPoints
      }
    })
  })
}

// export const getSerialized3DRepresentation = () => {
//   return branchGenerations.map(generation => {
//     return generation.map(branch => {
//       return {
//         position: branch.position, 
//         rotation: branch.rotation,
//         objFilename: branch.data.objFilename,
//         spawnPoints: branch.data.spawnPoints
//       }
//     })
//   })
// }

export const getSerialized3DRepresentation = () => {
// const exportTreeData = tree => {
  return traverseNode(tree.el.object3D.children[0])
}

const traverseNode = node => {
  const data = _.clone(node.data)
  delete data.obj
  const r = node.rotation
  data.rotation = {x: r.x, y: r.y, z: r.z}
  data.position = node.position
  data.scale = node.scale
  data.children = node.children[0].children.map(childNode => {
    return traverseNode(childNode)
  })
  return data
}

const start = () => {
  // console.log('start')



  navigator.getUserMedia (
     // constraints
    {
      audio: true
    },

    // successCallback
    function(localMediaStream) {
      document.getElementById('start-button').style.display = 'none'
      document.getElementById('buy-button').style.visibility = 'visible'
      document.getElementById('freeze-button').style.visibility = 'visible'
      mic = new window.p5.AudioIn()
      mic.start()
      active = true
    },

    // errorCallback
    function(err) {
      alert("You'll need to enable your mic to play with the Presstube Tree!")
    }
  );
  
}

function shadeColor2(color, percent) {   
  var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
  return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}

function convertHex(hex,opacity){
  hex = hex.replace('#','')
  const r = parseInt(hex.substring(0,2), 16)
  const g = parseInt(hex.substring(2,4), 16)
  const b = parseInt(hex.substring(4,6), 16)

  const result = 'rgba('+r+','+g+','+b+','+opacity+')'
  return result
}


const applyColor = colors => {
  // primary color:
  // - button border color
  // - button color
  // - loader border-top
  // - button borders
  // - button borders

  var sheet = document.styleSheets[2]
  var rules = sheet.cssRules || sheet.rules

  const buttonRule = _.find(rules, {'selectorText': 'button.controls'})
  buttonRule.style.color = colors[0]
  buttonRule.style.borderColor = colors[0]
  const loaderRule = _.find(rules, {'selectorText': '.loader'})
  loaderRule.style.borderColor = convertHex(colors[0], 0.3)
  loaderRule.style.borderTopColor = colors[0]
  const scene = document.querySelector("a-scene")
  scene.setAttribute('background', {color: colors[1]})
  scene.setAttribute('fog', {color: colors[1]})

  // const plantBase = document.getElementById('plant-base')
  // plantBase.setAttribute('material', {color: colors[0]})

  const secColorShade = shadeColor2(colors[1], 0.2)
  // const plane = document.getElementById('plane')
  // plane.setAttribute('color', secColorShade)

  const svg = document.getElementById('svg-logo')
  svg.childNodes[1].childNodes[1].childNodes[1].setAttribute('fill', colors[0])
  svg.childNodes[1].childNodes[3].setAttribute('stroke', colors[0])

}

// document.addEventListener('DOMContentLoaded', e => {
//   console.log('DOM fully loaded and parsed')
//   // applyColor(colors)
// });

// window.addEventListener("load", e => {
//   console.log('LOADED!')
//   console.log('LOADED!')
// })


AFRAME.registerComponent('tree', {

  init: function() {

    tree = this

    const scene = document.querySelector("a-scene")
    handleWindowResize()

    loadAssets(assetsData).then(() => {



      // document.getElementById('button-container').style.visibility = 'visible'
      // document.getElementById('buy-button').style.display = 'block';
      // document.getElementById('freeze-button').style.display = 'block';


      // const base = document.getElementById('plant-base')
      // base.setAttribute('visible', 'true')

      // const loader = document.getElementById('loader')
      // loader.style.visibility = 'hidden'


      // const startButton = document.getElementById('start-button')
      // startButton.addEventListener('click', ()=> {

      //   var my_awesome_script = document.createElement('script');

      //   my_awesome_script.setAttribute('src','https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.6.1/addons/p5.sound.min.js');

      //   document.head.appendChild(my_awesome_script);

      //   my_awesome_script.onload = () => {
      //     start()
      //   }


      // })


      // loadTree(treeData, this)

      document.addEventListener('keydown', e => {

        // console.log('k: ', e.keyCode)

        if (e.keyCode == 71) {        // G key
          growTree(this)
        } else if (e.keyCode == 82) { // R key
          retractTree(this)
        } else if (e.keyCode == 32) { // SPACE
          freeze()
        } else if (e.keyCode == 69) { // E key
          exportOBJ(this.el.object3D)
        } else if (e.keyCode == 80) { // P key
          console.log('data: ', exportTreeData(this))
          console.log('data: ', JSON.stringify(exportTreeData(this)))
          // console.log('positions: ', JSON.stringify(makeSchema()))
          // const success = document.getElementById('stripe-success')
          // success.style.visibility = 'visible'
        }
      })

      document.addEventListener('keyup', e => {
        if (e.keyCode == 32) {
          unfreeze()          
        }
      })

      // document.addEventListener('mousedown', () => {
      //   console.log('DOWN')
      //   freeze()
      // })
      // document.addEventListener('click', () => {
      //   console.log('UP')
      //   unfreeze()
      // })

      // document.addEventListener("touchstart", freeze, false);
      // document.addEventListener("touchend", unfreeze, false);

      // const freezeButton = document.getElementById('freeze-button')
      // freezeButton.addEventListener('mousedown', toggleFreeze)
      // freezeButton.addEventListener('touchstart', toggleFreeze)

    })
	},

	update: function() {
  },

  tick: function(time) {

    tickCount++

    if (active) {
      const micLevel = mic.getLevel()

      branchGenMax = Math.floor(micLevel * 100)

      if (branchGenMax > maxiMaxington) branchGenMax = maxiMaxington

      const wiggleMultiplier = 0.2            

      branches.forEach(branch => {
        branch.rotation.x += _.random(-1.0, 1.0) * micLevel * wiggleMultiplier
        branch.rotation.y += _.random(-1.0, 1.0) * micLevel * wiggleMultiplier
        branch.rotation.z += _.random(-1.0, 1.0) * micLevel * wiggleMultiplier
        branch.rotateY(branch.rotateAmount * micLevel * wiggleMultiplier * 50)
        // branch.scale.x += 0.1
      })

      if (tickCount % 1 === 0) {
        if (micLevel > minMicThreshold && branchGenerations.length < branchGenMax) {
          growTree(this)
        } else if (micLevel < minMicThreshold || branchGenerations.length >= branchGenMax) {
          retractTree(this)
        }
      }
      
    }
    // updateBuyButtonName()

	},

})

const ballAssets = []

const spawnBallAsset = parent => {
  const assetData = _.sample(assetsData)
  // console.log('assetData: ', assetData.obj)
  const asset = assetData.obj.clone()
  const mat = new THREE.MeshBasicMaterial( { color: colors[0] } )
  asset.children[0].material = mat
  const scaleRange = 1.0
  const posRange = 5
  // asset.position.set(_.random(-posRange, posRange), _.random(-posRange, posRange), _.random(-posRange, posRange))
  asset.rotation.set(_.random(Math.PI*4), _.random(Math.PI*4), _.random(Math.PI*4))
  // const randScale = _.random(0.5, 1.0)
  asset.scale.set(0.01, 0.01, 0.01)

  const tweenDuration = 6000
  const tweenDelay = 0

  const tween = new TWEEN.Tween(asset.scale)
    .to({x: 1, y: 1, z:1}, tweenDuration)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onComplete(() => {
      const tweenOut = new TWEEN.Tween(asset.scale)
        .to({x: 0.01, y: 0.01, z:0.01}, tweenDuration)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .delay(tweenDelay)
        .onComplete(()=> {
          parent.remove(asset)
          _.remove(ballAssets, asset)
        })
        .start()
      
    })
    .start()


  parent.add(asset)
  ballAssets.push(asset)
}

AFRAME.registerComponent('seething-ball', {

  init: function() {

    handleWindowResize()

    loadAssets(assetsData).then(() => {

      // const loader = document.getElementById('loader')
      // loader.style.visibility = 'hidden'

      console.log('seething ball here')
      active = true
    })
  },

  update: function() {

  },

  tick: function(time) {
    tickCount++
    if (active) {
      ballAssets.forEach(asset => {

        asset.rotateY(_.random(-0.01, 0.01))
        asset.rotateX(_.random(-0.01, 0.01))
        asset.rotateZ(_.random(-0.01, 0.01))
      })
      if (tickCount % 200 == 0) {
        spawnBallAsset(this.el.object3D)
      }
    }
  },

})

AFRAME.registerComponent('glint', {

  init: function() {
    // console.log('glint')

    this.tickCount = 0
    // this.geo = new THREE.OctahedronGeometry(0.05)
    this.geo = new THREE.IcosahedronGeometry(0.05)

  },

  update: function() {
  },

  tick: function(time) {

    this.tickCount++
    this.el.object3D.rotateY(-0.02)
    
    if (this.tickCount % 10 == 0) {
      this.spawn()
    }
  },

  spawn: function() {
    const time = _.random(1000, 2000)
    const mat = new THREE.MeshBasicMaterial( { color: colors[2], transparent: true, opacity: 0.7} )
    // const mat = new THREE.MeshStandardMaterial( { color: 0xffffff, transparent: true, opacity: 0.2 } )
    const mesh = new THREE.Mesh(this.geo, mat)
    const spread = 4.1
    // console.log('spawn: ', _.random(-2.1, 2.1))
    const initPos = [_.random(-spread, spread), _.random(-spread, spread), _.random(-spread, spread)]
    mesh.position.set(...initPos)
    this.el.object3D.add(mesh)
    mesh.scale.set(0.01, 0.01, 0.01)

    const tween = new TWEEN.Tween(mesh.scale)
      .to({x:1, y:1, z:1}, time / 2).easing(TWEEN.Easing.Quadratic.In)
      .chain(new TWEEN.Tween(mesh.scale)
        .to({x:0, y:0, z:0}, time / 2)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onComplete(() => {
          mesh.parent.remove(mesh)
        }))
      .start()

    const tweenY = new TWEEN.Tween(mesh.position)
      .to({y: initPos[1] + 2}, time)
      // .easing(TWEEN.Easing.Quadratic.Out)
      .start()

  }

})

export const showMessage = function(s) {
  const elContainer = document.getElementById('stripe-message-container')
  elContainer.style.visibility = 'visible'
  const el = document.getElementById('stripe-message')
  el.innerHTML = s
}

export const hideMessage = function() {
  const elContainer = document.getElementById('stripe-message-container')
  elContainer.style.visibility = 'hidden'
}

export const setActive = function(newActive) {

  active = newActive
}

export const getActive = function() {
  return active
}

export const getBranchGenerations = function() {
  return branchGenerations
}

export const moveSceneLeft = function() {
  const scene = document.querySelector("a-scene")
  scene.style.width = (window.innerWidth / 2) + 'px'
  window.dispatchEvent(new Event('resize'))
  // console.log('moving scene left: ', scene.style.width )
}

export const showSceneFullWidth = function() {
  const scene = document.querySelector("a-scene")
  scene.style.width = (window.innerWidth) + 'px'
  window.dispatchEvent(new Event('resize'))
}


