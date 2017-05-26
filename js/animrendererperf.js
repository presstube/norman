import _ from 'lodash'

AFRAME.registerComponent('animrendererperf', {

  init() {

    const {norman, animData, initFrame} = this.data

    

    this.frames = animData.map((frameData, index) => {
      const geometry = new THREE.BufferGeometry(),
            material = new THREE.LineBasicMaterial({color: 'black'})
      this.fillGeometry(geometry, frameData)
      const mesh = new THREE.LineSegments(geometry, material)
      this.el.object3D.add(mesh)
      return mesh
    })

    // listen to Anim for FRAME_CHANGED and ANIM_DATA_CHANGED events
    // onFrameChanged: gotoFrame(e.detail.frameIndex)
    // onAnimDataChanges: updateFrame(e.detail.frameData, e.detail.frameIndex)



  },

  remove() {

  },

  tick(time, timeDelta) {

  },

  gotoFrame(frameIndex) {
    _.each(this.frames, (frame, index) => {
      frame.visible = (index === frameIndex) ? true : false
    })
  },

  updateFrame(frameData, frameIndex) {
    const geometry = this.frames[frameIndex].geometry,
          frameData = this.anim.animData[frameIndex]

    this.updateGeometry(geometry, frameData)
  },

  updateGeometry(geometry, frameData) {
    const positions = [],
          indices = []

    let nextPosIndex = 0

    const addVertex = (v, index) => {
      positions.push(v.x, v.y, v.z)
      nextPosIndex++
    }

    const addSubsequentVertex = (v, index) => {
      const i = nextPosIndex - 1
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

