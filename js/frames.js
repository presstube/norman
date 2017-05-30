import _ from 'lodash'

export default (anim, animData) => {

  const {el, ENTER_FRAME} = anim


  const makeFrame = (frameData) => {
    const geometry = new THREE.BufferGeometry(),
          material = new THREE.LineBasicMaterial({color: 'black'})

    anim.fillGeometry(geometry, frameData)
    const mesh = new THREE.LineSegments(geometry, material)
    el.object3D.add(mesh)
    return mesh
  }
  
  const frames = animData.map(makeFrame)

  const displayFrame = (frameIndex) => {
    frames.forEach((frame, index) => {
      frame.visible = index === frameIndex ? true : false
    })
  }

  displayFrame(0)

  const onEnterFrame = (e) => {
    displayFrame(e.detail.frame)
  }

  const addListeners = () => {
    el.addEventListener(ENTER_FRAME, onEnterFrame)
  }

  addListeners()

}




// AFRAME.registerComponent('animframes', {

//   schema: {
//     anim: {type: 'object'}
//     animData: {type: 'array'},
//   },

//   init() {
//     const {anim, animData} = this.data
//     console.log('anim, animData: ', anim, animData)
//   },

//   remove() {
//     // ?
//   },

//   tick(time, timeDelta) {
//     // 
//   },

//   makeFrames(animData) {
//     // make the frames
//   },

//   makeFrame(frameData) {
//     const frame = {}
//     //
//     return frame
//   }

//   displayFrame(index) {

//   }

// })

