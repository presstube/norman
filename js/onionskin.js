import _ from 'lodash'

export default (anim) => {

  console.log('onion skin here')

  const makeSkin = ({
    type = 'relative', // fixed relative
    relativeToCurrentFrame = -1,
    style = 'dashed',
    color = 'blue',
    opacity = 0.5,
  }) => {
    console.log('onion: ', type, relativeToCurrentFrame, style, color, opacity)

    let frameToRender

    const MaterialConstructor = (style === 'solid') ? THREE.LineBasicMaterial : THREE.LineDashedMaterial,
          material = new MaterialConstructor({
            color,
            transparent: opacity != 1 ? true : false,
            opacity,
            dashSize: 3,
            gapSize: 1
          })

    console.log('mat: ', material)



    // listen on anim for frame changes or data changes
    // if there's a frame changes refill the geom
    // if there's a data change, check to see if it's the frame
    // if it's the frame refill the geom

  }

  makeSkin({})

}