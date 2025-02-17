import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';

const Spaceship = ({ startAnimation }) => {
  const meshRef = useRef(null);
  const glassRef = useRef(null);
  const buttonRefs = useRef([]);
  const [pressed, setPressed] = useState([false, false, false, false]);
  const [opacity, setOpacity] = useState(0);
  const [glassOpacity, setGlassOpacity] = useState(0);

  // Handle interaction with the buttons
  const handleButtonClick = (buttonIndex) => {
    console.log(`Button clicked: ${buttonIndex}`);
    // Mark the button as pressed
    const newPressedState = [...pressed];
    newPressedState[buttonIndex] = true;
    setPressed(newPressedState);

    // Simulate the "press" by returning to normal after a short delay
    setTimeout(() => {
      const resetPressedState = [...newPressedState];
      resetPressedState[buttonIndex] = false;
      setPressed(resetPressedState);
    }, 200); // 200ms to simulate button press time
  };

  // Keep the mesh, glass, and buttons in front of the camera
  useFrame(({ camera }) => {
    if (meshRef.current) {
      meshRef.current.position.copy(camera.position);
      meshRef.current.quaternion.copy(camera.quaternion);
      meshRef.current.translateZ(-0.2);  // Adjust position relative to the camera
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

    buttonRefs.current.forEach((buttonRef, index) => {
      if (buttonRef) {
        buttonRef.material.transparent = true;
        buttonRef.material.depthWrite = false;
        buttonRef.material.depthTest = false; 
        buttonRef.material.opacity = opacity;

        buttonRef.position.copy(camera.position);
        buttonRef.quaternion.copy(camera.quaternion);

        buttonRef.translateZ(-0.3);
        buttonRef.translateY(index % 2 === 0 ? -0.1 : -0.15);
        buttonRef.translateX(index === 0 ? -0.35 : index === 1 ? -0.25 : index === 3 ? 0.25 : 0.35);
        buttonRef.rotateX(1);
        buttonRef.rotateZ(index === 0 || index === 1 ? -1 : 1);

        buttonRef.scale.y = 1; // default scale, change if pressed
        if (pressed[index]) {
          buttonRef.scale.y = 0.5;
          buttonRef.translateY(-0.02);
        }

      }
    });

    if (!startAnimation) {
      if (opacity < 1) setOpacity(opacity + 0.01);
      if (glassOpacity < 0.1) setGlassOpacity(glassOpacity + 0.001);
    }
  });

  return (
    <group>
      {/* Glass (Crystal) */}
      <mesh ref={glassRef}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          color="#c7fced"
          transparent
          opacity={glassOpacity}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>

      {/* Buttons */}
      <group>
        <mesh ref={(el) => (buttonRefs.current[0] = el)} onClick={() => handleButtonClick(0)}>
          <cylinderGeometry args={[0.03, 0.03, 0.05, 32]} />
          <meshStandardMaterial color="orange" />
        </mesh>
        <mesh ref={(el) => (buttonRefs.current[1] = el)} onClick={() => handleButtonClick(1)}>
          <cylinderGeometry args={[0.03, 0.03, 0.05, 32]} />
          <meshStandardMaterial color="red" />
        </mesh>
        <mesh ref={(el) => (buttonRefs.current[2] = el)} onClick={() => handleButtonClick(2)}>
          <cylinderGeometry args={[0.03, 0.03, 0.05, 32]} />
          <meshStandardMaterial color="blue" />
        </mesh>
        <mesh ref={(el) => (buttonRefs.current[3] = el)} onClick={() => handleButtonClick(3)}>
          <cylinderGeometry args={[0.03, 0.03, 0.05, 32]} />
          <meshStandardMaterial color="green" />
        </mesh>
      </group>
    </group>
  );
};

export default Spaceship;
