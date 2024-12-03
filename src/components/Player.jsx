import React from 'react';
import { useEffect, useRef, useState, useMemo } from "react";
import '../styles/Player.css';
import { IoPlay } from "react-icons/io5";
import { IoStop } from "react-icons/io5";
import { IoPlayBack } from "react-icons/io5";
import { IoPlayForward } from "react-icons/io5";
import { IoVolumeOff } from "react-icons/io5";
import { IoVolumeLow } from "react-icons/io5";
import { IoVolumeMedium } from "react-icons/io5";
import { IoVolumeHigh } from "react-icons/io5";
import { TbExternalLink } from "react-icons/tb";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { deselectFavicon, selectFavicon } from "../utilities";
import { message } from 'antd';

function Player({ info, stations, country, slideRight, slideLeft }) {

  const [messageApi, contextHolder] = message.useMessage();
  const errorMessage = (text) => {
    messageApi.error(text || 'An unexpected error has occurred', 5);
  };

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
  }, [info])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volumeValue;
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

  return (
    <div className='player'>
      {contextHolder}

      <div className="d-flex gap-2" style={{ justifyContent: 'space-between' }}>
        <div className="player-info">
          <p className={`player-title ${failedToLoad ? 'error-title' : ''}`}>{info.title}</p>
          <p className="player-country">{info.country}, {info.place}</p>
        </div>
        <p className="fs-5">{stations.map(station => station.page.title).indexOf(info.title) + 1}/{stations.length}</p>
      </div>

      <div className="player-controls">
        <div className='player-buttons'>
          <button className={stations.length == 1 ? 'slide slide-left slide-disabled' : 'slide slide-left'} onClick={slideLeft}><IoPlayBack size={24} /></button>
          <button className="play" onClick={play}>{loading ? <AiOutlineLoading3Quarters size={32} className="loading-icon" /> : playText == "Play" ? <IoPlay size={32} /> : <IoStop size={32} />}</button>
          <button className={stations.length == 1 ? 'slide slide-right slide-disabled' : 'slide slide-right'} onClick={slideRight}><IoPlayForward size={24} /></button>
        </div>

        <div className="player-volume">
          <input onChange={volumeChange} value={volumeValue * 100} type="range" id="volume" name="volume" min="0" max="100" />
          <button onClick={mute}>{mutedText == "Mute" && volumeValue != 0 ? volumeValue < 0.3 ? <IoVolumeLow size={32} /> : volumeValue < 0.6 ? <IoVolumeMedium size={32} /> : <IoVolumeHigh size={32} /> : <IoVolumeOff size={32} />}</button>
        </div>
        <a href={"https://" + info.stream} target="_blank"><TbExternalLink size={32} /></a>
      </div>
    </div>
  );
}

export default Player;