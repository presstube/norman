// import 'aframe'
import _ from 'lodash'
import $ from 'jquery'

import {save, deleteAnim, loadPrev, loadNext, loadAnimByName} from './firebasestore'

import './anim'
import './animlinesegments'
import './drawline'
import './onionskin'
import './homeframeghost'
import './frame'
import './line'
import './linemeshline'
import './animmeshline'

let counter = 0

const comps = [

  ['gildered-frump-hinges'],
  ['mulgy-shift-hops', 'mulgy-prunt-clumps','fropley-limp-hunguses', 'brumpled-brine-glops'],
  ['clumbied-clam-shanks'], // norman
  ['clumbied-crank-hops', 'mulgy-bung-flops'],
  ['lorgussy-clam-hinges'],
  ['gildered-bung-glops', 'brumpled-crank-glops'],
  ['fropley-groft-lumps'],
  ['mulgy-shift-hops', 'mulgy-prunt-clumps'],
  ['fropley-limp-hunguses', 'brumpled-brine-glops'],
  ['clumbied-brine-hunguses', 'mulgy-dank-glops'],
  ['brumpled-dank-hunguses'],
  ['lorgussy-bung-clamps'],
  ['fropley-clam-shanks', 'trulmy-dank-hops'],
  ['brumpled-shift-hinges'],
  ['gildered-shift-hunguses'],
  ['troubling-plex-hunguses'], // black pearl motion study
  ['trulmy-limp-donks'], // runnning man
  ['marbled-groft-clumps'], // craggly norman letters
  ['mulgy-ront-hops'], // abstract short loop
]

let compIndex = 0

