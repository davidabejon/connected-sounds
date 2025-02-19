import React from 'react';
import { useEffect, useRef, useState } from "react";
import '../../styles/Player.css';
import { calculateVolume, deselectFavicon, followCamera, renderOnTop, selectFavicon, shortenText, TITLE_MAX_LENGTH } from "../../utilities";
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import p2sFont from '../../assets/fonts/PressStart2P-Regular.ttf';

function Player3D({ info, stations, country, slideRight, slideLeft, handleLoading, errorMessage }) {

  const textRef = useRef()

  const audioRef = useRef(new Audio());
  const [muted, setMuted] = useState(false)
  const [mutedText, setMutedText] = useState('Mute')
  const [volumeValue, setVolumeValue] = useState(0.2)
  const [previousVolume, setPreviousVolume] = useState(0.2)
  const [playText, setPlayText] = useState('Stop')

  const [loading, setLoading] = useState(false)
  const [failedToLoad, setFailedToLoad] = useState(false)

  const baseUrl = "https://radio.garden/api"

  const playRadio = () => {
    setFailedToLoad(false)
    setPlayText('Stop')
    if (info.id == undefined) return
    const audio = audioRef.current
    audio.pause(); // Detener la reproducción actual si hay alguna
    const url = baseUrl + `/ara/content/listen/${info.id}/channel.mp3`
    audio.src = url
    audio.load()
    setLoading(true)
    audio.play()
      .then(() => {
        selectFavicon()
        setLoading(false)
      })
      .catch((e) => {
        // permitimos los errores de tipo AbortError porque se causan al cambiar de estación rápidamente
        // antes de que la estación actual haya terminado de cargar
        if (e.name != 'AbortError') {
          errorMessage("Failed to load the radio station")
          setLoading(false)
          setFailedToLoad(true)
        }
      })
  }

  useEffect(() => {
    playRadio();
    return () => {
      audioRef.current.pause();
      // audioRef.current = null;
    }
  }, [info])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = calculateVolume(volumeValue);
      if (volumeValue == 0) {
        setMuted(true)
        setMutedText('Unmute')
      } else {
        setMuted(false);
        setMutedText('Mute')
      }
    }
  }, [volumeValue])

  const play = () => {
    if (!loading) {
      if (audioRef.current != null) {
        if (audioRef.current.paused) {
          playRadio()
          setPlayText('Stop')
          selectFavicon()
        } else {
          audioRef.current.pause()
          setPlayText('Play')
          deselectFavicon()
        }
      } else {
        playRadio()
      }
    }
  }

  const volumeChange = (e) => {
    setVolumeValue(e.target.value / 100)
  }
  const mute = () => {
    if (muted) {
      setMutedText('Mute');
      setMuted(false)
      setVolumeValue(previousVolume);
    } else {
      setMutedText('Unmute');
      setPreviousVolume(volumeValue);
      setVolumeValue(0)
      setMuted(true)
    }
  }

  useEffect(() => {
    if (loading) {
      document.getElementById('crosshair').style.borderColor = 'white'
    }
    else if (failedToLoad) {
      deselectFavicon()
      document.getElementById('crosshair').style.borderColor = 'red'
    } else {
      document.getElementById('crosshair').style.borderColor = '#ffe78f'
    }
    handleLoading(loading, failedToLoad)
  }, [loading, failedToLoad])


  useFrame(({ camera }) => {
    if (textRef.current) {
      followCamera(textRef.current, camera)
      renderOnTop(textRef.current, 1)
      textRef.current.translateZ(-0.5)
      textRef.current.translateY(0.3)
    }
  })

  return (
    <>
      <ScrollingText
        text={info?.title}
        country={info?.country}
        place={info?.place}
        speed={0.003}
        width={3}
        failedToLoad={failedToLoad}
      />
    </>
    // <div className='player'>

    //   <div className="d-flex gap-2" style={{ justifyContent: 'space-between' }}>
    //     <div className="player-info">
    //       <Tooltip title={info?.title?.length > TITLE_MAX_LENGTH ? info.title : ''} color="black" placement="top">
    //         <p className={`player-title ${failedToLoad ? 'error-title' : ''}`}>{shortenText(info.title)}</p>
    //       </Tooltip>
    //       <p className="player-country">{info.country}, {info.place}</p>
    //     </div>
    //     <p className="fs-5">{stations.map(station => station.page.title).indexOf(info.title) + 1}/{stations.length}</p>
    //   </div>

    //   <div className="player-controls">
    //     <div className='player-buttons'>
    //       <button className={stations.length == 1 ? 'slide slide-left slide-disabled' : 'slide slide-left'} onClick={slideLeft}><IoPlayBack size={24} /></button>
    //       <button className="play" onClick={play}>{loading ? <AiOutlineLoading3Quarters size={32} className="loading-icon" /> : playText == "Play" ? <IoPlay size={32} /> : <IoStop size={32} />}</button>
    //       <button className={stations.length == 1 ? 'slide slide-right slide-disabled' : 'slide slide-right'} onClick={slideRight}><IoPlayForward size={24} /></button>
    //     </div>

    //     <div className="player-volume">
    //       <input onChange={volumeChange} value={volumeValue * 100} type="range" id="volume" name="volume" min="0" max="100" />
    //       <button onClick={mute}>{mutedText == "Mute" && volumeValue != 0 ? volumeValue < 0.3 ? <IoVolumeLow size={32} /> : volumeValue < 0.6 ? <IoVolumeMedium size={32} /> : <IoVolumeHigh size={32} /> : <IoVolumeOff size={32} />}</button>
    //     </div>
    //     <a href={"https://" + info.stream} target="_blank"><TbExternalLink size={32} /></a>
    //   </div>

    // </div >
  );
}

export default Player3D;


const ScrollingText = ({ text, country, place, speed = 0.02, width = 3, color = 'yellow', failedToLoad = false }) => {
  const textRef = useRef();
  const subtitleRef = useRef();
  const offset = useRef(0);
  const [opacity, setOpacity] = useState(0);

  useFrame(({ camera }) => {
    if (textRef.current) {
      followCamera(textRef.current, camera);
      renderOnTop(textRef.current, 1);
      textRef.current.translateY(0.72);
      textRef.current.translateZ(-1);

      offset.current = (offset.current + speed) % (2 * width);
      textRef.current.translateX(-width + (offset.current % (2 * width)));
    }

    if (subtitleRef.current) {
      followCamera(subtitleRef.current, camera);
      renderOnTop(subtitleRef.current, 1);
      subtitleRef.current.translateY(0.66);
      subtitleRef.current.translateZ(-1);

      subtitleRef.current.translateX(-width + (offset.current % (2 * width)));
    }

    if (text && country && place) {
      if (opacity < 1) {
        setOpacity(opacity + 0.05);
      }
    }
  });

  return (
    <>
      <Text ref={textRef} fontSize={0.06} color={failedToLoad ? 'red' : color} font={p2sFont} fillOpacity={opacity}>
        {
          failedToLoad ? text : `Now playing: ${text}`
        }
      </Text>
      <Text ref={subtitleRef} fontSize={0.03} color={failedToLoad ? 'red' : color} font={p2sFont} fillOpacity={opacity}>
        {country && place ? `${country}, ${place}` : null}
      </Text>
    </>
  );
};
