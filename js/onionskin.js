import _ from 'lodash'

export default (anim) => {

  const {el, ENTER_FRAME, ONION_REMOVED} = anim,
        group = new THREE.Group()

  el.object3D.add(group)

  el.addEventListener(ONION_REMOVED, () => {
    console.log('onionskin heard remove')
    anim.onionskin = null
    el.object3D.remove(group)
  })

  const makeSkin = ({
    type = 'relative', // 'fixed' || 'relative' ... may not need this if HomeFrameGhost is back in
    relativeToCurrentFrame = -1,
    color = 'blue',
    opacity = 0.5,
  }) => {

    const material = new THREE.LineBasicMaterial({
            color,
            transparent: opacity != 1 ? true : false,
            opacity,
          }),
          geometry = new THREE.BufferGeometry(),
          skin = new THREE.LineSegments(geometry, material)

    const updateSkin = () => {
      const frameToRender = anim.getRelativeFrame(relativeToCurrentFrame)
      anim.fillGeometry(geometry, anim.animData[frameToRender])
    }

    const removeSkin = () => {
      console.log('skin heard remove')
      removeListeners()
    }

    const addListeners = () => {
      el.addEventListener(ENTER_FRAME, updateSkin)
      el.addEventListener(ONION_REMOVED, removeSkin)
    }

    const removeListeners = () => {
      el.removeEventListener(ENTER_FRAME, updateSkin)
      el.removeEventListener(ONION_REMOVED, removeSkin)
    }

    addListeners()
    updateSkin()
    group.add(skin)
    return skin
  }

  const skins = [

    makeSkin({
      type: 'relative',
      relativeToCurrentFrame: -2,
      color: 'blue',
      opacity: 0.2,
    }),

    makeSkin({
      type: 'relative',
      relativeToCurrentFrame: -1,
      color: 'blue',
      opacity: 0.7,
    }),
  
    makeSkin({
      type: 'relative',
      relativeToCurrentFrame: 1,
      color: 'orange',
      opacity: 0.7,
    }),

    makeSkin({
      type: 'relative',
      relativeToCurrentFrame: 2,
      color: 'orange',
      opacity: 0.2,
    }),
  
  ]

  return group

}