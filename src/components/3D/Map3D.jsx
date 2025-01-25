import { OrbitControls, Stars, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';


// Función corregida para convertir coordenadas geográficas (lat, lon) a 3D con inversión en el eje y
const geoTo3D = (lat, lon, radius) => {
  const latRad = (lat * Math.PI) / 180;   // Convertir latitud a radianes
  const lonRad = (lon * Math.PI) / 180;   // Convertir longitud a radianes

  // Cálculo de las coordenadas cartesianas (x, y, z)
  const x = -radius * Math.cos(latRad) * Math.cos(lonRad);
  const y = radius * Math.sin(latRad);   // Invertir el eje Y
  const z = radius * Math.cos(latRad) * Math.sin(lonRad);

  return [x, y, z];
};

function Map3D({ setPlaceID, setCountry, showInfo }) {
  const [points, setPoints] = useState([]);
  const [pointScale, setPointScale] = useState(0.005); 

  useEffect(() => {
    const url = "/api" + "/ara/content/places";
    fetch(url)
      .then((response) => response.json())
      .then((allData) => {
        // Aquí puedes extraer latitudes y longitudes de los datos
        const locations = allData.data.list.map(item => ({
          lat: item.geo[1],
          lon: item.geo[0]
        }));
        setPoints(locations);
      });
  }, []);

  const [daymap, cloudMap, bump] = useTexture([
    'textures/8k_earth_daymap.jpg',
    'textures/8k_earth_clouds.jpg',
    'textures/elevation.jpg',
  ]);

  const controlsRef = useRef();

  useFrame(() => {
    if (controlsRef.current) {
      const distance = controlsRef.current.object.position.length();
      if (distance > 3.2) {
        setPointScale(0.01);
        controlsRef.current.rotateSpeed = 0.5;
      } else if (distance > 2.5) {
        setPointScale(0.01);
        controlsRef.current.rotateSpeed = 0.4;
      } else if (distance > 2.3) {
        setPointScale(0.005);
        controlsRef.current.rotateSpeed = 0.3;
      } else {
        setPointScale(0.003);
        controlsRef.current.rotateSpeed = 0.05;
      }
    }
  });

  const radius = 2; // Radio de la esfera de la Tierra
  const rotationAngle = Math.PI - 0.0023; // Ajusta este valor para rotar la textura

  // Crear los atributos de los puntos
  const positions = new Float32Array(points.length * 3);
  points.forEach((point, index) => {
    const [x, y, z] = geoTo3D(point.lat, point.lon, radius);
    positions[index * 3] = x;
    positions[index * 3 + 1] = y;
    positions[index * 3 + 2] = z;
  });

  return (
    <>
      {/* Tierra */}
      <mesh rotation={[0, rotationAngle, 0]}> {/* Rotación en el eje Y */}
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial map={daymap} bumpMap={bump} bumpScale={100} />
      </mesh>

      {/* Nubes */}
      <mesh scale={1.025}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial transparent opacity={0.2} map={cloudMap} />
      </mesh>

      {/* Puntos en la Tierra usando BufferGeometry y Points */}
      {points.length > 0 && (
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={positions}
              count={points.length}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial size={pointScale} color="red" />
        </points>
      )}

      {/* Estrellas */}
      <Stars
        radius={100}
        depth={200}
        count={5000}
        factor={6}
        saturation={0}
        color="green"
        fade
        speed={1}
      />

      {/* Luz */}
      <ambientLight intensity={4} />
      <pointLight intensity={60} position={[3, 3, 3]} />

      {/* Controles */}
      <OrbitControls
        ref={controlsRef}
        minDistance={2.2}
        maxDistance={6}
        enablePan={false}
      />

      {/* Fondo */}
      <color args={['black']} attach="background" />
    </>
  );
}

export default Map3D;
