import { useEffect } from "react";
import '../../styles/AudioVisualizer.css';
function AudioVisualizer({ isPlaying, startAnimation }) {

  useEffect(() => {
    const bar = document.querySelectorAll(".bar");
    for (let i = 0; i < bar.length; i++) {
      bar.forEach((item, j) => {
        if (isPlaying) {
          item.style.animationDuration = `${Math.random() * (0.7 - 0.2) + 0.2}s`;
        }
        else {
          item.style.animationDuration = '0s';
        }
      });
    }
  }, [isPlaying])

  useEffect(() => {
    if (!startAnimation) {
      document.getElementById('sound-wave').style.opacity = 1;
    }
  }, [startAnimation])

  return (
    <div className="sound-wave" id="sound-wave">
      {
        Array.from({ length: 60 }).map((_, i) => (
          <div className="bar" key={i} />
        ))
      }
    </div>
  );
}

export default AudioVisualizer;