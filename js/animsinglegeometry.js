// import 'aframe'
import _ from 'lodash'

AFRAME.registerComponent('animsinglegeometry', {

  schema: {
    norman: {type: 'selector'},
    animData: {type: 'array'},
    initFrame: {type: 'int'},
  },

  init() {

    const {animData, initFrame} = this.data

    this.currentFrame = 0
    this.totalFrames = animData.length
    this.frameChangeTime = null
    this.frameIndices = []


    this.counter = 0 // temp for spiking setDrawRange to run frames


      const geometry = new THREE.BufferGeometry(),
            material = new THREE.LineBasicMaterial(),
            positions = [],
            indices = []

      let nextPosIndex = 0


    // console.log('animD12ata: ', animData)

    this.frames = animData.map((frame, index) => {

      const currentFrameIndices = [indices.length]

      // console.log('frame index: ', index, frame)



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

      currentFrameIndices.push(indices.length)
      this.frameIndices.push(currentFrameIndices)
      return mesh
    })


    geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1))
    geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
    const mesh = new THREE.LineSegments(geometry, material)


    // this.totalFrames = this.frameIndices.length
    // console.log("this.frameIndices: ", this.frameIndices)

    // const mesh = new THREE.Mesh(line.geometry, material)
    this.el.object3D.add(mesh)


    this.geometry = geometry

  },

  remove() {

  },

  tick(time, timeDelta) {



    const {counter, frameIndices} = this

    // const win = 300


    // const length = this.geometry.attributes.position.count

    // if (counter + 1 > length / win + (length / win)) {
    //   this.counter = 0
    // } else {
    //   this.counter++
    // }

    // if (counter >= frameIndices.length - 1) {
    //   this.counter = 0
    // } else {
    //   this.counter++
    // }

    // console.log('frameIndices[this.counter]: ', frameIndices[this.counter])

    // this.geometry.setDrawRange(frameIndices[1][0], frameIndices[12][1])
    // this.geometry.attributes.position.needsUpdate = true

    const isAnimPlaying = true,
          fps = 30,
          frameInterval = 1000 / fps


    // if (isAnimPlaying) {
    //   if (!this.frameChangeTime) this.frameChangeTime = time
    //   const {frameChangeTime} = this,
    //         diff = time - frameChangeTime
    //   if (diff >= Math.abs(frameInterval)) {
    //     this.frameChangeTime = time
    //     if (frameInterval >= 0) {
    //       this.gotoNextFrame()
    //     } else {
    //       this.gotoPrevFrame()
    //     }
    //   }
    //   this.showOnlyCurrentFrame()
    // }


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
    el.emit('EXIT_FRAME', {frame: currentFrame})
    if (currentFrame + 1 == totalFrames) {
      this.currentFrame = 0
    } else {
      this.currentFrame++
    }
    this.renderFrame()
  },

  gotoPrevFrame() {
    const {el, currentFrame, totalFrames} = this
    el.emit('EXIT_FRAME', {frame: currentFrame})
    if (currentFrame - 1 < 0) {
      this.currentFrame = totalFrames - 1
    } else {
      this.currentFrame--
    }
    this.renderFrame()
  },

  renderFrame() {
    const {el, currentFrame} = this
    this.showOnlyCurrentFrame()
    el.emit('ENTER_FRAME', {frame: currentFrame})
  },

  showOnlyCurrentFrame() {

    const {frameIndices, currentFrame} = this
    const range = frameIndices[currentFrame][1] - frameIndices[currentFrame][0]
    // console.log('range: ', range)
    this.geometry.setDrawRange(frameIndices[currentFrame][0], range)
    this.geometry.attributes.position.needsUpdate = true

    // _.each(this.frames, (frame, index) => {
    //   frame.visible = (index === this.currentFrame) ? true : false
    // })
  },

})


/*
    // const {animData} = this.data,
    //       geometry = new THREE.Geometry(),
    //       line = new MeshLine(),
    //       material = new MeshLineMaterial({
    //         // sizeAttenuation: 1,
    //         lineWidth: 0.002
    //       })

    // _.each(animData, frame => {
    //   _.each(frame, line => {
    //     _.each(line, point => geometry.vertices.push(point))
    //   })
    // })

    // line.setGeometry( geometry )
    // const mesh = new THREE.Mesh( line.geometry, material )
    // this.el.setObject3D('line', mesh)
    // // this.el.object3D.add(mesh)
*/