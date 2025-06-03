import React from 'react';
import { useEffect, useRef, useState } from "react";
import '../../styles/Player.css';
import { calculateVolume, deselectFavicon, followCamera, getCountryCode, renderOnTop, selectFavicon, shortenText, TITLE_MAX_LENGTH } from "../../utilities";
import { Html, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import p2sFont from '../../assets/fonts/PressStart2P-Regular.ttf';
import FakeGlowMaterial from './FakeGlowMaterial';
import PlayerControls3D from './controls/PlayerControls3D';

function Player3D({ info, stations, country, slideRight, slideLeft, handleLoading, errorMessage, color, setIsPlaying, isPlaying, startAnimation, setIsVisibleStars }) {

  const audioRef = useRef(new Audio());
  const [muted, setMuted] = useState(false)
  const [mutedText, setMutedText] = useState('Mute')
  const [volumeValue, setVolumeValue] = useState(0.4)
  const [previousVolume, setPreviousVolume] = useState(0.2)
  const [playText, setPlayText] = useState('Stop')
  const [countryFlagURL, setCountryFlagURL] = useState('')

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
    setIsPlaying(false)
    audio.play()
      .then(() => {
        selectFavicon()
        setLoading(false)
        setIsPlaying(true)
        const countryCode = getCountryCode(country)
        setCountryFlagURL(`https://flagsapi.com/${countryCode}/flat/64.png`)
      })
      .catch((e) => {
        // permitimos los errores de tipo AbortError porque se causan al cambiar de estación rápidamente
        // antes de que la estación actual haya terminado de cargar
        if (e.name != 'AbortError') {
          errorMessage("Failed to load the radio station")
          setLoading(false)
          setFailedToLoad(true)
          setIsPlaying(false)
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

  return (
    <>
      <ScrollingText
        text={info?.title}
        country={info?.country}
        place={info?.place}
        speed={0.0015}
        width={3}
        loading={loading}
        failedToLoad={failedToLoad}
        color={color}
        isPlaying={isPlaying}
      />
      <PlayerControls3D
        play={play}
        playText={playText}
        loading={loading}
        slideLeft={slideLeft}
        slideRight={slideRight}
        stations={stations}
        volumeChange={volumeChange}
        volumeValue={volumeValue}
        mute={mute}
        mutedText={mutedText}
        info={info}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        startAnimation={startAnimation}
        setIsVisibleStars={setIsVisibleStars}
      />
    </>
    // <div className='player'>

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


const ScrollingText = ({ text, country, place, speed = 0.02, width = 3, color = '#ff5f1f', loading, failedToLoad = false, isPlaying }) => {
  const textRefs = useRef([...Array(3)].map(() => React.createRef()));
  const subtitleRefs = useRef([...Array(3)].map(() => React.createRef()));
  const cloneRefs = useRef([...Array(3)].map(() => React.createRef()));
  const offset = useRef(0);
  const [opacity, setOpacity] = useState(0);

  const refs = textRefs.current.map((textRef, index) => ({
    textRef,
    subtitleRef: subtitleRefs.current[index],
    cloneRef: cloneRefs.current[index],
    offset: index === 0 ? 0 : index === 1 ? 3 : -3
  }));

  useFrame(({ camera }) => {

    refs.forEach(ref => {
      if (ref.textRef.current) {
        followCamera(ref.textRef.current, camera);
        renderOnTop(ref.textRef.current, 1);
        ref.textRef.current.translateY(0.71);
        ref.textRef.current.translateZ(-1);

        offset.current = (offset.current + (isPlaying ? speed : speed / 2)) % (2 * width);
        ref.textRef.current.translateX(-width + (offset.current % (2 * width)) + ref.offset);
      }

      if (ref.subtitleRef.current) {
        followCamera(ref.subtitleRef.current, camera);
        renderOnTop(ref.subtitleRef.current, 1);
        ref.subtitleRef.current.translateY(0.66);
        ref.subtitleRef.current.translateZ(-1);

        ref.subtitleRef.current.translateX(-width + (offset.current % (2 * width)) + ref.offset);
      }

      if (ref.cloneRef.current) {
        followCamera(ref.cloneRef.current, camera);
        renderOnTop(ref.cloneRef.current, 1);
        ref.cloneRef.current.translateY(0.71);
        ref.cloneRef.current.translateZ(-1);

        ref.cloneRef.current.translateX(-width + (offset.current % (2 * width)) + ref.offset);
      }
    })

    if (text && country && place) {
      if (opacity < 1) {
        setOpacity(opacity + 0.05);
      }
    }
  });

  const statusText = failedToLoad ? 'Failed:' : loading ? 'Loading:' : isPlaying ? 'Now playing:' : 'Paused:'

  return (
    refs.map((ref, index) => (
      <React.Fragment key={index}>
        <Text ref={ref.textRef} fontSize={0.06} color={failedToLoad ? 'red' : color} font={p2sFont} fillOpacity={opacity}>
          {`${statusText} ${text}`}
          <FakeGlowMaterial glowSharpness={100} falloff={.01} glowColor={failedToLoad ? 'red' : color} />
        </Text>
        <Text ref={ref.cloneRef} fontSize={0.06} color={failedToLoad ? 'red' : color} font={p2sFont} fillOpacity={opacity}>
          {`${statusText} ${text}`}
          <FakeGlowMaterial glowSharpness={100} falloff={.005} glowColor={failedToLoad ? 'red' : color} />
        </Text>
        <Text ref={ref.subtitleRef} fontSize={0.03} color={failedToLoad ? 'red' : color} font={p2sFont} fillOpacity={opacity}>
          {country && place ? `${country}, ${place}` : null}
          <FakeGlowMaterial glowSharpness={100} falloff={.01} glowColor={failedToLoad ? 'red' : color} />
        </Text>
      </React.Fragment>
    ))
  );
};