
// 3D Button Component
const Button3D = ({ size = [1, 0.2, 1], onClick, children, disabled = false, reference }) => {

  const handleClick = () => {
    if (!disabled) {
      onClick()
      //TODO Add button press animation

    }
  }

  return (
    <group>
      <mesh
        ref={reference}
        onClick={handleClick}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'auto'}
      >
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={disabled ? '#666666' : '#1e88e5'}
          emissive={disabled ? '#333333' : '#0d47a1'}
          emissiveIntensity={0.2}
        />
      </mesh>
    </group >
  )
}

export default Button3D;