import '../../styles/GrabHelper.css';
import { PiHandGrabbingFill } from "react-icons/pi";
import { FaArrowsAltH } from "react-icons/fa";
import { useEffect, useState } from 'react';

const IDLE_TIMEOUT = 10000;

function GrabHelper({ startAnimation }) {

  const [hasUserInput, setHasUserInput] = useState(false)
  const [isIdle, setIsIdle] = useState(false)

  const resetTimer = () => {
    setIsIdle(false)
    setTimeout(() => {
      setIsIdle(true)
    }, IDLE_TIMEOUT);
  };

  useEffect(() => {
    window.addEventListener('mousedown', () => {
      setHasUserInput(true)
    })
    window.addEventListener('scroll', () => {
      setHasUserInput(true)
    })
  }, [])

  useEffect(() => {
    if (!startAnimation) {
      resetTimer()
    }
  }, [startAnimation])

  return (
    <>
      <div className={`grab-helper ${startAnimation ? 'hidden' : isIdle && !hasUserInput ? 'visible' : 'hidden'}`}>
        <FaArrowsAltH size={48} color='white' className='grab-icon1' />
        <PiHandGrabbingFill size={48} color='white' className='grab-icon2' />
        <p className='grab-text'>Grab the screen!</p>
      </div>
    </>
  );
}

export default GrabHelper;