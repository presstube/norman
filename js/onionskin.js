import _ from 'lodash'

export default (anim) => {

  const {el, ENTER_FRAME} = anim


  const makeSkin = ({
    type = 'relative', // fixed relative
    relativeToCurrentFrame = -1,
    style = 'dashed',
    color = 'blue',
    opacity = 0.5,
  }) => {
    // console.log('onion: ', type, relativeToCurrentFrame, style, color, opacity)
    const MaterialConstructor = (style === 'solid') ? THREE.LineBasicMaterial : THREE.LineDashedMaterial,
          material = new MaterialConstructor({
            color,
            transparent: opacity != 1 ? true : false,
            opacity,
            dashSize: 3,
            gapSize: 1
          })

    const onEnterFrame = (e) => {
      console.log('frame to render: ', anim.getRelativeFrame(relativeToCurrentFrame))
    }

    el.addEventListener(ENTER_FRAME, onEnterFrame)
  }

  makeSkin({
    type: 'relative',
    relativeToCurrentFrame: -2,
    color: 'blue',
    opacity: 0.8,
  })

}