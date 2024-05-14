import faviconSelected from './assets/favicon-selected.png';
import faviconNotSelected from './assets/favicon-notselected.png';

export const selectFavicon = () => {
  var link = document.querySelector("link[rel~='icon']");
  link.href = faviconSelected;
}
export const deselectFavicon = () => {
  var link = document.querySelector("link[rel~='icon']");
  link.href = faviconNotSelected;
}