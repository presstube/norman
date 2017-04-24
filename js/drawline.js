import 'aframe'

AFRAME.registerComponent('drawline', {

  schema: {
    norman: {type: 'selector'}
  },

  init() {
    // this.target = document.querySelector('#wanderer')
    this.normanComp = this.data.norman.components.norman
    this.animEnt = document.querySelector('#anim')
    this.animComp = document.querySelector('#anim').components.anim
    this.controllers = Array.prototype.slice.call(document.querySelectorAll('a-entity[oculus-touch-controls]'))
    this.boundFrameChangeListener = this.onExitFrame.bind(this)
    this.animEnt.addEventListener('EXIT_FRAME', this.boundFrameChangeListener)

    // line blah
    this.MAX_POINTS = 100000
    this.drawCount = 2
    this.linePoints = []
    this.geometry = new THREE.BufferGeometry()
    this.positions = new Float32Array(this.MAX_POINTS * 3)
    this.geometry.addAttribute('position', new THREE.BufferAttribute(this.positions, 3))
    this.geometry.setDrawRange(0, this.drawCount)
    this.material = new THREE.LineBasicMaterial({color: 'black'})
    this.line = new THREE.Line(this.geometry, this.material)
    this.el.setObject3D('line', this.line)
    this.lastPointDrawn = new THREE.Vector3(0, 0, 0)
  },
  
  tick() {
    var pen = this.normanComp.primaryHand.object3D
    var norm = this.normanComp.el.object3D
    var pos = new THREE.Vector3()
    pen.localToWorld(pos)
    norm.worldToLocal(pos)

    const distToLastPointDrawn = pos.distanceTo(this.lastPointDrawn),
          thresh = 0.001

    if (distToLastPointDrawn > thresh || this.linePoints.length === 0) {
      this.linePoints.push(pos);
      this.lastPointDrawn = pos
      this.line.geometry.setDrawRange(0, this.linePoints.length)
      this.updatePositions()
      this.line.geometry.attributes.position.needsUpdate = true
    } else {
      // do nothing!
    }

  },

  updatePositions() {
    var positions = this.line.geometry.attributes.position.array
    var index = 0
    for (var i = 0; i < this.linePoints.length; i++) {
      positions[index++] = this.linePoints[i].x
      positions[index++] = this.linePoints[i].y
      positions[index++] = this.linePoints[i].z
    }
  },

  onExitFrame(e) {
    this.normanComp.addLineData(this.linePoints, e.detail.frame)
    this.linePoints = []
  },

  remove() {
    this.animEnt.removeEventListener('EXIT_FRAME', this.boundFrameChangeListener)
    this.normanComp.addLineData(this.linePoints, this.animComp.currentFrame)
    if (this.normanComp.autoNext) {
      this.normanComp.handleNext()
    } else if (this.normanComp.autoPrev) {
      this.normanComp.handlePrev()
    }
  }


})