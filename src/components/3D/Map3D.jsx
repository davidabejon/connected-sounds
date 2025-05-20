import { OrbitControls, Stars, TrackballControls, useTexture } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Bloom, ColorAverage, DotScreen, EffectComposer, Glitch, Grid, Noise, Outline, Pixelation, Scanline, Vignette } from '@react-three/postprocessing';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { geoTo3D } from '../../utilities';

const radius = 2;
const earth_detail = 48;
const rotationAngleX = Math.PI - 0.0023;
const rotationAngleZ = -0.001;

function Map3D({ setPlaceID, setCountry, showInfo, setRadiosFetched, pointColor, isVisibleStars, startAnimation, setStartAnimation }) {

  const defaultColor = new THREE.Color(pointColor);
  const clickedColor = new THREE.Color(pointColor).multiplyScalar(8);

  window.onmousedown = () => document.getElementsByTagName('canvas')[0].style.cursor = 'grabbing';
  window.onmouseup = () => document.getElementsByTagName('canvas')[0].style.cursor = 'grab';

  const positionsRef = useRef(new Float32Array());
  const metadataRef = useRef([]);
  const [pointScale, setPointScale] = useState(0.005);
  const positions = positionsRef.current;
  const metadata = metadataRef.current;

  const colors = new Float32Array(positions.length * 3); // r, g, b
  for (let i = 0; i < positions.length; i++) {
    colors[i * 3] = defaultColor.r;
    colors[i * 3 + 1] = defaultColor.g;
    colors[i * 3 + 2] = defaultColor.b;
  }

  const { camera, scene } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const targetPosition = useRef(null);

  const controlsRef = useRef();
  const trackbackRef = useRef();

  const [minZoom, setMinZoom] = useState(4.2);
  const [zoomSpeed, setZoomSpeed] = useState(0.8);
  const [materialOpacity, setMaterialOpacity] = useState(0);
  const [materialOpacityClouds, setMaterialOpacityClouds] = useState(0);
  const [ambientLightIntensity, setAmbientLightIntensity] = useState(3);

  const [isNoise, setIsNoise] = useState(false);
  const [isGlitch, setIsGlitch] = useState(false);
  const [isPixelation, setIsPixelation] = useState(false);
  const [isColorAverage, setIsColorAverage] = useState(false);
  const [isDotScreen, setIsDotScreen] = useState(false);
  const [isScanline, setIsScanline] = useState(false);
  const [isGrid, setIsGrid] = useState(false);

  useEffect(() => {
    if (!startAnimation) setMinZoom(2.15);
  }, [startAnimation])

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
            setRadiosFetched(true);

            positionsRef.current = new Float32Array(locations.length * 3);
            locations.forEach((point, index) => {
              const [x, y, z] = geoTo3D(point.lat, point.lon, radius);
              positionsRef.current[index * 3] = x;
              positionsRef.current[index * 3 + 1] = y;
              positionsRef.current[index * 3 + 2] = z;

              metadataRef.current.push({
                index,
                ...point,
              });
            });

            colors = new Float32Array(locations.length * 3); // r, g, b
            for (let i = 0; i < locations.length; i++) {
              colors[i * 3] = defaultColor.r;
              colors[i * 3 + 1] = defaultColor.g;
              colors[i * 3 + 2] = defaultColor.b;
            }

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

  // handle mouse events
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

    if (!dragging && !startAnimation) {

      var MAX_DISTANCE; // max distance to detect a click on a point
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
      const intersectsSpaceship = raycaster.current.intersectObject(scene.getObjectByName('spaceship'), true);

      if (intersects.length > 0 && intersectsSpaceship.length <= 0) {
        const validIntersections = intersects.filter((i) => i.distanceToRay < MAX_DISTANCE && i.distance < 3);

        if (validIntersections.length > 0) {
          const closestIntersection = validIntersections.reduce((prev, current) =>
            prev.distanceToRay < current.distanceToRay ? prev : current
          );
          const { lat, lon, place, country, url, id } = metadata[closestIntersection.index];
          const [x, y, z] = geoTo3D(lat, lon, radius);
          setPlaceID(id);
          setCountry(country);

          targetPosition.current = new THREE.Vector3(x, y, z);

          const index = closestIntersection.index;
          colors[index * 3] = clickedColor.r;
          colors[index * 3 + 1] = clickedColor.g;
          colors[index * 3 + 2] = clickedColor.b;

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
      {/* Tierra */}
      <mesh rotation={[0, rotationAngleX, rotationAngleZ]} name='earthMesh' onPointerDown={handleMouseDown} onPointerMove={handleMouseMove} onPointerUp={handleMouseUp}>
        <sphereGeometry args={[radius, earth_detail, earth_detail]} />
        <meshStandardMaterial transparent map={daymap} bumpMap={bump} bumpScale={100} opacity={materialOpacity} />
      </mesh>

      {/* Nubes */}
      <mesh scale={1.01}>
        <sphereGeometry args={[radius, earth_detail, earth_detail]} />
        <meshStandardMaterial transparent opacity={materialOpacityClouds} map={cloudMap} />
      </mesh>

      {/* Puntos en la Tierra */}
      {positions.length > 0 && (
        <points name="pointsCloud">
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={positionsRef.current}
              count={positionsRef.current.length / 3}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              array={colors}
              count={colors.length / 3}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial size={pointScale} vertexColors />
        </points>
      )}

      {/* Efectos de brillo */}
      <EffectComposer>
        {isNoise && <Noise opacity={0.1} />}
        {isGlitch && <Glitch delay={[1, 1]} duration={[0.1, 0.5]} strength={[0.3, 0.6]} active ratio={0.85} />}
        {isPixelation && <Pixelation granularity={5} />}
        {isColorAverage && <ColorAverage />}
        {isDotScreen && <DotScreen angle={Math.PI * 0.5} scale={1.0} />}
        {isScanline && <Scanline density={2} />}
        {isGrid && <Grid scale={1.0} lineWidth={0.0} />}
      </EffectComposer>

      {/* Luz */}
      <ambientLight intensity={ambientLightIntensity} />

      {/* Controles */}
      <OrbitControls
        ref={controlsRef}
        minDistance={minZoom}
        maxDistance={4.2}
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