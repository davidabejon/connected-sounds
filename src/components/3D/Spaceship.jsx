import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

const Spaceship = ({ startAnimation }) => {
  const meshRef = useRef(null);
  const [opacity, setOpacity] = useState(0);

  useFrame(({ camera }) => {
    if (meshRef.current) {
      meshRef.current.position.copy(camera.position);
      meshRef.current.quaternion.copy(camera.quaternion);
      meshRef.current.translateZ(-2);
    }

    if (!startAnimation && opacity < 1) {
      setOpacity(opacity + 0.01);
    }
  });

  return (
    <mesh ref={meshRef} renderOrder={1}>
      <boxGeometry args={[1, 1, 1]} /> {/* A simple square (cube) */}
      <meshBasicMaterial color="hotpink" opacity={opacity} transparent depthWrite={false} depthTest={false} />
    </mesh>
  );
};

export default Spaceship;