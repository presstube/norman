import 'aframe'
import _ from 'lodash'
import $ from 'jquery'

import './anim'
import './drawline'
import './onionskin'
import './homeframeghost'
import './frame'
import './line'

AFRAME.registerComponent('norman', {

  init: function () {
    this.animData = [[]]
    this.fps = 30
    this.maxFPS = 120
    this.frameInterval = 1000 / this.fps
    this.isAnimPlaying = false
    this.isDrawing = false
    this.addingFrames = false
    this.autoNext = false
    this.autoPrev = false
    this.homeFrameIndex = 0
    this.firstAxisFired = false
    this.onionVisible = false
    // needs this in order to pickup the controllers?
    this.setupKeyboard()
    _.delay(this.setupControllers.bind(this), 1) 

    $.getJSON('webvr-exports/cone-1.json', function(json) {
      this.animData = json.data
      
      this.addAnim()

      this.addHomeFrameGhost()

      this.addOnionSkin({
        animData: this.animData,
        framesToSkin: [-2],
        color: 'orange',
        style: 'dashed',
        opacity: 0.4
      })
      this.addOnionSkin({
        animData: this.animData,
        framesToSkin: [-1],
        color: 'orange',
        style: 'solid',
        opacity: 0.6
      })
      this.addOnionSkin({
        animData: this.animData,
        framesToSkin: [1],
        color: 'blue',
        style: 'solid',
        opacity: 0.6
      })
      this.addOnionSkin({
        animData: this.animData,
        framesToSkin: [2],
        color: 'blue',
        style: 'dashed',
        opacity: 0.4
      })

      // this.startPlaying.bind(this)
      // _.delay(, 0)
      this.startPlaying()
    }.bind(this))

  },

  setupKeyboard: function() {
    document.addEventListener('keydown', function(e) {
      // console.log('keydown: ', e)
      if (e.code == 'Enter') {
        this.togglePlay()
      } else if (e.key == 'S') {
        // this.logAnimData()
        console.log('SAVE')
        this.saveAnimDataFile()
      }
    }.bind(this))   
  },

  setupControllers: function() {

    this.controllers = Array.prototype.slice.call(document.querySelectorAll('a-entity[oculus-touch-controls]'))

    var pensphereEnt = document.querySelector("#pensphere")
    this.controllers[1].setObject3D('pensphereEnt', pensphereEnt.object3D)

    this.controllers[1].addEventListener('triggerdown', function() {
      this.startDrawing()
    }.bind(this))

    this.controllers[1].addEventListener('triggerup', function() {
      this.stopDrawing()
    }.bind(this))

    this.controllers[1].addEventListener('Adown', function(e) {
      this.toggleOnion()
    }.bind(this))

    this.controllers[1].addEventListener('Bdown', function(e) {
      this.togglePlay()
    }.bind(this))

    this.controllers[0].addEventListener('triggerdown', function(e) {
      this.addingFrames = true
    }.bind(this))

    this.controllers[0].addEventListener('triggerup', function(e) {
      this.addingFrames = false
    }.bind(this))

    this.controllers[0].addEventListener('Ydown', function(e) {
      this.autoNext = true
      this.insertFrameAfter()
    }.bind(this))

    this.controllers[0].addEventListener('Yup', function(e) {
      this.autoNext = false
    }.bind(this))

    this.controllers[0].addEventListener('Xdown', function(e) {
      this.autoPrev = true
      if (this.addingFrames) {
        this.insertFrameBefore() 
      } else {
        this.animComp.gotoPrevFrame()
      }
    }.bind(this))

    this.controllers[0].addEventListener('Xup', function(e) {
      this.autoPrev = false
    }.bind(this))

    this.controllers[0].addEventListener('axismove', function(e) {
      if (!this.firstAxisFired) {
        this.firstAxisFired = true
      } else if (!this.isAnimPlaying) {
        this.fps = 0
        this.startPlaying()
      }
      this.changeFPS(e.detail.axis[0])
    }.bind(this))

    this.controllers[0].addEventListener('gripdown', function(e) {
      this.grab()
    }.bind(this))

    this.controllers[0].addEventListener('gripup', function(e) {
      this.drop()
    }.bind(this))

  },

  toggleOnion: function() {

    if (this.onionVisible) {
      this.onionVisible = false
      this.el.emit('ONION_OFF')
    } else {
      this.onionVisible = true
      this.el.emit('ONION_ON')
    }
  },

  changeFPS: function(amount) {
    this.fps += amount
    this.frameInterval = 1000 / this.fps
    if (this.fps > this.maxFPS) {
      this.fps = this.maxFPS
    } else if (this.fps < - this.maxFPS) {
      this.fps = -this.maxFPS
    }
  },

  grab: function() {
    this.grabbed = true
    var norm = this.el.object3D
    var hand = this.controllers[0].object3D
    hand.updateMatrixWorld()
    var worldToLocal = new THREE.Matrix4().getInverse(hand.matrixWorld)
    hand.add(norm)
    norm.applyMatrix(worldToLocal)
  },

  drop: function() {
    this.grabbed = false
    var norm = this.el.object3D
    var hand = this.controllers[0].object3D
    var pos = norm.getWorldPosition()
    var rot = norm.getWorldRotation()
    this.el.sceneEl.object3D.add(norm)
    this.el.setAttribute('position', pos);
    this.el.setAttribute('rotation', {
      x: THREE.Math.radToDeg(rot.x),
      y: THREE.Math.radToDeg(rot.y),
      z: THREE.Math.radToDeg(rot.z)
    });
  },

  startDrawing: function() {
    if (!this.isDrawing) {
      this.isDrawing = true
      this.addDrawline()
    }
  },

  stopDrawing: function() {
    if (this.isDrawing) {
      this.isDrawing = false
      this.removeDrawline()
    }
  },

  togglePlay: function() {
    if (this.isAnimPlaying) {
      this.stopPlaying()
    } else {
      this.startPlaying()
    }
  },

  startPlaying: function() {
    this.isAnimPlaying = true
    this.el.emit('STARTED_PLAYING')
  },

  stopPlaying: function() {
    this.isAnimPlaying = false
    this.el.emit('STOPPED_PLAYING')
  },

  addDrawline: function() {
    this.drawlineEnt = document.createElement('a-entity')
    this.drawlineEnt.setAttribute('drawline', {norman: '#norman'})
    this.el.appendChild(this.drawlineEnt)
  },

  removeDrawline: function() {
    this.el.removeChild(this.drawlineEnt)
  },

  addAnim: function() {
    this.animEnt = document.createElement('a-entity')
    this.animEnt.setAttribute('anim', {norman: '#norman'})
    this.animEnt.setAttribute('id', 'anim')
    this.animComp = this.animEnt.components.anim
    this.animComp.setAnimData(this.animData)
    this.el.appendChild(this.animEnt)
  },

  addOnionSkin: function(props) {
    this.onionSkinEnt = document.createElement('a-entity')
    this.onionSkinEnt.setAttribute('onionskin', _.assign(props, {norman: '#norman'}))
    this.onionSkinEnt.setAttribute('id', 'onionskin')
    this.el.appendChild(this.onionSkinEnt)
  },

  addHomeFrameGhost: function() {
    this.homeFrameGhostEnt = document.createElement('a-entity')
    this.el.appendChild(this.homeFrameGhostEnt)
    this.homeFrameGhostEnt.setAttribute('id', 'homeframeghost')
    this.homeFrameGhostEnt.setAttribute('homeframeghost', {
      norman: '#norman',
      frameData: this.animData[0],
      color: 'green',
      style: 'dashed',
      opacity: 0.2
    })
  },

  addLineData: function(lineData, frameIndex) {
    this.animData[frameIndex].push(lineData)
    this.el.emit('LINE_ADDED', {lineData: lineData, frameIndex: frameIndex})
    if (frameIndex === this.homeFrameIndex) {
      this.el.emit('HOME_FRAME_LINE_ADDED', {lineData: lineData})
    }
  },

  addFrame: function(position, frameIndex) {
    var insertIndex
    if (position === 'after') {
      // console.log('adding a frame after')
      insertIndex = frameIndex + 1
    } else if (position === 'before') {
      // console.log('adding a frame before')
      insertIndex = frameIndex
    }
    // this double-accounting is smelly, but for now...
    if (insertIndex <= this.homeFrameIndex) this.homeFrameIndex++
    this.animData.splice(insertIndex, 0, [])
    this.el.emit('FRAME_ADDED', {insertIndex: insertIndex})
    // this.frameEntities.splice(insertIndex, 0, this.makeFrameEntity([]))
  },

  insertFrameAfter: function() {
    if (this.addingFrames) this.addFrame('after', this.animComp.currentFrame)
    this.animComp.gotoNextFrame()
  },

  insertFrameBefore: function() {
    this.addFrame('before', this.animComp.currentFrame)
    this.animComp.renderFrame()
  },

  saveAnimDataFile: function() {
    var dataToSave = {data: this.animData}
    var dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataToSave))
    var dlAnchorElem = document.getElementById('downloadAnchorElem')
    dlAnchorElem.setAttribute('href', dataStr)
    dlAnchorElem.setAttribute('download', 'test.json')
    dlAnchorElem.click()
  },

})