import faviconSelected from './assets/favicon-selected.png';
import faviconNotSelected from './assets/favicon-notselected.png';

export const TITLE_MAX_LENGTH = 28;

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