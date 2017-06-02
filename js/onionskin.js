import _ from 'lodash'

export default (anim) => {

  const {el, ENTER_FRAME} = anim,
        group = new THREE.Group()

  el.object3D.add(group)

  const makeSkin = ({
    type = 'relative', // fixed relative
    relativeToCurrentFrame = -1,
    color = 'blue',
    opacity = 0.5,
  }) => {

    console.log('onion: ', type, relativeToCurrentFrame, color, opacity)
    
    const material = new THREE.LineBasicMaterial({
            color,
            transparent: opacity != 1 ? true : false,
            opacity,
            dashSize: 3,
            gapSize: 1
          }),
          geometry = new THREE.BufferGeometry(),
          skin = new THREE.LineSegments(geometry, material)

    const updateSkin = () => {
      const frameToRender = anim.getRelativeFrame(relativeToCurrentFrame)
      anim.fillGeometry(geometry, anim.animData[frameToRender])
    }

    updateSkin()
    el.addEventListener(ENTER_FRAME, updateSkin)
    // don't put these right on the anim
    // skins should have it's own container
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

}