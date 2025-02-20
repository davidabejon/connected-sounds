import '../../styles/GrabHelper.css';
import { PiHandGrabbingFill } from "react-icons/pi";
import { FaArrowsAltH } from "react-icons/fa";
import { useEffect, useState } from 'react';

function GrabHelper({ startAnimation }) {

  const [hasUserInput, setHasUserInput] = useState(false)

  useEffect(() => {
    window.addEventListener('mousedown', () => {
      setHasUserInput(true)
    })
  }, [])
  
  return (
    <>
      <div className={`grab-helper ${startAnimation ? 'hidden' : hasUserInput ? 'hidden' : 'visible'}`}>
        <FaArrowsAltH size={48} color='white' className='grab-icon1' />
        <PiHandGrabbingFill size={48} color='white' className='grab-icon2' />
        <p className='grab-text'>Grab the screen!</p>
      </div>
    </>
  );
}

export default GrabHelper;