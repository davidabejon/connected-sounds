import { Select } from "@react-three/postprocessing";
import { useEffect, useState } from "react";

// 3D Button Component
const Button3D = ({ size = [1, 0.2, 1], onClick, children, disabled = false, reference, opacity, isSwitch = false }) => {

  const [pressed, setPressed] = useState(false);
  const [hovered, hover] = useState(null)

  const changeCursor = (type) => {
    if (!disabled)
      document.getElementsByTagName('canvas')[0].style.cursor = type;
  }

  const handleClick = () => {
    if (!disabled) {
      onClick()
      setPressed(!pressed);
      if (isSwitch) {
        if (pressed) {
          reference.current.scale.set(1, 1, 1);
          reference.current.translateY(0.02);
        }
        else {
          reference.current.scale.set(1, 0.5, 1);
          reference.current.translateY(-0.02);
        }
      }
      else {
        reference.current.scale.set(1, 0.5, 1);
        reference.current.translateY(-0.02);
        setTimeout(() => {
          reference.current.scale.set(1, 1, 1);
          setPressed(!pressed);
        }, 200);
      }
    }
  }

  useEffect(() => {
    if (disabled) {
      // set the button to not pressed and reset scale
      setPressed(false);
      reference.current.scale.set(1, 1, 1);
      reference.current.translateY(0.02);
    }
  }, [disabled]);

  return (
    <Select enabled={hovered && !disabled}>
      <mesh
        ref={reference}
        onClick={handleClick}
        visible={opacity > 0}
        onPointerEnter={() => changeCursor('pointer')}
        onPointerLeave={() => changeCursor('grab')}
        onPointerOver={() => hover(true)}
        onPointerOut={() => hover(false)}
      >
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={disabled ? '#666666' : '#1e88e5'}
          emissive={disabled ? '#333333' : '#0d47a1'}
          emissiveIntensity={0.2}
          opacity={opacity}
        />
      </mesh>
    </Select>
  )
}

export default Button3D;