import { Html, useProgress } from "@react-three/drei";
import { Spin } from "antd";
import '../../styles/Loading.css'

// Componente para mostrar el mensaje de carga
const Loading = () => {
  console.log('Loader')
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="loading-container">
        <div className="loading-text">
          <p>Loading</p>
          <p>{Math.round(progress)}%</p>
        </div>
        <Spin size="large" className="spin" />
      </div>
    </Html>
  );
};

export default Loading;