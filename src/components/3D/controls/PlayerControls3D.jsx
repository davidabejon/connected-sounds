import { useEffect, useRef, useState } from "react"
import Button3D from "./Button3D"
import IconButton3D from "./Icon3D"
import VolumeSlider3D from "./VolumeSlider"
import { followCamera, renderOnTop } from "../../../utilities"
import { useFrame, useThree } from "@react-three/fiber"
import { Selection, EffectComposer, Outline, Select } from '@react-three/postprocessing'
import buttonPushSound from '../../../assets/sounds/button_push.wav';
import buttonPullSound from '../../../assets/sounds/button_pull.wav';
import { useTexture } from "@react-three/drei"
const buttonColors = ['orange', 'red', 'blue', 'green'];

const PlayerControls3D = ({
  play,
  playText,
  loading,
  slideLeft,
  slideRight,
  stations,
  volumeChange,
  volumeValue,
  mute,
  mutedText,
  info,
  isPlaying,
  setIsPlaying,
  startAnimation,
}) => {
  const playRef = useRef()
  const slideLeftRef = useRef()
  const slideRightRef = useRef()
  const volumeSliderRef = useRef()
  const muteRef = useRef()
  const externalLinkRef = useRef()
  const [disablePlay, setDisablePlay] = useState(true)
  const [opacity, setOpacity] = useState(0)

  const buttonRefs = useRef([]);
  const [pressed, setPressed] = useState([false, false, false, false]);

  const [pauseTexture, playTexture] = useTexture([
    'textures/pause.png',
    'textures/play.png',
  ]);

  const playButtonIcons = {
    pressed: pauseTexture,
    default: playTexture,
  }

  useEffect(() => {
    if (loading) {
      setDisablePlay(false)
    }
  }, [loading])

  useFrame(({ camera }) => {
    if (playRef.current) {
      followCamera(playRef.current, camera)
      playRef.current.translateZ(-0.3);
      playRef.current.translateY(-0.17);
      playRef.current.translateX(0.13);
      playRef.current.rotateX(.5);
      playRef.current.rotateY(0.6);
      playRef.current.rotateZ(0.3);
    }
    if (slideLeftRef.current) {
      followCamera(slideLeftRef.current, camera)
      slideLeftRef.current.translateZ(-0.3);
      slideLeftRef.current.translateY(-0.17);
      slideLeftRef.current.translateX(0.09);
      slideLeftRef.current.rotateX(.5);
      slideLeftRef.current.rotateY(0.6);
      slideLeftRef.current.rotateZ(0.3);
    }
    if (slideRightRef.current) {
      followCamera(slideRightRef.current, camera)
      slideRightRef.current.translateZ(-0.3);
      slideRightRef.current.translateY(-0.17);
      slideRightRef.current.translateX(0.17);
      slideRightRef.current.rotateX(.5);
      slideRightRef.current.rotateY(0.6);
      slideRightRef.current.rotateZ(0.3);
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

    if (!startAnimation) {
      if (opacity < 1) setOpacity(opacity + 0.01);
    }
  })

  useEffect(() => {
    if (playRef.current) renderOnTop(playRef.current, opacity)
    if (slideLeftRef.current) renderOnTop(slideLeftRef.current, opacity)
    if (slideRightRef.current) renderOnTop(slideRightRef.current, opacity)
    if (volumeSliderRef.current) renderOnTop(volumeSliderRef.current, opacity)
    if (muteRef.current) renderOnTop(muteRef.current, opacity)
    if (externalLinkRef.current) renderOnTop(externalLinkRef.current, opacity)

    buttonRefs.current.forEach((buttonRef, index) => {
      if (buttonRef) renderOnTop(buttonRef, opacity);
    });
  }, [playRef, slideLeftRef, slideRightRef, volumeSliderRef, muteRef, externalLinkRef, buttonRefs, opacity])

  const playRadio = () => {
    if (isPlaying) {
      setIsPlaying(false)
    }
    play();
  }

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

  return (
    <group> {/* Adjust position as needed */}
      {/* Main control buttons */}
      <Selection>
        <EffectComposer multisampling={8} autoClear={false}>
          <Outline blur visibleEdgeColor="white" edgeStrength={5000} width={3000} />
        </EffectComposer>
        <Button3D
          size={[0.015, 0.015, 0.015]}
          onClick={slideLeft}
          reference={slideLeftRef}
          disabled={Object.keys(info).length === 0 || stations.length === 1}
          opacity={opacity}
        >
        </Button3D>
        <Button3D
          size={[0.015, 0.015, 0.015]}
          onClick={playRadio}
          reference={playRef}
          disabled={Object.keys(info).length === 0 || loading}
          opacity={opacity}
          isSwitch
          icons={playButtonIcons}
        >
        </Button3D>
        <Button3D
          size={[0.015, 0.015, 0.015]}
          onClick={slideRight}
          reference={slideRightRef}
          disabled={Object.keys(info).length === 0 || stations.length === 1}
          opacity={opacity}
        >
        </Button3D>
        {/* Cylinder Buttons */}
        {
          buttonColors.map((color, index) => (
            <Button key={index} color={color} onClick={() => handleButtonClick(index)} refInstance={(el) => (buttonRefs.current[index] = el)} />
          ))
        }
      </Selection>

      {/* Volume controls */}
      {/* <group position={[0, -0.5, 0]}>
        <VolumeSlider3D
          value={volumeValue}
          onChange={volumeChange}
          position={[-1.5, 0, 0]}
        />

        <IconButton3D
          position={[1.8, 0, 0]}
          onClick={mute}
          icon={mutedText === "Mute" && volumeValue != 0 ?
            (volumeValue < 0.3 ? "🔈" : volumeValue < 0.6 ? "🔉" : "🔊") : "🔇"}
        />
      </group> */}

      {/* External link button */}
      {/* <IconButton3D
        position={[2.5, -0.5, 0]}
        onClick={() => window.open(`https://${info.stream}`, '_blank')}
        icon="↗"
        ref={externalLinkRef}
      /> */}

    </group>
  )
}

export default PlayerControls3D;

function Button({ color, onClick, refInstance }) {
  const [hovered, hover] = useState(null)

  const changeCursor = (type) => {
    document.getElementsByTagName('canvas')[0].style.cursor = type;
  }

  return (
    <Select enabled={hovered}>
      <mesh
        onClick={onClick}
        onPointerEnter={() => changeCursor('pointer')}
        onPointerLeave={() => changeCursor('grab')}
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
