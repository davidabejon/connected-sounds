import { useEffect, useRef, useState } from "react"
import Button3D from "./Button3D"
import IconButton3D from "./Icon3D"
import VolumeSlider3D from "./VolumeSlider"
import { followCamera, renderOnTop } from "../../../utilities"
import { useFrame } from "@react-three/fiber"

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
  setIsPlaying
}) => {
  const playRef = useRef()
  const slideLeftRef = useRef()
  const slideRightRef = useRef()
  const volumeSliderRef = useRef()
  const muteRef = useRef()
  const externalLinkRef = useRef()
  const [disablePlay, setDisablePlay] = useState(true)
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
  })

  useEffect(() => {
    if (playRef.current) renderOnTop(playRef.current)
    if (slideLeftRef.current) renderOnTop(slideLeftRef.current)
    if (slideRightRef.current) renderOnTop(slideRightRef.current)
    if (volumeSliderRef.current) renderOnTop(volumeSliderRef.current)
    if (muteRef.current) renderOnTop(muteRef.current)
    if (externalLinkRef.current) renderOnTop(externalLinkRef.current)
  }, [playRef, slideLeftRef, slideRightRef, volumeSliderRef, muteRef, externalLinkRef])

  const playRadio = () => {
    if (isPlaying) {
      setIsPlaying(false)
    }
    play();
  }

  return (
    <group> {/* Adjust position as needed */}
      {/* Main control buttons */}
      <group>
        <Button3D
          size={[0.015, 0.015, 0.015]}
          onClick={slideLeft}
          reference={slideLeftRef}
          disabled={Object.keys(info).length === 0}
        >
        </Button3D>
        <Button3D
          size={[0.015, 0.015, 0.015]}
          onClick={playRadio}
          reference={playRef}
          disabled={Object.keys(info).length === 0}
        >
        </Button3D>
        <Button3D
          size={[0.015, 0.015, 0.015]}
          onClick={slideRight}
          reference={slideRightRef}
          disabled={Object.keys(info).length === 0}
        >
        </Button3D>
      </group>

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