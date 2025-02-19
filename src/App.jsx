import { Suspense, useEffect, useState } from 'react'
import './App.css'
import Welcome from './components/Welcome'
import Player from './components/2D/Player'
import Map from './components/2D/Map'
import { Canvas } from '@react-three/fiber'
import Map3D from './components/3D/Map3D'
import { message, Switch } from 'antd'
import { Loader } from '@react-three/drei'
import Loading from './components/3D/Loading'
import Player3D from './components/3D/Player3D'
import Settings from './components/3D/Settings'
import Spaceship from './components/3D/Spaceship'

function App() {

  const [messageApi, contextHolder] = message.useMessage();
  const errorMessage = (text) => {
    messageApi.error(text || 'An unexpected error has occurred', 5);
  };

  const [mode, setMode] = useState('3D')

  const [placeID, setPlaceID] = useState('')
  const [country, setCountry] = useState('')
  const [activeStations, setActiveStations] = useState([])
  const [activeStation, setActiveStation] = useState({})
  useEffect(() => console.log(activeStation), [activeStation])

  const [isModalOpen, setIsModalOpen] = useState(false)

  const [radiosFetched, setRadiosFetched] = useState(false)

  const [pointColor, setPointColor] = useState('#FFD700')
  const [isVisibleStars, setIsVisibleStars] = useState(false)
  const [startAnimation, setStartAnimation] = useState(true)

  const slideRightActiveStation = () => {
    let index = activeStations.findIndex(station => station.page.title === activeStation.title)
    if (index === activeStations.length - 1) {
      index = 0
    } else {
      index++
    }
    let info = {
      title: activeStations[index].page.title,
      stream: activeStations[index].page.stream,
      country: activeStations[index].page.country.title,
      place: activeStations[index].page.place.title,
      id: parseID(activeStations[index].page.url)
    }
    setActiveStation(info)
  }
  const slideLeftActiveStation = () => {
    let index = activeStations.findIndex(station => station.page.title === activeStation.title)
    if (index === 0) {
      index = activeStations.length - 1
    } else {
      index--
    }
    let info = {
      title: activeStations[index].page.title,
      stream: activeStations[index].page.stream,
      country: activeStations[index].page.country.title,
      place: activeStations[index].page.place.title,
      id: parseID(activeStations[index].page.url)
    }
    setActiveStation(info)
  }

  const parseID = (cadena) => {
    var ultimaBarraIndex = cadena.lastIndexOf("/");

    if (ultimaBarraIndex !== -1) {
      // Obtener el texto después de la última barra
      var textoDespuesSlash = cadena.substring(ultimaBarraIndex + 1);
      return textoDespuesSlash;
    } else {
      // Si no se encontró ninguna barra, devolver la cadena original
      return cadena;
    }
  }

  useEffect(() => {
    if (placeID.length > 0) {
      let url = "/api" + `/ara/content/page/${placeID}/channels`
      fetch(url)
        .then((response) => response.json())
        .then((response) => {
          let stations = []
          response.data.content.forEach((element) => {
            stations = stations.concat(element.items)
          })
          setActiveStations(stations)
          let info = {
            title: stations[0].page.title,
            stream: stations[0].page.stream,
            country: stations[0].page.country.title,
            place: stations[0].page.place.title,
            id: parseID(stations[0].page.url),
          }
          setActiveStation(info)
        })

      var root = document.querySelector(':root');
      root.style.setProperty('--visibility', 'visible');
      root.style.setProperty('--opacity', '1');
    }
  }, [placeID])

  const changeMode = (checked) => {
    document.querySelectorAll('audio').forEach(el => el.pause());
    if (checked) {
      setMode('3D')
    } else {
      setMode('2D')
    }
  }
  useEffect(() => {
    setActiveStation({})
    setActiveStations([])
    setPlaceID('')
    setCountry('')
    var root = document.querySelector(':root');
    root.style.setProperty('--visibility', 'hidden');
    root.style.setProperty('--opacity', '0');
  }, [mode])

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

  useEffect(() => {
    document.getElementById('crosshair').style.borderColor = pointColor
  }, [pointColor])

  return (
    <div className='app'>
      {contextHolder}
      <div className='mode'>
        <Switch onChange={changeMode} checkedChildren="3D" unCheckedChildren="2D" defaultChecked />
      </div>
      {/* <Welcome setIsModalOpen={setIsModalOpen} isModalOpen={isModalOpen} /> */}
      {
        mode === '3D' ?
          <>
            <div id='crosshair' className='showup crosshair'></div>
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
                />
              </Suspense>
            </Canvas>
            <Loader />
          </>
          :
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
      }
    </div>
  )
}

export default App
