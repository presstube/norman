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

    console.log('asdasd: ', this.animData)

    this.frames = animData.map((frame, index) => {
      // console.log('frame index: ', index, frame)
      const geometry = new THREE.BufferGeometry(),
            material = new THREE.LineBasicMaterial({color: 'black'}),
            positions = [],
            indices = []

      let nextPosIndex = 0

      const addVertex = (v, index) => {
        if (v) { 
          // console.log('yes: ', v.x)
        // console.log('adding vertex: ', v)
          positions.push(v.x, v.y, v.z)
        } else {
          // console.log('no... Where are these coming from???, ', index, v)
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
        // if (vertices.length > 0) {

        // }
        for (let i=1; i < vertices.length; i++) {
          // console.log('about to iterate on p-index: ', i)
          addSubsequentVertex(vertices[i], i);
        }
      }

      _.each(frame, (line, index) => {
        // console.log('line index: ', index)
        makeLine(line)
        if (line.length) makeLine(line)
      })

      // console.log('positions: ', positions)
      // console.log('indices: ', indices)

      geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1))
      geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
      const mesh = new THREE.LineSegments(geometry, material)

      // const mesh = new THREE.Mesh(line.geometry, material)
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
    // get mesh for that frame
    // get the geometry on that mesh
    // get the positions attribute array on that geometry
    // get the newly updated frameData for that frameIndex
    // rebuild the position attribute array with the updated frameData
    // rebuild the index from the updated frameData
    // set the drawRange with the new positions.length?

      // This is just rebuilding from scratch.. may not perform well
      // but need to get it working first

      const frameData = this.animData[frameIndex],
            geometry = this.frames[frameIndex].geometry,
            positions = [],
            indices = []

      // console.log('updating frame: ' , geometry)

      let nextPosIndex = 0

      const addVertex = (v, index) => {
        if (v) { 
          // console.log('yes: ', v.x)
        // console.log('adding vertex: ', v)
          positions.push(v.x, v.y, v.z)
        } else {
          // console.log('no... Where are these coming from???, ', index, v)
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
        // if (vertices.length > 0) {

        // }
        for (let i=1; i < vertices.length; i++) {
          // console.log('about to iterate on p-index: ', i)
          addSubsequentVertex(vertices[i], i);
        }
      }

      _.each(frameData, (line, index) => {
        // console.log('line index: ', index)
        makeLine(line)
        if (line.length) makeLine(line)
      })

      // console.log('positions: ', positions)
      // console.log('indices: ', indices)

      geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1))
      geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
      geometry.attributes.position.needsUpdate = true

  },




})

