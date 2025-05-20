import { Html, useProgress } from "@react-three/drei";
import { Spin } from "antd";
import '../../styles/Loading.css'

// Componente para mostrar el mensaje de carga
const Loading = ({ radiosFetched }) => {
  const { progress } = useProgress();
  return (
    <Html center className="loading-wrapper">
      <div className="loading-container"
      // style={{ background: `linear-gradient(90deg,rgb(106, 255, 148) ${progress}%, #f0f2f5 ${progress}%)` }}
      >
        <div className="loading-text">
          {
            progress != 100 ?
              <>
                <p>Loading models</p>
              </>
              : !radiosFetched ?
                <p>Loading radios</p>
                : <p>Done!</p>
          }
        </div>
        <Spin size="large" className="spin" />
      </div>
    </Html >
  );
};

export default Loading;