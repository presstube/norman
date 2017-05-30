import _ from 'lodash'

export default (anim, animData) => {

  const {el, ENTER_FRAME, ANIM_DATA_CHANGED, LINE_STARTED, LINE_ADDED_TO, LINE_FINISHED} = anim


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

  const updateFrame = (frameIndex, frameData) => {
    // console.log('updating frame: ', frames[frameIndex].geometry)
    const geometry = frames[frameIndex].geometry
    anim.fillGeometry(geometry, frameData)
  }

  displayFrame(0)

  const onEnterFrame = (e) => {
    displayFrame(e.detail.frame)
  }

  const onAnimDataChanged = (e) => {
    const {type, frameIndex, frameData} = e.detail
    if (type === LINE_STARTED || type === LINE_ADDED_TO || type === LINE_FINISHED) {
      updateFrame(frameIndex, frameData)
    }
  }

  const addListeners = () => {
    el.addEventListener(ENTER_FRAME, onEnterFrame)
    el.addEventListener(ANIM_DATA_CHANGED, onAnimDataChanged)
  }

  addListeners()

}