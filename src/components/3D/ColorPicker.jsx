import { useFrame, useLoader } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

function lerpColor(startColor, endColor, t) {
  const startRGB = new THREE.Color(startColor);
  const endRGB = new THREE.Color(endColor);
  return new THREE.Color(
    startRGB.r + (endRGB.r - startRGB.r) * t,
    startRGB.g + (endRGB.g - startRGB.g) * t,
    startRGB.b + (endRGB.b - startRGB.b) * t
  ).getStyle();
}

function ColorPicker({ setPointColor, opacity }) {
  const texture = useLoader(THREE.TextureLoader, "textures/color_picker.png");

  const pickerRef = useRef();

  const handleClick = (event) => {
    const { uv } = event;
    if (!texture.image) return;

    const canvas = document.createElement("canvas");
    canvas.width = texture.image.width;
    canvas.height = texture.image.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(texture.image, 0, 0);

    const x = Math.floor(uv.x * canvas.width);
    const y = Math.floor((1 - uv.y) * canvas.height);
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = `#${pixel[0].toString(16).padStart(2, "0")}${pixel[1]
      .toString(16)
      .padStart(2, "0")}${pixel[2].toString(16).padStart(2, "0")}`;

    setPointColor(hex);

    document.getElementsByTagName('canvas')[0].style.cursor = 'pointer';
  };

  useFrame(({ camera }) => {
    if (pickerRef.current) {
      pickerRef.current.position.copy(camera.position);
      pickerRef.current.quaternion.copy(camera.quaternion);
      pickerRef.current.translateZ(-0.2);
      pickerRef.current.translateY(-0.1);
      pickerRef.current.translateX(0.215);
      pickerRef.current.rotateY(-0.2);
      pickerRef.current.rotateX(-0.2);      
    }
  })

  useEffect(() => {
    if (pickerRef.current) {
      pickerRef.current.material.transparent = true;
      pickerRef.current.material.depthWrite = false;
      pickerRef.current.material.depthTest = false;
      pickerRef.current.material.opacity = opacity;
    }
  })

  return (
    <>
      <mesh
        ref={pickerRef}
        onClick={handleClick}
        onPointerEnter={() => document.getElementsByTagName('canvas')[0].style.cursor = 'pointer'}
        onPointerLeave={() => document.getElementsByTagName('canvas')[0].style.cursor = 'grab'}
      >
        <boxGeometry args={[.1, .07, 0]} />
        <meshBasicMaterial map={texture} />
      </mesh>
    </>
  );
}

export default ColorPicker;