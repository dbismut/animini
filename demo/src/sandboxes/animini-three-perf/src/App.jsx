import React, { useState, useEffect, useLayoutEffect } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { useAnimini, spring } from '@animini/react-three'
import { useControls } from 'leva'
import { spring as levaSpring } from '@leva-ui/plugin-spring'

const colors = ['#A2CCB6', '#FCEEB5', '#EE786E', '#e0feff']

function Box({ position, scale, rotation, color }) {
  const [mesh, setMesh] = useAnimini()
  const [material, setMaterial] = useAnimini()
  const { springConfig } = useControls({ springConfig: levaSpring() })

  useLayoutEffect(() => {
    const config = { easing: spring(springConfig) }
    setMesh.start({ position, scale, rotation }, config)
    setMaterial.start({ color }, config)
  }, [color, position, scale, rotation, springConfig, setMesh, setMaterial])

  return (
    <mesh ref={mesh}>
      <boxGeometry />
      <meshStandardMaterial ref={material} roughness={0.75} metalness={0.5} />
    </mesh>
  )
}

function Content() {
  const [, set] = useState(0)
  const { number } = useControls({ number: { value: 50, step: 1, min: 10, max: 1000 } })
  const data = new Array(number).fill().map((_, i) => {
    const r = Math.random()
    return {
      position: { x: 250 - Math.random() * 500, y: 250 - Math.random() * 500, z: i * 3 },
      color: colors[Math.round(Math.random() * (colors.length - 1))],
      scale: { x: 1 + r * 200, y: 1 + r * 100, z: 10 },
      rotation: { x: 0, y: 0, z: THREE.MathUtils.degToRad(Math.round(Math.random()) * 45) }
    }
  })

  useEffect(() => void setInterval(() => set((i) => i + 1), 2000), [])
  return data.map((props, index) => <Box key={index} {...props} />)
}

function Lights() {
  return (
    <group>
      <ambientLight intensity={2} />
      <pointLight intensity={0.2} />
      <spotLight
        intensity={0.2}
        angle={0.3}
        position={[150, 150, 250]}
        penumbra={1}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
    </group>
  )
}

export default function App() {
  return (
    <Canvas linear camera={{ position: [0, 0, 200], fov: 120 }}>
      <Lights />
      <Content />
    </Canvas>
  )
}
