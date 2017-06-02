
export default (anim) => {

  const {el, ANIM_DATA_CHANGED} = anim,
        material = new THREE.LineBasicMaterial({
          color: 'green',
          transparent: true,
          opacity: 0.2,
        }),
        geometry = new THREE.BufferGeometry(),
        mesh = new THREE.LineSegments(geometry, material),
        updateMesh = () => {
          anim.fillGeometry(geometry, anim.animData[0])
        }

  el.addEventListener(ANIM_DATA_CHANGED, e => {
    if (e.detail.frameIndex === 0) updateMesh()
  })
  updateMesh()
  el.object3D.add(mesh)

}
