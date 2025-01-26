import { OrbitControls, Stars, TrackballControls, useTexture } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { geoTo3D } from '../../utilities';

function Map3D({ setPlaceID, setCountry, showInfo }) {

  window.onmousedown = () => document.getElementsByTagName('canvas')[0].style.cursor = 'grabbing';
  window.onmouseup = () => document.getElementsByTagName('canvas')[0].style.cursor = 'grab';

  const [points, setPoints] = useState([]);
  const [pointScale, setPointScale] = useState(0.005);

  const { camera, scene } = useThree(); // Para usar raycasting
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const targetPosition = useRef(new THREE.Vector3()); // Guardar la posición objetivo de la cámara

  useEffect(() => {
    const url = '/api' + '/ara/content/places';
    fetch(url)
      .then((response) => response.json())
      .then((allData) => {
        // Extraer datos de latitudes, longitudes y demás información
        const locations = allData.data.list.map((item) => ({
          lat: item.geo[1],
          lon: item.geo[0],
          country: item.country,
          place: item.title,
          url: item.url,
          id: item.id,
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
      } else if (distance > 2.6) {
        setPointScale(0.01);
        controlsRef.current.rotateSpeed = 0.3;
      } else if (distance > 2.4) {
        setPointScale(0.005);
        controlsRef.current.rotateSpeed = 0.2;
      } else {
        setPointScale(0.004);
        controlsRef.current.rotateSpeed = 0.05;
      }
    }
  });

  const radius = 2; // Radio de la esfera de la Tierra
  const rotationAngleX = Math.PI - 0.0023; // Ajusta este valor para rotar la textura
  const rotationAngleZ = -0.003; // Ajusta este valor para rotar la textura

  // Crear los atributos de los puntos
  const positions = new Float32Array(points.length * 3);
  const metadata = []; // Guardar la información asociada a cada punto

  points.forEach((point, index) => {
    const [x, y, z] = geoTo3D(point.lat, point.lon, radius);
    positions[index * 3] = x;
    positions[index * 3 + 1] = y;
    positions[index * 3 + 2] = z;

    metadata.push({
      index,
      ...point,
    });
  });

  // función que detecta si el click es un click individual o un drag
  const [dragging, setDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);

  const handleMouseDown = (event) => {
    event.stopPropagation();
    setDragging(false);
    setStartX(event.clientX);
    setStartY(event.clientY);
  };

  const handleMouseMove = (event) => {
    event.stopPropagation();
    if (Math.abs(event.clientX - startX) > 5 || Math.abs(event.clientY - startY) > 5) {
      setDragging(true);
    }
  };

  const handleMouseUp = (event) => {
    event.stopPropagation();
    if (!dragging) {
      handleClick(event);
    }
  };

  const handleClick = (event) => {
    event.stopPropagation();

    if (!dragging) {

      // Calcular el nivel de zoom
      var MAX_DISTANCE; // Ajustar proporcionalmente al zoom
      const distance = controlsRef.current.object.position.length();
      if (distance > 3.2) {
        MAX_DISTANCE = (0.04);
      } else if (distance > 2.6) {
        MAX_DISTANCE = (0.01);
      } else if (distance > 2.4) {
        MAX_DISTANCE = (0.005);
      } else {
        MAX_DISTANCE = (0.004);
      }

      const canvas = document.getElementsByTagName('canvas')[0];
      const { left, top, width, height } = canvas.getBoundingClientRect();

      mouse.current.x = ((event.clientX - left) / width) * 2 - 1;
      mouse.current.y = -((event.clientY - top) / height) * 2 + 1;

      // raycaster.current.near = 0.1;
      // raycaster.current.far = 1; 
      raycaster.current.setFromCamera(mouse.current, camera);

      const intersects = raycaster.current.intersectObject(scene.getObjectByName('pointsCloud'), true);

      if (intersects.length > 0) {

        const validIntersections = intersects.filter((i) => i.distanceToRay < MAX_DISTANCE && i.distance < 3);

        if (validIntersections.length > 0) {
          // obtener intersection con menor distancia distanceToRay
          const menorDistancia = validIntersections.reduce((prev, current) =>
            prev.distanceToRay < current.distanceToRay ? prev : current
          );
          const { lat, lon, place, country, url, id } = metadata[menorDistancia.index];
          const target = new THREE.Vector3(menorDistancia.point.x, menorDistancia.point.y, menorDistancia.point.z);
          targetPosition.current = target; // Establecer el destino
          setPlaceID(id);
          setCountry(country);
        }
      }

    }

  };


  return (
    <>
      <group onPointerDown={handleMouseDown} onPointerMove={handleMouseMove} onPointerUp={handleMouseUp}>
        {/* Tierra */}
        <mesh rotation={[0, rotationAngleX, rotationAngleZ]}>
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
          <points name="pointsCloud">
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                array={positions}
                count={points.length}
                itemSize={3}
              />
            </bufferGeometry>
            <pointsMaterial size={pointScale} color="gold" />
          </points>
        )}

        {/* Efectos de brillo */}
        <EffectComposer>
          <Bloom
            intensity={0.5} // Ajusta la intensidad del brillo
            luminanceThreshold={0.1} // Ajusta el umbral del brillo
            luminanceSmoothing={1}
          />
        </EffectComposer>
      </group>

      {/* Luz */}
      <ambientLight intensity={4} />
      <pointLight intensity={60} position={[3, 3, 3]} />

      {/* Controles */}
      <OrbitControls
        ref={controlsRef}
        minDistance={2.3}
        maxDistance={6}
        enablePan={false}
        enableZoom={false}
      />

      <TrackballControls noRotate noPan zoomSpeed={0.8} />

      {/* Fondo */}
      <color args={['black']} attach="background" />

      {/* Estrellas: Colocarlas al final */}
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
    </>
  );
}

export default Map3D;
