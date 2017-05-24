// import 'aframe'
import _ from 'lodash'

AFRAME.registerComponent('draw', {

  // schema: {
  // },

  init() {
    Object.assign(this, {
      // fetching own deps.. pyucky or appropriately loose?
      norman: document.querySelector('#norman').components.norman,
      primaryHand: Array.prototype.slice.call(document.querySelectorAll('a-entity[oculus-touch-controls]'))[1],

      isDrawing: false,
      distThresh: 0.001,
      lastPos: null,
    })

    const {primaryHand} = this

    primaryHand.addEventListener('triggerdown', () => {
      this.startDrawing()
    })

    primaryHand.addEventListener('triggerup', () => {
      this.stopDrawing()
    })

    console.log('draw here: ', primaryHand)
  },
  
  remove() {
    // never gets removed?
  },

  tick() {
    const {isDrawing, primaryHand} = this
    if (isDrawing) {
      console.log('drawing!: ', isDrawing)
    }
  },

  ///////////////// NON-LIFECYCLE

  startDrawing() {
    console.log('startgin ')
    if (!this.isDrawing) {
      this.isDrawing = true
    }
  },

  stopDrawing() {
    if (this.isDrawing) {
      this.isDrawing = false
    }
  },

  setTargetAnim(targetAnim) {
    // console.log('setting target anim')
    this.targetAnim = targetAnim
    // deal with target anim switching in the middle of a line being drawn?
  }

})