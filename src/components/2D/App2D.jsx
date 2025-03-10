import Map from "./Map";
import Player from "./Player";
import { useEffect } from "react";
import { useNavigate } from "react-router";

function App2D({ setPlaceID, setCountry, setIsModalOpen, activeStation, activeStations, country, slideLeftActiveStation, slideRightActiveStation, mode }) {
  const navigate = useNavigate();
  useEffect(() => {
    console.log(mode)
    if (mode == '3D') navigate('/new')
  }, [mode])

  return (
    <>
      <Map setPlaceID={setPlaceID} setCountry={setCountry} showInfo={() => setIsModalOpen(true)} />
      <Player
        info={activeStation}
        stations={activeStations}
        country={country}
        slideLeft={slideLeftActiveStation}
        slideRight={slideRightActiveStation}
      />
    </>
  );
}

export default App2D;