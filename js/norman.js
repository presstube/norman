
import _ from 'lodash'
import $ from 'jquery'

import {save, deleteComp, loadPrev, loadNext, loadAnimByName} from './firebasestore-multitrack'
import {loadPrev as loadPrevOld, loadNext as loadNextOld, loadAnimByName as loadAnimByNameOld} from './firebasestore'
import {abstractABXY, setupThumbStickDirectionEvents} from './oculustouchhelpers'
import './anim'

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
    this.fileInfoOld = null
    this.lastPos = null
    this.pen = null
    this.distThresh = 0.001
    this.autoPrev = false
    this.autoNext = false
    this.grabbedBy = null

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

    // SMELLY delay!
    _.delay(() => {
      this.setupControllers()
      this.addTrack()
    }, 1) 

  },

  tick(time, timeDelta) {
    this.handleDraw()
  },

  setupKeyboard() {
    document.addEventListener('keydown', e => {
      console.log('keydown: ', e)
      if (e.code == 'Enter') {this.togglePlay()} 
      if (e.code == 'Space') {this.fileLoadPrev()} 
      else if (e.key == 'ArrowLeft' && e.altKey && e.shiftKey) {this.fileLoadPrevOld()}
      else if (e.key == 'ArrowRight' && e.altKey && e.shiftKey) {this.fileLoadNextOld()}
      else if (e.key == 'ArrowUp' && e.altKey && e.shiftKey) {this.fileLoadPrevOldComp()}
    })
  },

  setupControllers() {
    const controllers =   document.querySelectorAll('a-entity[oculus-touch-controls]'),
          [leftHand, rightHand] = controllers,
          primaryHand = this.isRightHanded ? rightHand : leftHand,
          secondaryHand = this.isRightHanded ? leftHand : rightHand,
          pensphereEnt = document.querySelector("#pensphere")

    primaryHand.setObject3D('pensphereEnt', pensphereEnt.object3D)
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

  // FILE OPS

  buildComp(compData, fileInfo) {
    const {tracks} = this
    this.removeAllTracks()
    this.fileInfo = fileInfo
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
    const {tracks, fileInfo} = this
    const compData = tracks.map(track => track.components.anim.animData)
    save({compData}, fileInfo).then(fileInfo => {
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

  fileLoadPrevOldComp() {
    const {fileInfo} = this
    // loadPrev(fileInfo).then(({file, fileInfo}) => {
    //   console.log('loaded prev: ', file, fileInfo)
    //   this.buildComp(file.compData, fileInfo)
    // })

    const comps = [

      ['mulgy-limp-lumps', 'mulgy-tap-hops'],
      ['lorgussy-bung-hinges', 'marbled-crank-lumps'],
      ['mulgy-shift-hops', 'mulgy-prunt-clumps','fropley-limp-hunguses', 'brumpled-brine-glops'],
      ['clumbied-clam-shanks'], // norman
      ['clumbied-crank-hops', 'mulgy-bung-flops'],
      ['lorgussy-clam-hinges'],
      ['gildered-bung-glops', 'brumpled-crank-glops'],
      ['fropley-groft-lumps'],
      ['mulgy-shift-hops', 'mulgy-prunt-clumps'],
      ['fropley-limp-hunguses', 'brumpled-brine-glops'],
      ['clumbied-brine-hunguses', 'mulgy-dank-glops'],
      ['gildered-frump-hinges'],
      ['brumpled-dank-hunguses'],
      ['lorgussy-bung-clamps'],
      // ['fropley-clam-shanks', 'trulmy-dank-hops'],
      ['fropley-clam-shanks'],
      ['brumpled-shift-hinges'],
      ['gildered-shift-hunguses'],
      ['troubling-plex-hunguses'], // black pearl motion study
      ['trulmy-limp-donks'], // runnning man
      ['marbled-groft-clumps'], // craggly norman letters
      ['mulgy-ront-hops'], // abstract short loop
    ]

    const animLoads = _.map(comps[0], (name) => {
      return loadAnimByNameOld(name)
    })

    Promise.all(animLoads).then(values => {
      console.log('promise all complete: ', values)
      const compData = _.map(values, 'animData')
      console.log('compData: ', compData)
      this.buildComp(compData, fileInfo)
      console.log(fileInfo)
    })

    // loadPrevOld(this.fileInfoOld).then(({animData, currentFileInfo}) => {
    //   console.log('loaded prev old: ', animData, currentFileInfo)
    //   this.fileInfoOld = currentFileInfo
    //   this.buildComp([animData], fileInfo)
      
    // })
  },


  fileLoadPrevOld() {
    const {fileInfo} = this
    loadPrevOld(this.fileInfoOld).then(({animData, currentFileInfo}) => {
      console.log('loaded prev old: ', animData, currentFileInfo)
      this.fileInfoOld = currentFileInfo
      this.buildComp([animData], fileInfo)
      
    })
  },

  fileLoadNextOld() {
    const {fileInfo} = this
    loadNextOld(this.fileInfoOld).then(({animData, currentFileInfo}) => {
      console.log('loaded next old: ', animData, currentFileInfo)
      this.fileInfoOld = currentFileInfo
      this.buildComp([animData], fileInfo)
      
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



