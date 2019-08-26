import _ from 'lodash'


export default (target, color = 'red', length = 0.005) => {


  // console.log('WHAAA: ', target)

  const geometry = new THREE.Geometry(),
        material = new THREE.LineBasicMaterial({
          color,
          transparent: true,
          opacity: 0.5,
        })


// spew them random FOO

// change the zero to a var and just run a loop. You can do itttt!

//


  function makeVerts() {
    return _.flatten(_.times(30, () => {
      let position = {
        x: _.random(1.0, true),
        y: _.random(1.0, true),
        z: _.random(1.0, true)
      }
      return [
        {x: position.x, y: position.y, z: position.z},
        {x: length, y: position.y, z: position.z},
        {x: position.x, y: position.y, z: position.z},
        {x: -length, y: position.y, z: position.z},
        {x: position.x, y: position.y, z: position.z},
        {x: position.x, y: length, z: position.z},
        {x: position.x, y: position.y, z: position.z},
        {x: position.x, y: -length, z: position.z},
        {x: position.x, y: position.y, z: position.z},
        {x: position.x, y: position.y, z: length},
        {x: position.x, y: position.y, z: position.z},
        {x: position.x, y: position.y, z: -length},
      ]

    }))
  }


// console.log('sjsjsj: ', makeVerts())
  geometry.vertices = makeVerts()
      console.log('HELOAOOO: ', geometry.vertices)

  // geometry.vertices = [
  //   {x: 0, y: 0, z: 0},
  //   {x: length, y: 0, z: 0},
  //   {x: 0, y: 0, z: 0},
  //   {x: -length, y: 0, z: 0},
  //   {x: 0, y: 0, z: 0},
  //   {x: 0, y: length, z: 0},
  //   {x: 0, y: 0, z: 0},
  //   {x: 0, y: -length, z: 0},
  //   {x: 0, y: 0, z: 0},
  //   {x: 0, y: 0, z: length},
  //   {x: 0, y: 0, z: 0},
  //   {x: 0, y: 0, z: -length},
  // ]

  const mesh = new THREE.LineSegments(geometry, material)
  target.add(mesh)

  return mesh

}
