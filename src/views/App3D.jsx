import { Canvas } from "@react-three/fiber";
import AudioVisualizer from "../components/3D/AudioVisualizer";
import GrabHelper from "../components/3D/GrabHelper";
import { Suspense, useEffect, useState } from "react";
import Loading from "../components/3D/Loading";
import Map3D from "../components/3D/Map3D";
import Spaceship from "../components/3D/Spaceship";
import Player3D from "../components/3D/Player3D";
import { message } from "antd";
import { Loader } from "@react-three/drei";
import { useNavigate } from "react-router";

function App3D({ setPlaceID, setCountry, setIsModalOpen, activeStation, activeStations, country, slideLeftActiveStation, slideRightActiveStation, mode }) {
  const navigate = useNavigate();
  useEffect(() => {
    if (mode === '2D') navigate('/old')
  }, [mode])

  const [messageApi, contextHolder] = message.useMessage();
  const errorMessage = (text) => {
    messageApi.error(text || 'An unexpected error has occurred', 5);
  };

  const [radiosFetched, setRadiosFetched] = useState(false)

  const [pointColor, setPointColor] = useState('#FFD700')
  const [isVisibleStars, setIsVisibleStars] = useState(false)
  const [startAnimation, setStartAnimation] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    document.getElementById('crosshair').style.borderColor = pointColor
  }, [pointColor])

  const handleLoading = (isLoading, hasError) => {
    const crosshair = document.getElementById('crosshair')
    if (isLoading) {
      crosshair.classList.add('crosshair-loading')
      crosshair.classList.remove('showup')
    }
    else {
      crosshair.classList.remove('crosshair-loading')
      if (!hasError) document.getElementById('crosshair').style.borderColor = pointColor
    }
  }

  return (
    <>
      {contextHolder}
      <div id='crosshair' className='showup crosshair'></div>
      <AudioVisualizer isPlaying={isPlaying} startAnimation={startAnimation} color={pointColor} />
      <GrabHelper startAnimation={startAnimation} />
      <Canvas style={{ width: '100vw', height: '100vh' }}>
        <Suspense fallback={<Loading radiosFetched={radiosFetched} />}>
          <Map3D
            setPlaceID={setPlaceID}
            setCountry={setCountry}
            showInfo={() => setIsModalOpen(true)}
            setRadiosFetched={setRadiosFetched}
            pointColor={pointColor}
            isVisibleStars={isVisibleStars}
            startAnimation={startAnimation}
            setStartAnimation={setStartAnimation}
          />
          <Spaceship
            startAnimation={startAnimation}
            setIsVisibleStars={setIsVisibleStars}
            setPointColor={setPointColor}
          />
          <Player3D
            info={activeStation}
            stations={activeStations}
            country={country}
            slideLeft={slideLeftActiveStation}
            slideRight={slideRightActiveStation}
            handleLoading={handleLoading}
            errorMessage={errorMessage}
            color={pointColor}
            setIsPlaying={setIsPlaying}
          />
        </Suspense>
      </Canvas>
      <Loader />
    </>
  );
}

export default App3D;