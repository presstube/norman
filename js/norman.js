// import 'aframe'
import _ from 'lodash'
import $ from 'jquery'

import {save, deleteAnim, loadPrev, loadNext} from './firebasestore'

import './anim'
import './animlinesegments'
import './draw'
import './onionskin'
import './homeframeghost'
import './frame'
import './line'

AFRAME.registerComponent('norman', {

  init() {
    // console.log('WHATTT???')
    Object.assign(this, {
      currentFileInfo: null,
      animData: [[]],
      fps: 30,
      maxFPS: 120,
      isAnimPlaying: false,
      isDrawing: false,
      addingFrames: false,
      autoNext: false,
      autoPrev: false,
      homeFrameIndex: 0,
      firstAxisFired: false,
      onionSkins: [],
      onionVisible: false,
      isRightHanded: true,
      fileSystemMode: false,
      // primaryHand: null,
      // secondaryHand: null,
    })

    this.frameInterval = 1000 / this.fps

    this.setupKeyboard()
    _.delay(this.setupControllers.bind(this), 1) // SMELLY!
    this.setupDraw()
    this.setup()
    this.fileLoadPrev()
  },

  setupKeyboard() {
    document.addEventListener('keydown', e => {
      console.log('keydown: ', e)
      if (e.code == 'Enter') {this.togglePlay()} 
      // else if (e.key == 'S') {
      //   // console.log('saving: ')
      //   uploadAnimData(null, {data: this.animData})
      // }
      else if (e.key == 'ArrowLeft' && e.altKey && e.shiftKey) {this.fileLoadPrev(!e.ctrlKey)}
      else if (e.key == 'ArrowRight' && e.altKey && e.shiftKey) {this.fileLoadNext(!e.ctrlKey)}
      else if (e.key == 'ArrowDown' && e.altKey && e.shiftKey && !e.ctrlKey) {this.fileSave()}
      else if (e.key == 'ArrowDown' && e.altKey && e.shiftKey && e.ctrlKey) {this.fileSave(false)}
      else if (e.code == 'KeyX' && e.altKey) {this.fileDelete()}
      else if (e.key == 'o') {this.toggleOnion()}
      else if (e.key == ',') {this.changeFPS(-1)}
      else if (e.key == '.') {this.changeFPS(1)}
      else if (e.key == 't') {this.addLineData([{x:0, y:1, z:2},{x:0, y:1, z:2}], 2)}
    })   
  },

  setupControllers() {
    const controllers =   document.querySelectorAll('a-entity[oculus-touch-controls]'),
          [leftHand, rightHand] = controllers,
          primaryHand = this.isRightHanded ? rightHand : leftHand,
          secondaryHand = this.isRightHanded ? leftHand : rightHand,
          pensphereEnt = document.querySelector("#pensphere"),
          boundFileNew = this.fileNew.bind(this),
          boundFileSave = this.fileSave.bind(this),
          boundFileLoadPrev = this.fileLoadPrev.bind(this),
          boundFileLoadNext = this.fileLoadNext.bind(this),
          boundFileDelete = this.fileDelete.bind(this),
          addFilesystemListeners = () => {
            this.fileSystemMode = true // smelly.. do this with adding and removing listeners
            primaryHand.addEventListener('UP_ON', boundFileNew)
            primaryHand.addEventListener('DOWN_ON', boundFileSave)
            primaryHand.addEventListener('LEFT_ON', boundFileLoadPrev)
            primaryHand.addEventListener('RIGHT_ON', boundFileLoadNext)
            primaryHand.addEventListener('thumbstickdown', boundFileDelete)
          },
          removeFilesystemListeners = () => {
            this.fileSystemMode = false // smelly.. do this with adding and removing listeners
            primaryHand.removeEventListener('UP_ON', boundFileNew)
            primaryHand.removeEventListener('DOWN_ON', boundFileSave)
            primaryHand.removeEventListener('LEFT_ON', boundFileLoadPrev)
            primaryHand.removeEventListener('RIGHT_ON', boundFileLoadNext)
            primaryHand.removeEventListener('thumbstickdown', boundFileDelete)
          }


    Object.assign(this, {secondaryHand, primaryHand})



    primaryHand.setObject3D('pensphereEnt', pensphereEnt.object3D)



    // primaryHand.addEventListener('triggerdown', () => {
    //   this.startDrawing()
    // })
    // primaryHand.addEventListener('triggerup', () => this.stopDrawing())
    primaryHand.addEventListener('abuttondown', e => this.toggleOnion())
    primaryHand.addEventListener('bbuttondown', e => this.togglePlay())
    secondaryHand.addEventListener('triggerdown', e => this.addingFrames = true)
    secondaryHand.addEventListener('triggerup', e => this.addingFrames = false)
    // secondaryHand.addEventListener('Ydown', addFilesystemListeners)
    // secondaryHand.addEventListener('Yup', removeFilesystemListeners)
    secondaryHand.addEventListener('xbuttondown', addFilesystemListeners)
    secondaryHand.addEventListener('xbuttonup', removeFilesystemListeners)
    this.setupThumbStickDirectionEvents(primaryHand, 0.5)
    this.setupThumbStickDirectionEvents(secondaryHand, 0.01)
    secondaryHand.addEventListener('RIGHT_ON', () => {
      this.autoNext = true
      this.handleNext()
    })
    secondaryHand.addEventListener('LEFT_ON', () => {
      this.autoPrev = true
      this.handlePrev()
    })
    secondaryHand.addEventListener('RIGHT_OFF', e => this.autoNext = false)
    secondaryHand.addEventListener('LEFT_OFF', e => this.autoPrev = false)
    primaryHand.addEventListener('axismove', e => {
      if (!this.fileSystemMode) { // smelly.. do this with adding and removing listeners
        if (!this.firstAxisFired) {
          this.firstAxisFired = true
        } else if (!this.isAnimPlaying) {
          this.fps = 0
          this.startPlaying()
        }
        this.changeFPS(e.detail.axis[0])
      }
    })
    secondaryHand.addEventListener('gripdown', e => this.grab())
    secondaryHand.addEventListener('gripup', e => this.drop())
  },

  setupThumbStickDirectionEvents(controller, thresh = 0.5) {
    let left = false,
        right = false,
        up = false,
        down = false,
        c = controller
    c.addEventListener('axismove', e => {
      const [xAxis, yAxis] = e.detail.axis
      if (xAxis > thresh && !right) {
        c.emit('RIGHT_ON')
        right = true
      } else if (xAxis < thresh && right) {
        c.emit('RIGHT_OFF')
        right = false
      } else if (xAxis < -thresh && !left) {
        c.emit('LEFT_ON')
        left = true
      } else if (xAxis > -thresh && left) {
        c.emit('LEFT_OFF')
        left = false
      } else if (yAxis > thresh && !down) {
        c.emit('DOWN_ON')
        down = true
      } else if (yAxis < thresh && down) {
        c.emit('DOWN_OFF')
        down = false
      } else if (yAxis < -thresh && !up) {
        c.emit('UP_ON')
        up = true
      } else if (yAxis > -thresh && up) {
        c.emit('UP_OFF')
        up = false
      }
    })
  },

  setup(animData = [[]]) {
    this.animData = animData
    // this.addAnim()
    this.addAnimLineSegments()
    // this.addHomeFrameGhost()
    // this.setupOnionSkin()
    this.drawComp.setTargetAnim(this.animComp)
  },

  teardown() {
    // this.stopPlaying()
    // this.removeHomeFrameGhost()
    // this.removeOnionSkin()
    this.removeAnim()
    this.animData = []
    this.currentFileInfo = null
  },

  fileNew() {
    // console.log('NEW')
    this.teardown()
    this.el.setAttribute('position', '0 0 0')
    this.el.setAttribute('rotation', '0 0 0')
    this.setup()
  },

  fileSave(overwrite = true) {
    // console.log('SAVE')
    if (overwrite) {
      console.log('overwrite')
      save({data: this.animData}, this.currentFileInfo)
    } else {
      console.log('save duplicate')
      save({data: this.animData})
    }
  },

  fileDelete() {
    console.log('deleting')
    deleteAnim(this.currentFileInfo)
    this.fileNew()
  },

  fileLoadPrev(doTeardown = true) {
    if (this.addingFrames) doTeardown = false
    // console.log('LOAD PREV', doTeardown)
    loadPrev(this.currentFileInfo).then(({animData, currentFileInfo}) => {
      console.log('LOAD PREV', animData)
      if (doTeardown) this.teardown()
      // console.log('animData: ', animData, currentFileInfo)
      this.currentFileInfo = currentFileInfo
      this.setup(animData)
    })
  },

  fileLoadNext(doTeardown = true) {
    if (this.addingFrames) doTeardown = false
    loadNext(this.currentFileInfo).then(({animData, currentFileInfo}) => {
      console.log('LOAD NEXT', animData)
      if (doTeardown) this.teardown()
      // console.log('animData: ', animData, currentFileInfo)
      this.currentFileInfo = currentFileInfo
      this.setup(animData)
    })
  },

  handleNext() {
    if (this.addingFrames) {
      this.insertFrameAfter()
    } else {
      this.animComp.gotoNextFrame()
    }
  },

  handlePrev() {
    if (this.addingFrames) {
      this.insertFrameBefore()
    } else {
      this.animComp.gotoPrevFrame()
    }
  },

  setupOnionSkin() {
    const {animData} = this
    this.onionSkins = [
      this.addOnionSkin({
        animData,
        framesToSkin: [-2],
        color: 'orange',
        style: 'dashed',
        opacity: 0.4
      }),
      this.addOnionSkin({
        animData,
        framesToSkin: [-1],
        color: 'orange',
        style: 'solid',
        opacity: 0.6
      }),
      this.addOnionSkin({
        animData,
        framesToSkin: [1],
        color: 'blue',
        style: 'solid',
        opacity: 0.6
      }),
      this.addOnionSkin({
        animData,
        framesToSkin: [2],
        color: 'blue',
        style: 'dashed',
        opacity: 0.4
      })    
    ]
  },

  removeOnionSkin() {
    this.onionSkins.map(onionSkinEnt => {
      this.el.removeChild(onionSkinEnt)
    })
    this.onionSkins = []
  },

  toggleOnion() {
    const {el} = this
    if (this.onionVisible) {
      this.onionVisible = false
      el.emit('ONION_OFF')
    } else {
      this.onionVisible = true
      el.emit('ONION_ON')
    }
  },

  changeFPS(amount) {
    this.fps += amount
    this.frameInterval = 1000 / this.fps
    const {maxFPS} = this
    if (this.fps > maxFPS) {
      this.fps = maxFPS
    } else if (this.fps < - maxFPS) {
      this.fps = -maxFPS
    }
  },

  grab() {
    let {secondaryHand, el} = this
    this.grabbed = true
    var norm = el.object3D
    var hand = secondaryHand.object3D
    hand.updateMatrixWorld()
    var worldToLocal = new THREE.Matrix4().getInverse(hand.matrixWorld)
    hand.add(norm)
    norm.applyMatrix(worldToLocal)
  },

  drop() {
    this.grabbed = false
    const {secondaryHand, el} = this,
      norm = el.object3D,
      pos = norm.getWorldPosition(),
      rot = norm.getWorldRotation(),
      {radToDeg} = THREE.Math
    el.sceneEl.object3D.add(norm)
    el.setAttribute('position', pos);
    el.setAttribute('rotation', {
      x: radToDeg(rot.x),
      y: radToDeg(rot.y),
      z: radToDeg(rot.z)
    })
  },

  // startDrawing() {
  //   if (!this.isDrawing) {
  //     this.isDrawing = true
  //   }
  // },

  // stopDrawing() {
  //   if (this.isDrawing) {
  //     this.isDrawing = false
  //   }
  // },

  togglePlay() {
    if (this.isAnimPlaying) {
      this.stopPlaying()
    } else {
      this.startPlaying()
    }
  },

  startPlaying() {
    this.isAnimPlaying = true
    this.el.emit('STARTED_PLAYING')
  },

  stopPlaying() {
    this.isAnimPlaying = false
    this.el.emit('STOPPED_PLAYING')
  },

  setupDraw() {
    const {el} = this,
          drawEnt = document.createElement('a-entity')

    drawEnt.setAttribute('draw', {})
    el.appendChild(drawEnt)
    Object.assign(this, {
      drawEnt, 
      drawComp: drawEnt.components.draw 
    })
  },

  // removeDrawline() {
  //   this.el.removeChild(this.drawEnt)
  // },

  // addAnim() {
  //   this.animEnt = document.createElement('a-entity')
  //   const {animEnt, el, animData} = this
  //   animEnt.setAttribute('anim', {norman: '#norman', animData})
  //   animEnt.setAttribute('id', 'anim')
  //   this.animComp = animEnt.components.anim
  //   el.appendChild(animEnt)
  // },

  addAnimLineSegments() {
    this.animEnt = document.createElement('a-entity')
    const {animEnt, el, animData} = this
    animEnt.setAttribute('animlinesegments', {norman: '#norman', animData})
    animEnt.setAttribute('id', 'anim')
    this.animComp = animEnt.components.animlinesegments
    el.appendChild(animEnt)
  },

  removeAnim() {
    const {el, animEnt} = this
    el.removeChild(animEnt)
    this.animEnt = null
  },

  addOnionSkin(props) {
    const onionSkinEnt = document.createElement('a-entity'),
          {el} = this
    onionSkinEnt.setAttribute('onionskin', _.assign(props, {norman: '#norman'}))
    onionSkinEnt.setAttribute('id', 'onionskin')
    el.appendChild(onionSkinEnt)
    return onionSkinEnt
  },

  addHomeFrameGhost() {
    this.hfg = document.createElement('a-entity')
    const {el, animData, hfg} = this
    el.appendChild(hfg)
    hfg.setAttribute('id', 'homeframeghost')
    hfg.setAttribute('homeframeghost', {
      norman: '#norman',
      frameData: animData[0],
      color: 'green',
      style: 'dashed',
      opacity: 0.2
    })
  },

  removeHomeFrameGhost() {
    this.el.removeChild(this.hfg)
    this.hfg = null
  },

  addLineData(lineData, frameIndex) {
    const {animData, el, homeFrameIndex} = this
    animData[frameIndex].push(lineData)
    el.emit('LINE_ADDED', {lineData, frameIndex})
    if (frameIndex === homeFrameIndex) {
      el.emit('HOME_FRAME_LINE_ADDED', {lineData})
    }
  },

  addFrame(position, frameIndex) {
    const {homeFrameIndex, el, animData} = this
    let insertIndex
    if (position === 'after') {
      insertIndex = frameIndex + 1
    } else if (position === 'before') {
      insertIndex = frameIndex
    }
    if (insertIndex <= homeFrameIndex) this.homeFrameIndex++
    animData.splice(insertIndex, 0, [])
    el.emit('FRAME_ADDED', {insertIndex})
  },

  insertFrameAfter() {
    const {animComp} = this
    this.addFrame('after', animComp.currentFrame)
    animComp.gotoNextFrame()
  },

  insertFrameBefore() {
    const {animComp} = this
    this.addFrame('before', animComp.currentFrame)
    animComp.renderFrame()
  },

  // saveAnimDataFile() {
  //   const {animData: data} = this,
  //         dataToSave = {data},
  //         dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataToSave)),
  //         dlAnchorElem = document.getElementById('downloadAnchorElem')
  //   dlAnchorElem.setAttribute('href', dataStr)
  //   dlAnchorElem.setAttribute('download', 'test.json')
  //   dlAnchorElem.click()
  // },

})