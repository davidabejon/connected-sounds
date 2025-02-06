import { OrbitControls, Stars, TrackballControls, useTexture } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { geoTo3D } from '../../utilities';

const radius = 2;
const earth_detail = 48;
const rotationAngleX = Math.PI - 0.0023;
const rotationAngleZ = -0.001;

function Map3D({ setPlaceID, setCountry, showInfo, setRadiosFetched, pointColor, isVisibleStars }) {

  const defaultColor = new THREE.Color(pointColor);
  const clickedColor = new THREE.Color(pointColor).multiplyScalar(8);

  window.onmousedown = () => document.getElementsByTagName('canvas')[0].style.cursor = 'grabbing';
  window.onmouseup = () => document.getElementsByTagName('canvas')[0].style.cursor = 'grab';

  const [startAnimation, setStartAnimation] = useState(true);

  const [points, setPoints] = useState([]);
  const [pointScale, setPointScale] = useState(0.005);

  const { camera, scene } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const targetPosition = useRef(null);

  const controlsRef = useRef();
  const trackbackRef = useRef();

  const [minZoom, setMinZoom] = useState(5);
  const [zoomSpeed, setZoomSpeed] = useState(0.8);
  const [materialOpacity, setMaterialOpacity] = useState(0);
  const [materialOpacityClouds, setMaterialOpacityClouds] = useState(0);
  const [ambientLightIntensity, setAmbientLightIntensity] = useState(1);

  useEffect(() => {
    fetch('/api' + '/geo')
      .then((response) => response.json())
      .then((response) => {

        const lat = response.latitude;
        const lon = response.longitude;
        const [x, y, z] = geoTo3D(lat, lon, radius);
        camera.position.set(x, y, z);
        setMaterialOpacity(1);
        setMaterialOpacityClouds(0.2);
        fetch('/api' + '/ara/content/places')
          .then((response) => response.json())
          .then((response) => {

            const locations = response.data.list.map((item) => ({
              lat: item.geo[1],
              lon: item.geo[0],
              country: item.country,
              place: item.title,
              url: item.url,
              id: item.id,
            }));
            setPoints(locations);
            setRadiosFetched(true);

          });
      });
  }, []);

  const [daymap, cloudMap, bump] = useTexture([
    'textures/8081_earthmap10k.jpg',
    'textures/8k_earth_clouds.jpg',
    'textures/elevation.jpg',
  ]);

  useFrame(() => {
    if (controlsRef.current) {
      const distance = controlsRef.current.object.position.length();
      controlsRef.current.rotateSpeed = distance > 3.2 ? 0.5 : distance > 2.6 ? 0.3 : distance > 2.4 ? 0.2 : 0.05;
      setZoomSpeed(distance > 2.4 ? 0.8 : 0.1);
      var scale = distance * 0.0015;
      if (distance > 3) {
        scale = scale + distance * 0.0005;
      }
      setPointScale(scale)
    }
  });

  // Crear los atributos de los puntos
  const positions = new Float32Array(points.length * 3);
  const colors = new Float32Array(points.length * 3); // Each color has 3 components (r, g, b)
  for (let i = 0; i < points.length; i++) {
    colors[i * 3] = defaultColor.r; // Red component
    colors[i * 3 + 1] = defaultColor.g; // Green component
    colors[i * 3 + 2] = defaultColor.b; // Blue component
  }
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

      raycaster.current.setFromCamera(mouse.current, camera);

      const intersects = raycaster.current.intersectObject(scene.getObjectByName('pointsCloud'), true);

      if (intersects.length > 0) {
        const validIntersections = intersects.filter((i) => i.distanceToRay < MAX_DISTANCE && i.distance < 3);

        if (validIntersections.length > 0) {
          // obtener intersection con menor distancia distanceToRay
          const closestIntersection = validIntersections.reduce((prev, current) =>
            prev.distanceToRay < current.distanceToRay ? prev : current
          );
          const { lat, lon, place, country, url, id } = metadata[closestIntersection.index];
          const [x, y, z] = geoTo3D(lat, lon, radius);
          setPlaceID(id);
          setCountry(country);

          // move the camera to the selected point
          targetPosition.current = new THREE.Vector3(x, y, z);

          // Change the color of the clicked point
          const index = closestIntersection.index;
          colors[index * 3] = clickedColor.r; // Red component
          colors[index * 3 + 1] = clickedColor.g; // Green component
          colors[index * 3 + 2] = clickedColor.b; // Blue component

          // Update the color attribute in the buffer geometry
          const pointsCloud = scene.getObjectByName('pointsCloud');
          pointsCloud.geometry.attributes.color.needsUpdate = true;
        }
      }
    }
  };

  useFrame(() => {
    if (startAnimation) {
      if (scene.rotation.y >= Math.PI * 2 && startAnimation) {
        setStartAnimation(false);
        setMinZoom(2.15);
      }
      else {
        if (ambientLightIntensity < 3) {
          setAmbientLightIntensity(ambientLightIntensity + 0.005);
        }
        scene.rotation.y += 0.004;
        scene.rotation.x = Math.sin(scene.rotation.y) * 0.1;
      }
    }
    else if (targetPosition.current) {
      const distanceToTarget = camera.position.distanceTo(targetPosition.current);
      const minSpeed = 0.05;
      const maxSpeed = 0.1;
      const dampingFactor = THREE.MathUtils.clamp(distanceToTarget * 0.5, minSpeed, maxSpeed);
      camera.position.lerp(targetPosition.current, dampingFactor);

      const projected = targetPosition.current.clone().project(camera);
      // camera.lookAt(targetPosition.current);

      const isCentered =
        Math.abs(projected.x) < 0.005 &&
        Math.abs(projected.y) < 0.005;

      if (isCentered) {
        targetPosition.current = null;
        camera.lookAt(0, 0, 0);
      }
    }
  })

  useEffect(() => {
    const pointsCloud = scene.getObjectByName('pointsCloud');
    if (pointsCloud != undefined) {
      pointsCloud.geometry.attributes.color.needsUpdate = true;
    }
  }, [pointColor]);

  return (
    <>
      <group onPointerDown={handleMouseDown} onPointerMove={handleMouseMove} onPointerUp={handleMouseUp}>
        {/* Tierra */}
        <mesh rotation={[0, rotationAngleX, rotationAngleZ]} name='earthMesh'>
          <sphereGeometry args={[radius, earth_detail, earth_detail]} />
          <meshStandardMaterial transparent map={daymap} bumpMap={bump} bumpScale={100} opacity={materialOpacity} />
        </mesh>

        {/* Nubes */}
        <mesh scale={1.01}>
          <sphereGeometry args={[radius, earth_detail, earth_detail]} />
          <meshStandardMaterial transparent opacity={materialOpacityClouds} map={cloudMap} />
        </mesh>

        {/* Puntos en la Tierra */}
        {points.length > 0 && (
          <points name="pointsCloud">
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                array={positions}
                count={points.length}
                itemSize={3}
              />
              <bufferAttribute
                attach="attributes-color"
                array={colors}
                count={points.length}
                itemSize={3}
              />
            </bufferGeometry>
            <pointsMaterial size={pointScale} vertexColors={true} />
          </points>
        )}

        {/* Efectos de brillo */}
        <EffectComposer>
          <Bloom
            intensity={0.5}
            luminanceThreshold={0.1}
            luminanceSmoothing={1}
          />
        </EffectComposer>
      </group>

      {/* Luz */}
      <ambientLight intensity={ambientLightIntensity} />
      <pointLight intensity={60} position={[0, 0, 6]} />
      <pointLight intensity={60} position={[0, 0, -6]} />

      {/* Controles */}
      <OrbitControls
        ref={controlsRef}
        minDistance={minZoom}
        maxDistance={6}
        enablePan={false}
        enableZoom={false}
        enableRotate={!startAnimation}
      />

      <TrackballControls ref={trackbackRef} noRotate noPan zoomSpeed={zoomSpeed} noZoom={startAnimation} />

      {/* Fondo */}
      <color args={['black']} attach="background" />

      {/* Estrellas */}
      {
        isVisibleStars &&
        <Stars
          radius={100}
          depth={200}
          count={5000}
          factor={6}
          saturation={0}
          fade
          speed={1}
        />
      }
    </>
  );
}

export default Map3D;