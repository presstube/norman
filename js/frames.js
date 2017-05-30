import _ from 'lodash'

export default (anim, animData) => {

  const {
    el, 
    ENTER_FRAME, 
    ANIM_DATA_CHANGED, 
    LINE_STARTED, 
    LINE_ADDED_TO, 
    LINE_FINISHED,
    FRAME_INSERTED,
    FRAME_REMOVED,
  } = anim


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
    console.log(e.detail.frame)
    displayFrame(e.detail.frame)
  }

  const onAnimDataChanged = (e) => {
    const {type, frameIndex, frameData} = e.detail
    if (type === LINE_STARTED || type === LINE_ADDED_TO || type === LINE_FINISHED) {
      updateFrame(frameIndex, frameData)
    }
  }

  const onFrameInserted = (e) => {
    const {type, frameIndex} = e.detail
    frames.splice(frameIndex, 0, makeFrame([]))
    displayFrame(frameIndex)
  }

  const onFrameRemoved = (e) => {
    const {type, frameIndex} = e.detail
    const frame = frames[frameIndex]
    el.object3D.remove(frame)
    frames.splice(frameIndex, 1)
    displayFrame(frameIndex)
  }

  const addListeners = () => {
    el.addEventListener(ENTER_FRAME, onEnterFrame)
    el.addEventListener(ANIM_DATA_CHANGED, onAnimDataChanged)
    el.addEventListener(FRAME_INSERTED, onFrameInserted)
    el.addEventListener(FRAME_REMOVED, onFrameRemoved)
  }

  addListeners()

}