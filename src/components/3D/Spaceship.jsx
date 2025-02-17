import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import buttonPushSound from '../../assets/sounds/button_push.wav';
import buttonPullSound from '../../assets/sounds/button_pull.wav';

const buttonColors = ['orange', 'red', 'blue', 'green'];
const dashboardSizes = [
  { type: 'circle', size: [0.5, 64] },
  { type: 'circle', size: [0.5, 64] },
  { type: 'rectangle', size: [1, 0.5] },
];

const Spaceship = ({ startAnimation }) => {
  const dashboardRefs = useRef([]);
  const buttonRefs = useRef([]);
  const glassRef = useRef(null);
  const pointLightRef = useRef(null);
  const [pressed, setPressed] = useState([false, false, false, false]);
  const [opacity, setOpacity] = useState(0);
  const [glassOpacity, setGlassOpacity] = useState(0);

  const handleButtonClick = (buttonIndex) => {

    const isPressed = pressed[buttonIndex];
    const newPressedState = [...pressed];
    newPressedState[buttonIndex] = !isPressed;
    setPressed(newPressedState);

    // sound when button is clicked
    const audio = new Audio(isPressed ? buttonPullSound : buttonPushSound);
    audio.volume = 0.2;
    audio.play();

    // // Simulate the "press" by returning to normal after a short delay
    // setTimeout(() => {
    //   const resetPressedState = [...newPressedState];
    //   resetPressedState[buttonIndex] = false;
    //   setPressed(resetPressedState);
    // }, 200); // 200ms to simulate button press time
  };

  // Keep the mesh, glass, and buttons in front of the camera
  useFrame(({ camera }) => {
    dashboardRefs.current.forEach((dashboardRef, index) => {
      if (dashboardRef) {
        dashboardRef.material.depthWrite = false;
        dashboardRef.material.depthTest = false;
        dashboardRef.material.opacity = opacity;
        dashboardRef.material.transparent = true;
        dashboardRef.position.copy(camera.position);
        dashboardRef.quaternion.copy(camera.quaternion);
        dashboardRef.translateZ(-0.31);  // Adjust position relative to the camera
        dashboardRef.translateY(-0.45);

        if (index % 3 === 0) {
          dashboardRef.translateX(-0.55)
          // rotate slightly
          // dashboardRef.rotateZ(-3)
        }
        else if (index % 3 === 1) {
          dashboardRef.translateX(0.55)
        }
        else if (index % 3 === 2) {
          dashboardRef.translateY(0.05)
        }

        if (index > 2) {
          dashboardRef.translateZ(-0.01)
          dashboardRef.translateY(0.015)
        }
      }
    });

    if (glassRef.current) {
      glassRef.current.position.copy(camera.position);
      glassRef.current.quaternion.copy(camera.quaternion);
      glassRef.current.translateZ(-0.2);
      glassRef.current.translateY(-0.18);
      glassRef.current.rotateX(0.3);
    }

    if (pointLightRef.current) {
      pointLightRef.current.position.copy(camera.position);
      pointLightRef.current.quaternion.copy(camera.quaternion);
      pointLightRef.current.translateZ(0.3);
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
        {
          buttonColors.map((color, index) => (
            <mesh ref={(el) => (buttonRefs.current[index] = el)} onClick={() => handleButtonClick(index)}>
              <cylinderGeometry args={[0.03, 0.03, 0.05, 32]} />
              <meshStandardMaterial color={color} />
            </mesh>
          ))
        }
      </group>

      {/* Dashboard */}
      {
        dashboardSizes.map((data, index) => (
          <>
            <mesh ref={(el) => (dashboardRefs.current[index] = el)} >
              {data.type === 'circle' ? <circleGeometry args={data.size} /> : <planeGeometry args={data.size} />}
              <meshBasicMaterial
                color="#aaa"
                depthWrite={false}
                depthTest={false}
              />
            </mesh>
            {/* shadow */}
            <mesh ref={(el) => (dashboardRefs.current[index + 3] = el)} >
              {data.type === 'circle' ? <circleGeometry args={data.size} /> : <planeGeometry args={data.size} />}
              <meshBasicMaterial
                color="#6b6b6b"
                depthWrite={false}
                depthTest={false}
              />
            </mesh>
          </>
        ))
      }

      {/* point light */}
      <pointLight ref={pointLightRef} intensity={.8} />

    </group>
  );
};

export default Spaceship;
