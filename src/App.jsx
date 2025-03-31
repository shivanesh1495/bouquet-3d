import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment } from '@react-three/drei'
import { useState, useRef, Suspense } from 'react'
import * as THREE from 'three'

// Floral poetry lines
const FLOWER_POEMS = [
  "A flower's fragrance fills the air",
  "With petals soft and colors rare",
  "Nature's art in bloom so bright",
  "Dancing in the golden light",
  "Butterflies on whispers fly",
  "Among the blooms that reach the sky",
  "Each petal holds a story sweet",
  "Of sun and rain in soft repeat"
]

function Bouquet({ onClick }) {
  const { scene } = useGLTF('/models/bouquet.glb')
  const bouquetRef = useRef()

  // Scale and position the bouquet
  scene.scale.set(2, 2, 2)
  scene.position.set(0, -1, 0)
  scene.rotation.set(0, Math.PI / 4, 0)

  // Continuous rotation
  useFrame((state, delta) => {
    if (bouquetRef.current) {
      bouquetRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <group ref={bouquetRef}>
      <primitive object={scene} onClick={onClick} />
    </group>
  )
}

function Butterfly({ startPosition, endPosition, speed, onComplete }) {
  const { scene } = useGLTF('/models/butterflies.glb')
  const groupRef = useRef()
  const [position] = useState(() => new THREE.Vector3(...startPosition))
  const [active, setActive] = useState(true)
  const target = new THREE.Vector3(...endPosition)
  const direction = new THREE.Vector3()
  const [flapPhase] = useState(Math.random() * Math.PI * 2)

  // Scale the butterfly
  scene.scale.set(0.08, 0.08, 0.08)

  // Animation loop
  useFrame((state) => {
    if (!active || !groupRef.current) return

    const time = state.clock.getElapsedTime()
    
    // Calculate direction to target
    direction.subVectors(target, position).normalize()
    
    // Move butterfly
    position.add(direction.multiplyScalar(speed))
    groupRef.current.position.copy(position)
    
    // Fluttering wing animation
    const flapSpeed = 15
    const flapAmount = Math.sin(time * flapSpeed + flapPhase) * 0.5
    groupRef.current.rotation.set(
      flapAmount, // Wing flapping
      Math.atan2(direction.x, direction.z), // Face direction
      Math.cos(time * 5) * 0.1 // Body rotation
    )
    
    // Check if reached destination
    if (position.distanceTo(target) < 0.5) {
      setActive(false)
      onComplete()
    }
  })

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  )
}

function FloatingText({ lines }) {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      pointerEvents: 'none',
      zIndex: 1
    }}>
      {lines.map((line, index) => (
        <div key={index} style={{
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '1.8rem',
          fontFamily: '"Dancing Script", cursive, sans-serif',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
          margin: '0.5rem 0',
          opacity: 0.8,
          animation: `floatUp ${10 + index}s infinite ease-in-out`,
          textAlign: 'center'
        }}>
          {line}
        </div>
      ))}
    </div>
  )
}

function Scene() {
  const [butterflies, setButterflies] = useState([])

  const handleBouquetClick = () => {
    // Create 5-8 new butterflies with random paths
    const count = Math.floor(Math.random() * 4) + 5
    const newButterflies = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      startPosition: [
        (Math.random() - 0.5) * 2,
        Math.random() * 2,
        (Math.random() - 0.5) * 2
      ],
      endPosition: [
        (Math.random() - 0.5) * 10,
        Math.random() * 5,
        (Math.random() - 0.5) * 10
      ],
      speed: Math.random() * 0.02 + 0.01
    }))

    setButterflies(prev => [...prev, ...newButterflies])
  }

  const handleButterflyComplete = (id) => {
    setButterflies(prev => prev.filter(bf => bf.id !== id))
  }

  return (
    <>
      <Bouquet onClick={handleBouquetClick} />
      {butterflies.map(bf => (
        <Butterfly 
          key={bf.id}
          startPosition={bf.startPosition}
          endPosition={bf.endPosition}
          speed={bf.speed}
          onComplete={() => handleButterflyComplete(bf.id)}
        />
      ))}
      <Environment preset="sunset" />
      <ambientLight intensity={0.7} />
      <pointLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-5, 5, -5]} intensity={0.5} />
    </>
  )
}

export default function App() {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: 'linear-gradient(to bottom, #87CEEB, #E0F7FA)',
      overflow: 'hidden'
    }}>
      {/* Add global styles for the floating animation */}
      <style>
        {`
          @keyframes floatUp {
            0%, 100% { transform: translateY(0) rotate(-2deg); opacity: 0.7; }
            50% { transform: translateY(-20px) rotate(2deg); opacity: 1; }
          }
        `}
      </style>
      
      {/* Google Fonts import */}
      <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap" rel="stylesheet" />
      
      <FloatingText lines={FLOWER_POEMS} />
      
      <Canvas camera={{ position: [0, 1, 5], fov: 50 }}>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
        <OrbitControls 
          enableZoom={true}
          minDistance={3}
          maxDistance={10}
          enablePan={false}
        />
      </Canvas>
      
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        fontFamily: '"Dancing Script", cursive',
        fontSize: '1.8rem',
        textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
        pointerEvents: 'none',
        zIndex: 2
      }}>
        Click on the bouquet to release butterflies
      </div>
    </div>
  )
}