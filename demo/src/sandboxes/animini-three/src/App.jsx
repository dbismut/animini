import React from 'react'
import { useAnimini2 } from 'animini'
import { useControls, button } from 'leva'
import { Canvas } from 'react-three-fiber'
import { OrbitControls } from '@react-three/drei'

import * as THREE from 'three'

const torusknot = new THREE.TorusKnotBufferGeometry(3, 0.8, 256, 16)

const Mesh = () => {
  const [mat, apiMat] = useAnimini2()
  const [ref, api] = useAnimini2()
  useControls({
    changeColor: button(() => apiMat.start({ color: { r: 0, g: 1, b: 0 } })),
    changeScale: button(() => api.start({ scale: { x: 2, y: 1, z: 2 } })),
  })
  return (
    <mesh ref={ref} geometry={torusknot}>
      <meshPhysicalMaterial ref={mat} attach="material" flatShading />
    </mesh>
  )
}

export default function App() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 16], fov: 50 }}
      style={{ background: 'dimgray', height: '100vh', width: '100vw' }}>
      <OrbitControls />
      <directionalLight />
      <Mesh />
    </Canvas>
  )
}