AFRAME.registerComponent('norman', {

  init() {
    // console.log('WHATTT???')
    Object.assign(this, {
      currentFileInfo: null,
      animData: [[]],
      animsLoaded: [],
      anims: [],
      fileInfoToDelete: null,
      slideshowPlaying: null,
      lastDaydreamAxis: 0,
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
      remote: document.querySelector("#remote"),
    })

    const cam = document.querySelector('#camera')

    // cam.setAttribute('camera', {userHeight: 1.6})

    this.frameInterval = 1000 / this.fps
    this.setupKeyboard()
    this.setupDaydreamController()
    _.delay(this.setupControllers.bind(this), 1) // SMELLY

    const scene = document.querySelector('#scene')

    // this.setup()
    // this.fileLoadPrev()
    this.loadComp(comps[3])
    this.startPlaying()
    // this.startSlideshow()

  },

  tick(time, timeDelta) {
    const {_x, _y, _z} = this.remote.object3D.rotation
    const newRot = THREE.Math.radToDeg( _x ) + ' ' + 
                   THREE.Math.radToDeg( _y ) + ' ' + 
                   THREE.Math.radToDeg( _z )
    this.el.setAttribute('rotation', String(newRot))
    
    // counter++
    // if (counter % 100 == 0) {
    //   console.log('rot: ', newRot)
    // }

  },

  loadNextComp() {
    if (compIndex + 1 == comps.length) {
      compIndex = 0
    } else {
      compIndex +=1
    }
    this.loadComp(comps[compIndex])
  },

  loadComp(comp) {
    console.log('loading Comp: ', comp)
    this.animsLoaded = []
    this.teardown() 

    const animLoads = [loadAnimByName(comp[0])]

    // const animLoads = _.map(comp, (name) => {
    //   return loadAnimByName(name)
    // })

    Promise.all(animLoads).then(values => {
      console.log('comp: ', comp)
      console.log('promise all completet: ', values)
      _.each(values, (data, index) => {
        // console.log('DAATAAAA: ', data)
        // this.currentFileInfo = data.currentFileInfo
        this.animsLoaded.push({
          fileInfo: data.currentFileInfo,
          animData: data.animData
        })
        this.setup(data.animData)
      })
    })

    // _.each(comp, (name) => {
    //   loadAnimByName(name).then(data => {
    //     console.log('DAATAAAA: ', data)
    //     // this.currentFileInfo = data.currentFileInfo
    //     this.animsLoaded.push({
    //       fileInfo: data.currentFileInfo,
    //       animData: data.animData
    //     })
    //     this.setup(data.animData)
    //   })
    // })

  },


  setupDaydreamController() {
    const remote = document.querySelector("#remote")
    console.log('remote: ', remote.components)
    remote.addEventListener('buttondown', () => {
      this.loadNextComp()
    });
    // remote.addEventListener('axismove', (e) => {
    //   // if (this.lastDaydreamAxis === null) {
    //   //   this.lastDaydreamAxis = e.detail.axis[0]
    //   // }
    //   const diff = e.detail.axis[0] - this.lastDaydreamAxis
    //   const oldRot = this.el.getAttribute('rotation')
    //   const newY = oldRot.y + (diff*200)
    //   const rot = "0 " + newY + " 0"
    //   this.el.setAttribute('rotation', rot)
    //   this.lastDaydreamAxis = e.detail.axis[0]
    // });
  },

  setupKeyboard() {
    document.addEventListener('keydown', e => {
      // console.log('keydown: ', e)
      if (e.code == 'Enter') {this.togglePlay()} 
      // else if (e.key == 'S') {
      //   // console.log('saving: ')
      //   uploadAnimData(null, {data: this.animData})
      // }

      // else if (e.code == 'Space') {
      //   const cone = document.querySelector("#yellow-cone").object3D
      //   const {el} = this
      //   const norm = el.object3D
      //   cone.updateMatrixWorld()
      //   const worldToLocal = new THREE.Matrix4().getInverse(cone.matrixWorld)
      //   cone.add(norm)
      //   norm.applyMatrix(worldToLocal)
      //   // this.animData = animDataNewReg


      //   const animsToTransform = _.cloneDeep(this.animsLoaded)
      //   // animsToTransform.push({fileInfo: this.currentFileInfo, animData: this.animData})
      //   console.log('animsToTransform: ', animsToTransform)

      //   _.each(animsToTransform, (animToSave) => {
      //     const animDataNewReg = this.setReg(animToSave.animData, norm.matrix)
      //     animToSave.animData = animDataNewReg
      //     this.fileSave(true, animToSave)
      //   })


      //   // this.fileSave() // make this operate on input rather that reaching out itself
      // }
      
      else if (e.code.search('Digit') != -1) {
        const slot = e.code.split('Digit')[1]
        this.loadComp(comps[slot])
      }
      else if (e.code == 'KeyA' && e.altKey) {this.startSlideshow()}
      else if (e.code == 'Comma') {this.fileLoadPrev(!e.shiftKey)}
      else if (e.code == 'Period') {this.fileLoadNext(!e.shiftKey)}
      else if (e.code == 'BracketRight') {this.loadNextComp()}
      else if (e.key == 'ArrowDown' && e.altKey && e.shiftKey && !e.ctrlKey) {this.fileSave()}
      else if (e.key == 'ArrowDown' && e.altKey && e.shiftKey && e.ctrlKey) {this.fileSave(false)}
      else if (e.code == 'KeyX' && e.altKey) {this.fileDelete()}
      else if (e.key == 'o') {this.toggleOnion()}
      else if (e.key == ',') {this.changeFPS(-1)}
      else if (e.key == '.') {this.changeFPS(1)}
      else if (e.key == 't') {this.addLineData([{x:0, y:1, z:2},{x:0, y:1, z:2}], 2)}
    })   
  },

  setReg(animData, matrixToApply) {
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

  startSlideshow() {
    this.fileLoadPrev()
    this.startPlaying()
    this.slideshowPlaying = setInterval(this.fileLoadPrev.bind(this), 5000)
  },

  stopSlideshow() {
    this.stopPlaying()
    this.slideshowPlaying = clearInterval(this.slideshowPlaying)
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

    console.log('secondaryHand: ', secondaryHand)

    primaryHand.setObject3D('pensphereEnt', pensphereEnt.object3D)
    primaryHand.addEventListener('triggerdown', () => this.startDrawing())
    primaryHand.addEventListener('triggerup', () => this.stopDrawing())
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
    // console.log('setting up: ', animData)
    this.animData = animData
    this.addAnim()
    // _.times(1, () => this.addAnim())
    // this.addHomeFrameGhost()
    // this.setupOnionSkin()
  },

  teardown() {
    // this.stopPlaying()
    // this.removeHomeFrameGhost()
    // this.removeOnionSkin()
    // this.removeAnim()
    _.each(this.anims, (animEnt) => {
      this.removeAnim(animEnt)
    })
    this.anims = []

    this.animData = []
    this.currentFileInfo = null
  },

  fileNew() {
    // console.log('NEW')
    this.teardown()
    this.el.setAttribute('position', '0 1.6 -0.5') // TODO: don't hard code this, other place right now is in the index.html
    this.el.setAttribute('rotation', '0 0 0')
    this.setup()
  },

  // TODO: clean this up!
  fileSave(overwrite = true, animToSave) {
    console.log('SAVE: overwrite: ', overwrite, 'animToSave: ', animToSave)
    if (overwrite) {
      console.log('overwrite')
      if (animToSave) {
        save({data: animToSave.animData}, animToSave.fileInfo)
      } else {
        save({data: this.animData}, this.currentFileInfo)
      }
    } else {
      console.log('save duplicate')
      save({data: this.animData})
    }
  },

  fileDelete() {

    console.log('deleting')
    this.fileInfoToDelete = this.currentFileInfo
    this.fileLoadPrev()
    deleteAnim(this.fileInfoToDelete)
    // this.fileNew()
  },

  fileLoadPrev(doTeardown = true) {
    // addingFrame flag should be abstracted to 'leftTrigger' or something like that
    // finding a name that works for both keyboard and controller would be good
    // secondaryHandTriggerDown or something
    if (this.addingFrames) doTeardown = false  
    loadPrev(this.currentFileInfo).then(({animData, currentFileInfo}) => {
      console.log('LOADED PREV', currentFileInfo.filename )
      if (doTeardown) {
        this.teardown()
      } else {
        // stash that last animation
        this.removeOnionSkin()
        this.animsLoaded.push({
          fileInfo: this.currentFileInfo,
          animData: this.animData
        })
      }

      // console.log('animData: ', animData, fileInfo)

      this.currentFileInfo = currentFileInfo
      this.setup(animData)
    })
  },

  fileLoadNext(doTeardown = true) {
    if (this.addingFrames) doTeardown = false
    
    loadNext(this.currentFileInfo).then(({animData, currentFileInfo}) => {
      console.log('LOADED NEXT', currentFileInfo.filename)
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

  startDrawing() {
    if (!this.isDrawing) {
      this.isDrawing = true
      this.addDrawline()
    }
  },

  stopDrawing() {
    if (this.isDrawing) {
      this.isDrawing = false
      this.removeDrawline()
    }
  },

  togglePlay() {

    console.log('asdasdasd PLAY TOGGLE')

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

  addDrawline() {
    this.drawlineEnt = document.createElement('a-entity')
    const {drawlineEnt, el} = this
    drawlineEnt.setAttribute('drawline', {norman: '#norman'})
    el.appendChild(drawlineEnt)
  },

  removeDrawline() {
    this.el.removeChild(this.drawlineEnt)
  },

  addAnim() {
    this.animEnt = document.createElement('a-entity')
    const {animEnt, el, animData, getRandPosSpread} = this
    // console.log('adding anim:', animData)
    const initFrame = Math.floor(Math.random() * 20)
    animEnt.setAttribute('animlinesegments', {norman: '#norman', animData, initFrame})
    // animEnt.setAttribute('anim', {norman: '#norman', animData})
    
    // animEnt.setAttribute('id', 'anim')
    // let spreadMax = 0.3
    // const pos = `${getRandPosSpread(spreadMax)} ${getRandPosSpread(spreadMax)} ${getRandPosSpread(spreadMax)}`
    // spreadMax = 20
    // const rot = `${getRandPosSpread(spreadMax)} ${getRandPosSpread(spreadMax)} ${getRandPosSpread(spreadMax)}`
    
    // animEnt.setAttribute('position', pos)
    // animEnt.setAttribute('rotation', rot)
    this.animComp = animEnt.components.animlinesegments
    // this.animComp = animEnt.components.anim
    this.anims.push(animEnt)
    // console.3log('animEnt: ', animEnt)
    el.appendChild(animEnt)
  },

  getRandPosSpread(max) {
    return (Math.random() * max) - (Math.random() * max)
  },

  removeAnim(animEnt) {
    const {el} = this
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