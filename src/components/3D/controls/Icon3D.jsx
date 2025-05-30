import { Text } from '@react-three/drei'

const IconButton3D = ({ position, icon, onClick, disabled = false, size = 0.5, ref }) => {

  const handleClick = () => {
    if (!disabled) {
      onClick()
      // Add button press animation
      ref.current.position.y = position[1] - 0.05
      setTimeout(() => {
        ref.current.position.y = position[1]
      }, 100)
    }
  }

  return (
    <group ref={ref}>
      <mesh
        onClick={handleClick}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'auto'}
      >
        <cylinderGeometry args={[size / 2, size / 2, 0.1, 32]} />
        <meshStandardMaterial
          color={disabled ? '#666666' : '#1e88e5'}
          emissive={disabled ? '#333333' : '#0d47a1'}
          emissiveIntensity={0.2}
        />
      </mesh>
      <Text
        position={[0, 0, 0.06]}
        fontSize={size * 0.6}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {icon}
      </Text>
    </group>
  )
}

export default IconButton3D;