import { useTexture } from "@react-three/drei";
import { Select } from "@react-three/postprocessing";
import { useEffect, useState, useMemo } from "react";
import * as THREE from "three";

const Button3D = ({ size = [1, 0.2, 1], onClick, disabled = false, reference, opacity, isSwitch = false, icons }) => {
  const [plainBlue] = useTexture([
    'textures/plain_blue.png'
  ]);

  const [pressed, setPressed] = useState(false);
  const [hovered, hover] = useState(null);

  const changeCursor = (type) => {
    if (!disabled)
      document.getElementsByTagName('canvas')[0].style.cursor = type;
  }

  const handleClick = () => {
    if (!disabled) {
      onClick();
      setPressed(!pressed);
      if (isSwitch) {
        if (pressed) {
          reference.current.scale.set(1, 1, 1);
          reference.current.translateY(0.02);
        } else {
          reference.current.scale.set(1, 0.5, 1);
          reference.current.translateY(-0.02);
        }
      } else {
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
      setPressed(false);
      reference.current.scale.set(1, 1, 1);
      reference.current.translateY(0.02);
    }
  }, [disabled]);

  const materials = useMemo(() => {
    const baseColor = disabled ? '#666666' : '#1e88e5';
    const emissive = disabled ? '#333333' : '#0d47a1';

    const flatMaterial = new THREE.MeshStandardMaterial({
      map: plainBlue,
      color: baseColor,
      emissive: emissive,
      emissiveIntensity: 0.2,
      transparent: true,
    });

    if (!icons) {
      return [
        flatMaterial,      // right
        flatMaterial,      // left
        flatMaterial,      // top
        flatMaterial,      // bottom
        flatMaterial,      // front
        flatMaterial       // back
      ];
    }

    const texturedMaterial = new THREE.MeshStandardMaterial({
      map: pressed ? icons.pressed : icons.default,
      color: baseColor,
      emissive: emissive,
      emissiveIntensity: 0.2,
      transparent: true,
    });

    return [
      flatMaterial,      // right
      flatMaterial,      // left
      texturedMaterial,  // top
      flatMaterial,      // bottom
      flatMaterial,      // front
      flatMaterial       // back
    ];
  }, [pressed, icons, disabled]);

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
        material={materials}
      >
        <boxGeometry args={size} />
      </mesh>
    </Select>
  );
}

export default Button3D;
