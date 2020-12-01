
import _ from 'lodash'
import $ from 'jquery'

import {save, deleteComp, loadPrev, loadNext, loadAnimByName} from './firebasestore-multiuser'
import {abstractABXY, setupThumbStickDirectionEvents} from './oculustouchhelpers'
import './anim'
import RegMarker from './regmarker'

AFRAME.registerComponent('norman', {

  init() {

    this.currentFileInfo = null
    this.fps = 30
    this.isAnimPlaying = false
    this.isDrawing = false
    this.isInsertMode = false
    this.isFileMode = false
    this.isGasPedalMode = false
    this.isRightHanded = true
    this.secondaryHand = null
    this.primaryHand = null
    this.frameInterval = 1000 / this.fps
    this.tracks = []
    this.selectedTrackEnt = null
    this.selectedTrackComp = null
    this.fileInfo = null
    this.lastPos = null
    this.pen = null
    this.distThresh = 0.001
    this.autoPrev = false
    this.autoNext = false
    this.grabbedBy = null
    this.lightColor = '#ddd'
    this.darkColor = '#000'
    this.bgColor = '#ddd'
    this.fgColor = '#000'
    this.compData = null

    this.STARTED_PLAYING = 'STARTED_PLAYING'
    this.STOPPED_PLAYING = 'STOPPED_PLAYING'
    this.ENTERED_FILE_MODE = 'ENTERED_FILE_MODE'
    this.EXITED_FILE_MODE = 'EXITED_FILE_MODE'
    this.ENTERED_INSERT_MODE = 'ENTERED_INSERT_MODE'
    this.EXITED_INSERT_MODE = 'EXITED_INSERT_MODE'
    this.SELECTED_TRACK_CHANGED = 'EXITED_INSERT_MODE'

    this.boundFileNew = this.fileNew.bind(this)
    this.boundFileSave = this.fileSave.bind(this)
    this.boundFileLoadPrev = this.fileLoadPrev.bind(this)
    this.boundFileLoadNext = this.fileLoadNext.bind(this)
    this.boundFileDelete = this.fileDelete.bind(this)

    this.setupKeyboard()

    this.setupSceneMarker()

    // SMELLY delay!
    _.delay(() => {
      this.setupControllers()
      // this.fileLoadPrev()
      // this.buildComp(hearts.compData)
      window.lbn = window.loadByName = this.fileLoadByName.bind(this)
      // window.lbn('trulmy-prunt-squeefs')
      // window.lbn("gildered-brine-clamps")
      // window.lbn("brumpled-brine-hops")

    }, 1) 


  },

  tick(time, timeDelta) {
    this.handleDraw()
  },

  setupKeyboard() {
    document.addEventListener('keydown', e => {
      console.log('keydown: ', e)
      if (e.code == 'Enter') {this.togglePlay()} 
      // if (e.code == 'Space') {this.fileLoadPrev()} 
      else if (e.key == 'ArrowLeft' && e.altKey && e.shiftKey) {this.fileLoadPrev(!e.ctrlKey)}
      
      else if (e.key == 'c') { 
        this.flipColors()
      }      
      else if (e.key == 's') { 
        this.fileSave()
      }

      // secret key shortcut for setReg
      else if (e.code == 'Space' && e.altKey && e.shiftKey) {this.setReg()} 

      else if (e.code == 'Space' && e.altKey && e.shiftKey) {this.setReg()} 
      // need to manually save and refresh after doing this for now...

    })
  },

  flipColors() {
    if (this.bgColor === this.lightColor) {
      this.setColors(this.darkColor, this.lightColor)   
    } else {
      this.setColors(this.lightColor, this.darkColor)   
    }
  },

  setColors(bgColor, fgColor) {
    this.bgColor = bgColor
    this.fgColor = fgColor
    const {el, sceneMarker} = this
    const sky =   document.querySelectorAll('a-sky')[0]
    sky.setAttribute('color', bgColor)
    el.sceneEl.setAttribute('fog', {color: bgColor})
    this.buildComp(this.compData, this.fileInfo)

    console.log('flipping colors: ', sky)
  },

  setReg() {
    const {el, sceneMarker} = this
    const normObj3D = el.object3D
    sceneMarker.updateMatrixWorld()
    const worldToLocal = new THREE.Matrix4().getInverse(sceneMarker.matrixWorld)
    sceneMarker.add(normObj3D)
    normObj3D.applyMatrix(worldToLocal)

    _.each(this.tracks, (animToTransform) => {
      const animDataNewReg = this.transformAnimData(animToTransform.components.anim.animData, normObj3D.matrix)
      animToTransform.components.anim.animData = animDataNewReg
    })
  },

  transformAnimData(animData, matrixToApply) {
    return _.map(animData, (frame) => {
      return _.map(frame, (line) => {
        return _.map(line, (point) => {
          const {x, y, z} = point
          const p = new THREE.Vector3(x, y, z)
          p.applyMatrix4(matrixToApply)
          return p
        })
      })
    })
  },

  setupControllers() {
    const controllers =   document.querySelectorAll('a-entity[oculus-touch-controls]'),
          [leftHand, rightHand] = controllers,
          primaryHand = this.isRightHanded ? rightHand : leftHand,
          secondaryHand = this.isRightHanded ? leftHand : rightHand,
          pensphereEnt = document.querySelector("#pensphere"),
          pensphereSecEnt = document.querySelector("#penspheresecondary")

    primaryHand.setObject3D('pensphereEnt', pensphereEnt.object3D)
    secondaryHand.setObject3D('pensphereSecEnt', pensphereSecEnt.object3D)
    this.pen = primaryHand.object3D

    setupThumbStickDirectionEvents(primaryHand, 0.7)
    setupThumbStickDirectionEvents(secondaryHand, 0.7)
    abstractABXY(leftHand, 'left')
    abstractABXY(rightHand, 'right')
    Object.assign(this, {secondaryHand, primaryHand})

    primaryHand.addEventListener('triggerdown', () => this.handlePrimaryTriggerDown())
    primaryHand.addEventListener('triggerup', () => this.handlePrimaryTriggerUp()) 
    primaryHand.addEventListener('gripdown', e => this.handlePrimaryGripDown(e))
    primaryHand.addEventListener('gripup', e => this.handlePrimaryGripUp(e))
    primaryHand.addEventListener('upperbuttondown', () => this.handlePrimaryUpperButtonDown())

    secondaryHand.addEventListener('gripdown', e => this.handleSecondaryGripDown(e))
    secondaryHand.addEventListener('gripup', e => this.handleSecondaryGripUp(e))
    secondaryHand.addEventListener('triggerdown', () => this.handleSecondaryTriggerDown())
    secondaryHand.addEventListener('triggerup', () => this.handleSecondaryTriggerUp())
    secondaryHand.addEventListener('lowerbuttondown', ()=> this.handleSecondaryLowerButtonDown())
    secondaryHand.addEventListener('lowerbuttonup', ()=> this.handleSecondaryLowerButtonUp())
    secondaryHand.addEventListener('upperbuttondown', ()=> this.handleSecondaryUpperButtonDown())
    secondaryHand.addEventListener('upperbuttonup', ()=> this.handleSecondaryUpperButtonUp())
    secondaryHand.addEventListener('UP_ON', () => this.handleSecondaryUpOn())
    secondaryHand.addEventListener('DOWN_ON', () => this.handleSecondaryDownOn())
    secondaryHand.addEventListener('LEFT_ON', () => this.handleSecondaryLeftOn())
    secondaryHand.addEventListener('RIGHT_ON', () => this.handleSecondaryRightOn())
    secondaryHand.addEventListener('LEFT_OFF', () => this.handleSecondaryLeftOff())
    secondaryHand.addEventListener('RIGHT_OFF', () => this.handleSecondaryRightOff())
    secondaryHand.addEventListener('thumbstickdown', () => this.handleSecondaryThumbstickDown())
  },

  addFileModeListeners() {
    const {primaryHand} = this
    primaryHand.addEventListener('DOWN_ON', this.boundFileSave)
    primaryHand.addEventListener('UP_ON', this.boundFileNew)
    primaryHand.addEventListener('LEFT_ON', this.boundFileLoadPrev)
    primaryHand.addEventListener('RIGHT_ON', this.boundFileLoadNext)
    primaryHand.addEventListener('thumbstickdown', this.boundFileDelete)
  },

  removeFileModeListeners() {
    const {primaryHand} = this
    primaryHand.removeEventListener('DOWN_ON', this.boundFileSave)
    primaryHand.removeEventListener('UP_ON', this.boundFileNew)
    primaryHand.removeEventListener('LEFT_ON', this.boundFileLoadPrev)
    primaryHand.removeEventListener('RIGHT_ON', this.boundFileLoadNext)
    primaryHand.removeEventListener('thumbstickdown', this.boundFileDelete)
  },

  setupSceneMarker() {
    this.sceneMarker = new RegMarker(this.el.sceneEl.object3D, 'black')
    Object.assign(this.sceneMarker.position, this.el.getAttribute('position'))

    // proof of reparenting in
    // const cube = new THREE.Mesh( new THREE.CubeGeometry( 0.1, 0.1, 0.1 ), new THREE.MeshNormalMaterial() )
    // this.sceneMarker.add(cube)
  },

  // FILE OPS

  buildComp(compData, fileInfo) {
    const {tracks} = this
    this.removeAllTracks()
    this.fileInfo = fileInfo
    this.compData = compData
    if (compData) {
      compData.forEach(trackData => {
        this.addTrack(trackData)
      })
    } else {
      this.addTrack()
    }
  },

  fileNew() {
    const {tracks} = this
    this.removeAllTracks()
    this.fileInfo = null
    this.addTrack()
  },

  fileSave() {

    // if it's in insert mode case a new duplicate to be saved
    // by nulling the fileInfo
    const toSaveFileInfo = this.isInsertMode ? null : this.fileInfo

    const {tracks} = this
    const compData = tracks.map(track => track.components.anim.animData)
    save({compData}, toSaveFileInfo).then(fileInfo => {
      console.log('just saved: ', fileInfo)
      this.fileInfo = fileInfo
    })
  },

  fileLoadPrev() {
    const {fileInfo} = this
    loadPrev(fileInfo).then(({file, fileInfo}) => {
      console.log('loaded prev: ', file, fileInfo)
      this.buildComp(file.compData, fileInfo)
    })
  },

  fileLoadNext() {
    const {fileInfo} = this
    loadNext(fileInfo).then(({file, fileInfo}) => {
      console.log('loaded next: ', file, fileInfo)
      this.buildComp(file.compData, fileInfo)
    })
  },

  fileDelete() {
    const {fileInfo} = this
    console.log('deleting: ', fileInfo)
    deleteComp(fileInfo)
  },

  fileLoadByName(name) {
    console.log('loading by name: ', name)
    loadAnimByName(name).then(({file, fileInfo}) => {
      console.log('loaded by name: ', file, fileInfo)
      this.buildComp(file.compData, fileInfo)
    })
  },

  // CTRL

  handlePrimaryTriggerDown() {
    this.startDrawing()
  },

  handlePrimaryTriggerUp() {
    this.stopDrawing()
  },

  handlePrimaryUpperButtonDown() {
    this.togglePlay()
  },

  handleSecondaryLowerButtonDown() {
    this.enterFileMode()
  },

  handleSecondaryLowerButtonUp() {
    this.exitFileMode()
  },

  handleSecondaryUpperButtonDown() {
    console.log('enter gas pedal mode')
    this.flipColors()
  },

  handleSecondaryUpperButtonUp() {
    console.log('exit gas pedal mode')
  },

  handleSecondaryTriggerDown() {
    this.enterInsertMode()
  },

  handleSecondaryTriggerUp() {
    this.exitInsertMode()
  },

  handlePrimaryGripDown({target: hand}) {
    this.grab(hand)
  },

  handlePrimaryGripUp({target: hand}) {
    this.ungrab(hand)
  },

  handleSecondaryGripDown({target: hand}) {
    this.grab(hand)
  },

  handleSecondaryGripUp({target: hand}) {
    this.ungrab(hand)
  },

  handleSecondaryUpOn() {
    if (this.isInsertMode) {
      this.addTrack()
    } else {
      this.selectPrevTrack()
    }
  },

  handleSecondaryDownOn() {
    if (this.isInsertMode) {
      this.removeTrack(this.selectedTrackEnt)
    } else {
      this.selectNextTrack()
    }
  },

  handleSecondaryLeftOn() {
    const {isInsertMode, selectedTrackComp, selectedTrackEnt} = this
    this.autoPrev = true
    if (isInsertMode) {
      selectedTrackComp.insertFrameAt('before')
    } else {
      selectedTrackComp.gotoPrevFrame()
    }
  },
 
  handleSecondaryLeftOff() {
    this.autoPrev = false
  },

  handleSecondaryRightOn() {
    const {isInsertMode, selectedTrackComp, selectedTrackEnt, pen, isDrawing} = this,
          pos = selectedTrackComp.getLocalPenPos(pen.position)
    
    this.autoNext = true

    // insert straight-line flag here
    if (isDrawing) {
      selectedTrackComp.finishLine(selectedTrackComp.getLocalPenPos(this.pen.position))
    }

    if (isInsertMode) {
      selectedTrackComp.insertFrameAt('after')
    } else {
      selectedTrackComp.gotoNextFrame()
    }
    
    // insert straight-line flag here
    if (isDrawing) {
      selectedTrackComp.startLine(pos)
    }
  },

  handleSecondaryRightOff() {
    this.autoNext = false
  },

  handleSecondaryThumbstickDown() {
    const {isInsertMode, selectedTrackComp} = this
    if (isInsertMode) selectedTrackComp.removeFrame()
  }, 

  // MODIFIERS



  addTrack(trackData) {
    const animEnt = document.createElement('a-entity'),
          {el, tracks} = this

    animEnt.setAttribute('anim', {
      norman: '#norman', 
      animData: (!trackData) ? [[]] : trackData
    })
    el.appendChild(animEnt)
    this.setSelectedTrack(animEnt)
    tracks.push(animEnt)
  },

  removeTrack(track) {
    const {el, tracks} = this

    _.remove(tracks, track)
    el.removeChild(track)

    // this is not good.. think of a better way
    this.setSelectedTrack(_.last(tracks))
  },

  removeAllTracks() {
    const {el, tracks} = this
    tracks.forEach(track => el.removeChild(track))
    this.tracks = []
    this.setSelectedTrack(null)
  },

  setSelectedTrack(trackEnt) {
    const {el, SELECTED_TRACK_CHANGED} = this
    if (trackEnt) {
      this.selectedTrackEnt = trackEnt
      this.selectedTrackComp = trackEnt.components.anim
    } else {
      this.selectedTrackEnt = null
      this.selectedTrackComp = null
    }
    el.emit(SELECTED_TRACK_CHANGED)
  },

  selectPrevTrack() {
    const {selectedTrackEnt, tracks} = this
    let index = _.findIndex(tracks, selectedTrackEnt)

    if (index - 1 === -1) {
      index = tracks.length - 1
    } else {
      index = index - 1
    }

    this.setSelectedTrack(tracks[index])
  },

  selectNextTrack() {
    const {selectedTrackEnt, tracks} = this
    let index = _.findIndex(tracks, selectedTrackEnt)

    if (index + 1 === tracks.length) {
      index = 0
    } else {
      index = index + 1
    }
    this.setSelectedTrack(tracks[index])
  },

  startDrawing() {
    const {selectedTrackComp} = this
    if (!this.isDrawing) {
      this.lastPos = selectedTrackComp.getLocalPenPos(this.pen.position)
      this.isDrawing = true
      selectedTrackComp.startLine(this.lastPos)
    }
  },

  handleDraw() {
    const {selectedTrackComp} = this
    if (this.isDrawing) {
      const {pen, distThresh, lastPos, selectedTrackComp} = this,
            currentPos = selectedTrackComp.getLocalPenPos(pen.position),
            distToLastPos = lastPos.distanceTo(currentPos)
      if (distToLastPos > distThresh) {
        selectedTrackComp.addToLine(currentPos)
        this.lastPos = currentPos
      }
    }
  },

  stopDrawing() {
    const {selectedTrackComp} = this
    if (this.isDrawing) {
      this.isDrawing = false
      selectedTrackComp.finishLine(selectedTrackComp.getLocalPenPos(this.pen.position))
      if (this.autoNext) this.handleSecondaryRightOn()
      if (this.autoPrev) this.handleSecondaryLeftOn()
    }
  },

  grab(hand) {

    const {grabbedBy} = this

    if (grabbedBy) {

      // nasty hack until I can up my matrix game enough to
      // properly reparent from anywhere to anywhere
      // but for now...
      this.ungrab(grabbedBy)
      _.delay(() => this.grab(hand), 1)
      return

    } else {
      this.grabbedBy = hand
      
      const {el} = this,
            handObj3D = hand.object3D,
            normObj3D = el.object3D

      handObj3D.updateMatrixWorld()
      var worldToLocal = new THREE.Matrix4().getInverse(handObj3D.matrixWorld)
      handObj3D.add(normObj3D)
      normObj3D.applyMatrix(worldToLocal)
    }

  },

  ungrab(hand) {

    const {grabbedBy} = this

    if (grabbedBy === hand) {
      this.grabbedBy = null
      const {el} = this,
        normObj3D = el.object3D,
        pos = normObj3D.getWorldPosition(),
        rot = normObj3D.getWorldRotation(),
        {radToDeg} = THREE.Math

      el.sceneEl.object3D.add(normObj3D)
      el.setAttribute('position', pos);
      el.setAttribute('rotation', {
        x: radToDeg(rot.x),
        y: radToDeg(rot.y),
        z: radToDeg(rot.z)
      })
    }
    
  },

  togglePlay() {
    if (this.isAnimPlaying) {
      this.stopPlaying()
    } else {
      this.startPlaying()
    }
  },

  startPlaying() {
    const {el, STARTED_PLAYING} = this
    this.isAnimPlaying = true
    el.emit(STARTED_PLAYING)
  },

  stopPlaying() {
    const {el, STOPPED_PLAYING} = this
    this.isAnimPlaying = false
    el.emit(STOPPED_PLAYING)
  },

  enterFileMode() {
    const {el, ENTERED_FILE_MODE} = this
    this.isFileMode = true
    this.addFileModeListeners()
    el.emit(ENTERED_FILE_MODE)
  },

  exitFileMode() {
    const {el, EXITED_FILE_MODE} = this
    this.removeFileModeListeners()
    this.isFileMode = false
    el.emit(EXITED_FILE_MODE)
  },

  enterInsertMode() {
    const {el, ENTERED_INSERT_MODE} = this
    this.isInsertMode = true
    el.emit(ENTERED_INSERT_MODE)
  },

  exitInsertMode() {
    const {el, EXITED_INSERT_MODE} = this
    this.isInsertMode = false
    el.emit(EXITED_INSERT_MODE)
  },



})



