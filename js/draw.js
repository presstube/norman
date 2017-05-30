// import 'aframe'
import _ from 'lodash'

AFRAME.registerComponent('draw', {

  // schema: {
  // },

  init() {
    this.normanEnt = document.querySelector('#norman')
    this.primaryHand = Array.prototype.slice.call(document.querySelectorAll('a-entity[oculus-touch-controls]'))[1]
    this.pen = this.primaryHand.object3D
    this.isDrawing = false
    this.distThresh = 0.001
    this.lastPos = null

    this.primaryHand.addEventListener('triggerdown', () => {
      this.startDrawing()
    })

    this.primaryHand.addEventListener('triggerup', () => {
      this.stopDrawing()
    })

  },
  
  remove() {
    // never gets removed?
  },

  tick() {
    const {isDrawing} = this

    if (isDrawing) {

      const {primaryHand, distThresh} = this,
            currentPos = this.getLocalPenPos(this.pen.position),
            distToLastPos = this.lastPos.distanceTo(currentPos)

      if (distToLastPos > distThresh) {
        // console.log('drawing!: ', this.getLocalPenPos(this.pen.position))
        this.targetAnim.addToLine(currentPos)
        this.lastPos = currentPos
      }
    }
  },

  ///////////////// NON-LIFECYCLE

  startDrawing() {
    if (!this.isDrawing) {
      this.lastPos = this.getLocalPenPos(this.pen.position)
      this.isDrawing = true
      this.targetAnim.startLine(this.lastPos)
    }
  },

  stopDrawing() {
    if (this.isDrawing) {
      this.isDrawing = false
      this.targetAnim.finishLine(this.getLocalPenPos(this.pen.position))
    }
  },

  setTargetAnim(targetAnim) {
    console.log('setting target anim')
    this.targetAnim = targetAnim
    // NB: deal with target anim switching in the middle of a line being drawn?
  },

  getLocalPenPos(penPos) {
    const {targetAnim, pen} = this
    let pos = new THREE.Vector3()
    pen.localToWorld(pos)
    this.normanEnt.object3D.worldToLocal(pos)
    return pos
  },

})








