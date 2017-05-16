// import 'aframe'
import _ from 'lodash'

AFRAME.registerComponent('animmeshline', {

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
      const geometry = new THREE.Geometry(),
            line = new MeshLine(),
            material = new MeshLineMaterial({
              sizeAttenuation: true,
              lineWidth: 0.001})

      _.each(frame, line => {
        _.each(line, point => geometry.vertices.push(point))
      })

      line.setGeometry(geometry)
      const mesh = new THREE.Mesh(line.geometry, material)
      // this.el.setObject3D(`frame${index}`, mesh) // replaces last
      this.el.object3D.add(mesh)
      // console.log('mesh: ', mesh)
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