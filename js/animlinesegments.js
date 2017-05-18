// import 'aframe'
import _ from 'lodash'

AFRAME.registerComponent('animlinesegments', {

  schema: {
    norman: {type: 'selector'},
    animData: {type: 'array'},
    initFrame: {type: 'int'},
  },

  init() {

    const {animData, initFrame} = this.data

    this.currentFrame = initFrame
    this.totalFrames = animData.length
    this.frameChangeTime = null

    this.frames = animData.map((frame, index) => {
      // console.log('frame: ', frame)
      const geometry = new THREE.BufferGeometry(),
            material = new THREE.LineBasicMaterial(),
            positions = [],
            indices = []

      let nextPosIndex = 0

      const addVertex = v => {
        console.log('adding vertex: ', v.x)
        positions.push(v.x, v.y, v.z)
        nextPosIndex++
      }

      const addSubsequentVertex = (v) => {
        const i = nextPosIndex - 1
        addVertex(v)
        indices.push(i, i+1)
      }

      const makeLine = vertices => {
        addVertex(vertices[0])
        // if (vertices.length > 0) {

        // }
        for (let i=1; i < vertices.length; i++) {
          // console.log('about to iterate on p-index: ', i)
          addSubsequentVertex(vertices[i]);
        }
      }

      _.each(frame, line => {
        makeLine(line)
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



    const isAnimPlaying = true,
          fps = 30,
          frameInterval = 1000 / fps


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
    _.each(this.frames, (frame, index) => {
      frame.visible = (index === this.currentFrame) ? true : false
    })
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