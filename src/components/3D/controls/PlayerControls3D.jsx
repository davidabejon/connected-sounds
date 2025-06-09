import { useEffect, useRef, useState } from "react"
import Button3D from "./Button3D"
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
  setIsVisibleStars
}) => {
  const playRef = useRef()
  const slideLeftRef = useRef()
  const slideRightRef = useRef()
  const volumeUpRef = useRef()
  const volumeDownRef = useRef()
  const muteRef = useRef()
  const externalLinkRef = useRef()
  const [disablePlay, setDisablePlay] = useState(true)
  const [opacity, setOpacity] = useState(0)

  const buttonRefs = useRef([]);
  const [pressed, setPressed] = useState([false, false, false, false]);

  const [pauseTexture, playTexture, nextTexture, previousTexure, volumeUpTexture, volumeDownTexture, muteTexture] = useTexture([
    'textures/pause.png',
    'textures/play.png',
    'textures/next.png',
    'textures/previous.png',
    'textures/volumeup.png',
    'textures/volumedown.png',
    'textures/mute.png'
  ]);

  const playButtonIcons = {
    pressed: pauseTexture,
    default: playTexture,
  }
  const slideIcons = {
    next: {
      pressed: nextTexture,
      default: nextTexture,
    },
    previous: {
      pressed: previousTexure,
      default: previousTexure,
    }
  }
  const volumeIcons = {
    up: {
      pressed: volumeUpTexture,
      default: volumeUpTexture,
    },
    down: {
      pressed: volumeDownTexture,
      default: volumeDownTexture,
    },
    mute: {
      pressed: muteTexture,
      default: muteTexture,
    }
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
    if (volumeUpRef.current) {
      followCamera(volumeUpRef.current, camera)
      volumeUpRef.current.translateZ(-0.3);
      volumeUpRef.current.translateY(-0.205);
      volumeUpRef.current.translateX(0.09);
      volumeUpRef.current.rotateX(.5);
      volumeUpRef.current.rotateY(0.6);
      volumeUpRef.current.rotateZ(0.3);
    }
    if (volumeDownRef.current) {
      followCamera(volumeDownRef.current, camera)
      volumeDownRef.current.translateZ(-0.3);
      volumeDownRef.current.translateY(-0.205);
      volumeDownRef.current.translateX(0.13);
      volumeDownRef.current.rotateX(.5);
      volumeDownRef.current.rotateY(0.6);
      volumeDownRef.current.rotateZ(0.3);
    }
    if (muteRef.current) {
      followCamera(muteRef.current, camera)
      muteRef.current.translateZ(-0.3);
      muteRef.current.translateY(-0.205);
      muteRef.current.translateX(0.17);
      muteRef.current.rotateX(.5);
      muteRef.current.rotateY(0.6);
      muteRef.current.rotateZ(0.3);
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
    if (volumeUpRef.current) renderOnTop(volumeUpRef.current, opacity)
    if (volumeDownRef.current) renderOnTop(volumeDownRef.current, opacity)
    if (muteRef.current) renderOnTop(muteRef.current, opacity)
    if (externalLinkRef.current) renderOnTop(externalLinkRef.current, opacity)

    buttonRefs.current.forEach((buttonRef) => {
      if (buttonRef) renderOnTop(buttonRef, opacity);
    });
  }, [playRef, slideLeftRef, slideRightRef, volumeUpRef, volumeDownRef, muteRef, externalLinkRef, buttonRefs, opacity])

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
  };

  const volumeUp = () => {
    if (volumeValue < 1) {
      const newVolume = Math.min(1, volumeValue + 0.1);
      volumeChange(Number(newVolume.toFixed(1)));
    }
  }
  const volumeDown = () => {
    if (volumeValue > 0) {
      const newVolume = Math.max(0, volumeValue - 0.1);
      volumeChange(Number(newVolume.toFixed(1)));
    }
  }

  useEffect(() => {
    console.log('Volume changed:', volumeValue);
  }, [volumeValue])

  return (
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
        icons={slideIcons.previous}
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
        icons={slideIcons.next}
      >
      </Button3D>
      {/* Cylinder Buttons */}
      {
        buttonColors.map((color, index) => (
          <Button key={index} color={color} onClick={() => handleButtonClick(index)} refInstance={(el) => (buttonRefs.current[index] = el)} />
        ))
      }

      {/* Volume controls */}
      {/* TODO */}
      <Button3D
        size={[0.015, 0.015, 0.015]}
        onClick={volumeUp}
        reference={volumeUpRef}
        opacity={opacity}
        icons={volumeIcons.up}
        disabled={Object.keys(info).length === 0 || volumeValue >= 1}
      >
      </Button3D>
      <Button3D
        size={[0.015, 0.015, 0.015]}
        onClick={volumeDown}
        reference={volumeDownRef}
        opacity={opacity}
        icons={volumeIcons.down}
        disabled={Object.keys(info).length === 0 || volumeValue <= 0}
      >
      </Button3D>
      <Button3D
        size={[0.015, 0.015, 0.015]}
        onClick={mute}
        reference={muteRef}
        opacity={opacity}
        icons={volumeIcons.mute}
        disabled={Object.keys(info).length === 0}
      >
      </Button3D>

    </Selection>
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
