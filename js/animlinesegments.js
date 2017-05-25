// import 'aframe'
import _ from 'lodash'

AFRAME.registerComponent('animlinesegments', {

  schema: {
    norman: {type: 'selector'},
    animData: {type: 'array'},
    initFrame: {type: 'int'},
  },

  init() {

    const {norman, animData, initFrame} = this.data

    this.normanComp = norman.components.norman
    this.currentFrame = initFrame
    this.totalFrames = animData.length
    this.frameChangeTime = null
    this.animData = animData

    this.frames = animData.map((frameData, index) => {
      // console.log('frame index: ', index, frame)
      const geometry = new THREE.BufferGeometry(),
            material = new THREE.LineBasicMaterial({color: 'black'})

      this.updateGeometry(geometry, frameData)

      const mesh = new THREE.LineSegments(geometry, material)

      this.el.object3D.add(mesh)
      return mesh
    })

  },

  remove() {

  },

  tick(time, timeDelta) {

    const {normanComp} = this,
          {isAnimPlaying, frameInterval} = normanComp


    if (isAnimPlaying) {
      if (!this.frameChangeTime) this.frameChangeTime = time
      const {frameChangeTime} = this,
            diff = time - frameChangeTime
      if (diff >= Math.abs(frameInterval)) {
        this.frameChangeTime = time
        if (frameInterval >= 0) {
          this.gotoNextFrame()
        } else {
          this.gotoPrevFrame()
        }
      }
      this.showOnlyCurrentFrame()
    }

  },

  gotoNextFrame() {
    const {el, currentFrame, totalFrames} = this
    this.beforeFrameChange()
    if (currentFrame + 1 == totalFrames) {
      this.currentFrame = 0
    } else {
      this.currentFrame++
    }
    this.afterFrameChange()
  },

  gotoPrevFrame() {
    const {el, currentFrame, totalFrames} = this
    this.beforeFrameChange()
    if (currentFrame - 1 < 0) {
      this.currentFrame = totalFrames - 1
    } else {
      this.currentFrame--
    }
    this.afterFrameChange()
  },

  beforeFrameChange() {
    // check to see if lineBeingDrawn
    // if it is finishLine(lastPos)
    this.el.emit('EXIT_FRAME', {frame: this.currentFrame})
  },

  afterFrameChange() {
    // check to see if lineBeingDrawn
    // if it is startLine(lastPos)
    this.renderFrame()
  },

  renderFrame() {
    const {el, currentFrame} = this
    this.showOnlyCurrentFrame()
    el.emit('ENTER_FRAME', {frame: currentFrame})
  },

  showOnlyCurrentFrame() {
    _.each(this.frames, (frame, index) => {
      frame.visible = (index === this.currentFrame) ? true : false
    })
  },

  startLine(pos) {
    // console.log('starting line on frame ', this.currentFrame)
    // set a flag lineBeingDrawn = true
    // get the anim data
    // get the current frameData
    // push a new empty lineData array
    // push the pos into it that new lineData 
    // get the geometry for the current frame
    // update that geometry with the newly updated current frameData
    // phew!

    const {animData, currentFrame} = this,
          frameData = animData[currentFrame]

    // console.log('frameData: ', frameData)
    frameData.push([pos])

    this.updateFrame(currentFrame)

  },

  addVertex(pos) {
    // console.log('adding vertex on frame ', this.currentFrame)
    const {animData, currentFrame} = this,
          frameData = animData[currentFrame]

    _.last(frameData).push(pos)
    this.updateFrame(currentFrame)
  },

  finishLine(pos) { // maybe it doesn't take a pos?
    console.log('finishing line on frame ', this.currentFrame)
    // not sure if I actually need to do anything here
  },

  updateFrame(frameIndex) {
    const geometry = this.frames[frameIndex].geometry,
          frameData = this.animData[frameIndex]

    this.updateGeometry(geometry, frameData)
  },

  updateGeometry(geometry, frameData) {
    const positions = [],
          indices = []

    let nextPosIndex = 0

    const addVertex = (v, index) => {
      if (v) { 
        positions.push(v.x, v.y, v.z)
      } else {
        console.log('no... Where are these coming from???, ', index, v)
        positions.push(0, 0, 0)
      }
      nextPosIndex++
    }

    const addSubsequentVertex = (v, index) => {
      const i = nextPosIndex - 1
      // console.log('adding vertex: ', index)
      addVertex(v, index)
      indices.push(i, i+1)
    }

    const makeLine = vertices => {
      addVertex(vertices[0], 0)
      for (let i=1; i < vertices.length; i++) {
        addSubsequentVertex(vertices[i], i);
      }
    }

    _.each(frameData, (line, index) => {
      if (line.length) makeLine(line)
    })

    // console.log('positions: ', positions)
    // console.log('indices: ', indices)

    geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1))
    geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
    geometry.attributes.position.needsUpdate = true
  }




})

