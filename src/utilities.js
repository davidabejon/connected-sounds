import lookup from "country-code-lookup";
import faviconSelected from './assets/favicon-selected.png';
import faviconNotSelected from './assets/favicon-notselected.png';

export const TITLE_MAX_LENGTH = 28;

export const oldPath = '/2D';
export const newPath = '/3D';

export const selectFavicon = () => {
  var link = document.querySelector("link[rel~='icon']");
  link.href = faviconSelected;
}
export const deselectFavicon = () => {
  var link = document.querySelector("link[rel~='icon']");
  link.href = faviconNotSelected;
}

// if a text is +27 characters long, it will be shortened to 24 characters and '...' will be added
export const shortenText = (text) => {
  if (text && text.length > TITLE_MAX_LENGTH) {
    return text.substring(0, TITLE_MAX_LENGTH - 3) + '...';
  } else {
    return text;
  }
}

// calculate volume with a logarithmic scale
export function calculateVolume(input, maxVolume = 1, gamma = 2) {
  let normalizedInput = Math.min(Math.max(input, 0), 1);
  let perceivedVolume = Math.pow(normalizedInput, gamma);
  return perceivedVolume * maxVolume;
}

// calculate latitude and longitude to 3D coordinates on a sphere
export const geoTo3D = (lat, lon, radius) => {
  const latRad = (lat * Math.PI) / 180;
  const lonRad = (lon * Math.PI) / 180;

  const x = -radius * Math.cos(latRad) * Math.cos(lonRad); // negating x to match the 3D model
  const y = radius * Math.sin(latRad);
  const z = radius * Math.cos(latRad) * Math.sin(lonRad);

  return [x, y, z];
};

export const followCamera = (object, camera) => {
  object.position.copy(camera.position);
  object.quaternion.copy(camera.quaternion);
}

export const renderOnTop = (object, opacity) => {
  object.material.transparent = true;
  object.material.depthWrite = false;
  object.material.depthTest = false;
  object.material.opacity = opacity;
}

export function getCountryCode(countryName) {
  const countryCode = lookup.byCountry(countryName)?.iso2;
  return countryCode;
}