import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { useGLTF } from '@react-three/drei';

const Spaceship = ({ startAnimation }) => {
  const meshRef = useRef(null);
  const glassRef = useRef(null);
  const [opacity, setOpacity] = useState(0);
  const [glassOpacity, setGlassOpacity] = useState(0);
  const gltf = useGLTF('models/spaceship.glb');

  useFrame(({ camera }) => {
    if (meshRef.current) {
      meshRef.current.position.copy(camera.position);
      meshRef.current.quaternion.copy(camera.quaternion);
      meshRef.current.translateZ(-0.2);
      meshRef.current.translateY(-0.18);
      meshRef.current.rotateX(0.3);
    }

    if (glassRef.current) {
      glassRef.current.position.copy(camera.position);
      glassRef.current.quaternion.copy(camera.quaternion);
      glassRef.current.translateZ(-0.2);
      glassRef.current.translateY(-0.18);
      glassRef.current.rotateX(0.3);
    }

    // Ensure transparency + depth settings
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.material.transparent = true;
        child.material.depthWrite = false; // Prevents it from being overwritten in depth buffer
        child.material.depthTest = false;  // Ensures it's always visible
        child.material.opacity = opacity;
      }
    });

    if (!startAnimation) {
      if (opacity < 1) setOpacity(opacity + 0.01);
      if (glassOpacity < 0.1) setGlassOpacity(glassOpacity + 0.001);
    }
  });

  return (
    <group>
      <primitive
        scale={[0.1, 0.1, 0.1]}
        ref={meshRef}
        object={gltf.scene}
        renderOrder={1}
      />
      {/* transparent square in front of primitive */}
      <mesh ref={glassRef}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#c7fced" transparent opacity={glassOpacity} depthWrite={false} depthTest={false} />
      </mesh>
    </group>
  );
};

export default Spaceship;