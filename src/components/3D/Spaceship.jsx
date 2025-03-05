import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import buttonPushSound from '../../assets/sounds/button_push.wav';
import buttonPullSound from '../../assets/sounds/button_pull.wav';
import ColorPicker from './ColorPicker';
import { followCamera, renderOnTop } from '../../utilities';
import { Selection, Select, EffectComposer, Outline } from '@react-three/postprocessing'

const buttonColors = ['orange', 'red', 'blue', 'green'];
const dashboardSizes = [
  { type: 'circle', size: [0.5, 64] },
  { type: 'circle', size: [0.5, 64] },
  { type: 'rectangle', size: [1, 0.5] },
  { type: 'rectangle', size: [10, 0.2] },
];

const Spaceship = ({ startAnimation, setIsVisibleStars, setPointColor }) => {
  const dashboardRefs = useRef([]);
  const buttonRefs = useRef([]);
  const glassRef = useRef(null);
  const pointLightRef = useRef(null);
  const colorPickerRef = useRef(null);
  const [pressed, setPressed] = useState([false, false, false, false]);
  const [opacity, setOpacity] = useState(0);
  const [glassOpacity, setGlassOpacity] = useState(0);
  const [topOpacity, setTopOpacity] = useState(0);

  const handleButtonClick = (buttonIndex) => {

    const isPressed = pressed[buttonIndex];
    const newPressedState = [...pressed];
    newPressedState[buttonIndex] = !isPressed;
    setPressed(newPressedState);

    if (buttonIndex === 0) {
      setIsVisibleStars(!isPressed);
    }

    const audio = new Audio(isPressed ? buttonPullSound : buttonPushSound);
    audio.volume = 0.2;
    audio.play();

    document.getElementsByTagName('canvas')[0].style.cursor = 'pointer';

    // // Simulate the "press" by returning to normal after a short delay
    // setTimeout(() => {
    //   const resetPressedState = [...newPressedState];
    //   resetPressedState[buttonIndex] = false;
    //   setPressed(resetPressedState);
    // }, 200); // 200ms to simulate button press time
  };

  useFrame(({ camera }) => {
    dashboardRefs.current.forEach((dashboardRef, index) => {
      if (dashboardRef) {
        followCamera(dashboardRef, camera);
        dashboardRef.translateZ(-0.31);
        dashboardRef.translateY(-0.5);

        if (index % 4 === 0) { // left
          dashboardRef.translateX(-0.55)
        }
        else if (index % 4 === 1) { // right
          dashboardRef.translateX(0.55)
        }
        else if (index % 4 === 2) { // middle
          dashboardRef.translateY(0.05);
          dashboardRef.translateY(0.05)
        }
        else if (index % 4 === 3) { // top
          dashboardRef.translateY(0.05);
          dashboardRef.translateY(1.37)
          dashboardRef.translateZ(-1.01)
          dashboardRef.material.color.set('#000');
          dashboardRef.material.opacity = topOpacity;
        }

        if (index > 3) { // offset all shadows (left, right and middle)
          dashboardRef.translateZ(-0.01)
          dashboardRef.translateY(0.015)
        }
      }
    });

    if (glassRef.current) {
      followCamera(glassRef.current, camera);
      glassRef.current.translateZ(-0.2);
      glassRef.current.translateY(-0.18);
      glassRef.current.rotateX(0.3);
    }

    if (pointLightRef.current) {
      followCamera(pointLightRef.current, camera);
      pointLightRef.current.translateZ(0.3);
    }

    buttonRefs.current.forEach((buttonRef, index) => {
      if (buttonRef) {
        followCamera(buttonRef, camera);

        buttonRef.translateZ(-0.3);
        buttonRef.translateY(-0.17 - (index % 2 === 0 ? 0 : 0.04));
        buttonRef.translateX(-.17 + (index == 0 || index == 1 ? 0.04 : 0));
        buttonRef.rotateX(0.6);
        buttonRef.rotateZ(-0.5);

        buttonRef.scale.y = 1; // default scale, change if pressed
        if (pressed[index]) {
          buttonRef.scale.y = 0.5;
          buttonRef.translateY(-0.007);
        }

      }
    });

    if (colorPickerRef.current) {
      followCamera(colorPickerRef.current, camera);
      colorPickerRef.current.translateZ(-0.2);
      colorPickerRef.current.translateY(-0.1185);
      colorPickerRef.current.rotateX(-1);
    }

    if (!startAnimation) {
      if (opacity < 1) setOpacity(opacity + 0.01);
      if (glassOpacity < 0.02) setGlassOpacity(glassOpacity + 0.001);
      if (topOpacity < 0.5) setTopOpacity(topOpacity + 0.01);
    }
  });

  useEffect(() => {

    dashboardRefs.current.forEach((dashboardRef, index) => {
      if (dashboardRef) renderOnTop(dashboardRef, opacity);
    });

    buttonRefs.current.forEach((buttonRef, index) => {
      if (buttonRef) renderOnTop(buttonRef, opacity);
    });

    if (colorPickerRef.current) renderOnTop(colorPickerRef.current, opacity);

  }, [dashboardRefs, buttonRefs, colorPickerRef, opacity]);

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

      <group name='spaceship'>
        <Selection>
          <EffectComposer multisampling={8} autoClear={false}>
            <Outline blur visibleEdgeColor="white" edgeStrength={5000} width={3000} />
          </EffectComposer>
          <group name='buttons'>
            {/* Buttons */}
            {
              buttonColors.map((color, index) => (
                <Button key={index} color={color} onClick={() => handleButtonClick(index)} refInstance={(el) => (buttonRefs.current[index] = el)} />
              ))
            }
          </group>
        </Selection>

        {/* Dashboard */}
        {
          dashboardSizes.map((data, index) => (
            <React.Fragment key={index}>
              <mesh ref={(el) => (dashboardRefs.current[index] = el)} >
                {data.type === 'circle' ? <circleGeometry args={data.size} /> : <planeGeometry args={data.size} />}
                <meshBasicMaterial
                  color="#aaa"
                  depthWrite={false}
                  depthTest={false}
                />
              </mesh>
              {/* shadow */}
              <mesh ref={(el) => (dashboardRefs.current[index + 4] = el)} >
                {data.type === 'circle' ? <circleGeometry args={data.size} /> : <planeGeometry args={data.size} />}
                <meshBasicMaterial
                  color="#6b6b6b"
                  depthWrite={false}
                  depthTest={false}
                />
              </mesh>
            </React.Fragment>
          ))
        }

        <ColorPicker meshRef={colorPickerRef} setPointColor={setPointColor} opacity={opacity} />

      </group>

      {/* point light */}
      <pointLight ref={pointLightRef} intensity={3} color={'grey'} />

    </group>
  );
};

export default Spaceship;


function Button({ color, onClick, onPointerEnter, onPointerLeave, refInstance }) {
  const [hovered, hover] = useState(null)

  return (
    <Select enabled={hovered}>
      <mesh
        onClick={onClick}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onPointerOver={() => hover(true)}
        onPointerOut={() => hover(false)}
        ref={refInstance}
      >
        <cylinderGeometry args={[0.01, 0.01, 0.02, 32]} />
        <meshPhongMaterial color={color} />
      </mesh>
    </Select>
  );
}
