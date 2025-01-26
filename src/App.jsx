import { Suspense, useEffect, useState } from 'react'
import './App.css'
import Welcome from './components/Welcome'
import Player from './components/2D/Player'
import Map from './components/2D/Map'
import { Canvas } from '@react-three/fiber'
import Map3D from './components/3D/Map3D'
import { Switch } from 'antd'
import { Loader } from '@react-three/drei'
import Loading from './components/3D/Loading'

function App() {

  const [mode, setMode] = useState('3D')

  const [placeID, setPlaceID] = useState('')
  const [country, setCountry] = useState('')
  const [activeStations, setActiveStations] = useState([])
  const [activeStation, setActiveStation] = useState({})

  const [isModalOpen, setIsModalOpen] = useState(false)

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
    console.log('mode', mode)
  }, [mode])

  return (
    <div className='app'>
      <div className='mode'>
        <Switch onChange={changeMode} checkedChildren="3D" unCheckedChildren="2D" defaultChecked />
      </div>
      {/* <Welcome setIsModalOpen={setIsModalOpen} isModalOpen={isModalOpen} /> */}
      {
        mode === '3D' ?
          <>
            <div className='mirilla'></div>
            <Canvas>
              <Suspense fallback={<Loading />}>
                <Map3D setPlaceID={setPlaceID} setCountry={setCountry} showInfo={() => setIsModalOpen(true)} />
              </Suspense>
            </Canvas>
            <Loader />
            <Player
              info={activeStation}
              stations={activeStations}
              country={country}
              slideLeft={slideLeftActiveStation}
              slideRight={slideRightActiveStation}
            />
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
