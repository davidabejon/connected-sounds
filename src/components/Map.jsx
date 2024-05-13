import { Feature } from "ol";
import { useEffect, useState } from "react";
import { useGeographic } from 'ol/proj';
import { Map as OpenLayersMap } from 'ol';
import BingMaps from 'ol/source/BingMaps.js';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Point } from 'ol/geom';
import selectedRadioIcon from '../assets/map/radio-icon-selected.png';
import notSelectedRadioIcon from '../assets/map/radio-icon-notselected.png';
import Overlay from 'ol/Overlay';
import '../styles/Map.css';
import { IoLayers } from "react-icons/io5";
import { IoLayersOutline } from "react-icons/io5";
import faviconSelected from '../assets/favicon-selected.png';

function Map({ setPlaceID, setCountry }) {

  const [layers, setLayers] = useState([]);
  const [showLabels, setShowLabels] = useState(false);

  useEffect(() => {

    const url = "/api" + "/ara/content/places"
    fetch(url)
      .then((response) => response.json())
      .then((allData) => {
        let list = allData.data.list;

        // ES: Para trabajar con coordenadas longitud y latitud hay que llamar al método useGeographic antes de definir el mapa
        // EN: To work with longitude and latitude coordinates you have to call the useGeographic method before defining the map
        useGeographic();

        // ES:Punto central del mapa
        // EN: Central point of the map
        const getGeoURL = "/api/geo"
        fetch(getGeoURL)
          .then((response) => response.json())
          .then((geoData) => {
            let lat0 = geoData.latitude;
            let lon0 = geoData.longitude;

            // ES: Crear un overlay para anclar el popup al mapa
            // EN: create an overlay to anchor the popup to the map
            const container = document.getElementById('popup');
            const overlay = new Overlay({
              element: container,
              autoPan: {
                animation: {
                  duration: 250,
                },
              },
            });

            // ES: Zoom inicial del mapa
            // EN: Initial zoom of the map
            let initZoom = 6;

            let smallPoints = list.filter(point => point.size <= 2)
            let mediumPoints = list.filter(point => point.size > 2)

            /**
             * ES: Crear un array de objetos Feature para cada punto a mostrar en el mapa
             * EN: Create an array of Feature objects for each point to show on the map
             */
            let smallFeatures = [];
            smallPoints.forEach(pointData => {
              let pointObject = new Point([pointData.geo[0], pointData.geo[1]]);
              smallFeatures.push(
                new Feature({
                  geometry: pointObject,
                  country: pointData.country,
                  title: pointData.title,
                  id: pointData.id,
                  size: pointData.size
                })
              );
            })
            let mediumFeatures = [];
            mediumPoints.forEach(pointData => {
              let pointObject = new Point([pointData.geo[0], pointData.geo[1]]);
              mediumFeatures.push(
                new Feature({
                  geometry: pointObject,
                  country: pointData.country,
                  title: pointData.title,
                  id: pointData.id,
                  size: pointData.size
                })
              );
            })

            let Baselayers = [
              new TileLayer({
                source: new BingMaps({
                  key: 'An5Pw7hvyEBSitSs8ZakuMdzOEkbznBormT5vrv2KyT52YoEvklnYoTxzn2wrrdF',
                  imagerySet: 'AerialWithLabelsOnDemand',
                  placeholderTiles: false,
                }),
              }),
              new TileLayer({
                source: new BingMaps({
                  key: 'An5Pw7hvyEBSitSs8ZakuMdzOEkbznBormT5vrv2KyT52YoEvklnYoTxzn2wrrdF',
                  imagerySet: 'Aerial',
                  placeholderTiles: false,
                }),
              })
            ]
            setLayers(Baselayers)

            let vectorLayer = new VectorLayer({
              source: new VectorSource({
                features: smallFeatures.concat(mediumFeatures) // Combinar las características de ambas capas
              }),
              style: function (feature) {
                // Definir el estilo de las características basado en su tamaño
                let size = feature.get('size');
                let iconSrc = notSelectedRadioIcon;
                let width = 25;
                let height = 20;
                if (size > 2) {
                  width = 40;
                  height = 30;
                }
                return new Style({
                  image: new Icon({
                    anchorXUnits: 'pixels',
                    anchorYUnits: 'pixels',
                    width: width,
                    height: height,
                    src: iconSrc,
                    opacity: .6
                  })
                });
              }
            });

            /**
             * ES: Crear el mapa OpenLayers
             * EN: Create the OpenLayers map
             */
            const mapa = new OpenLayersMap({
              target: 'map',
              overlays: [overlay],
              layers: [
                ...Baselayers,
                vectorLayer
              ],
              view: new View({
                /**
                 * ES: Coordenadas del punto central del mapa y zoom inicial
                 * EN: Coordinates of the central point of the map and initial zoom
                 */
                center: [lon0, lat0],
                zoom: initZoom,
              })
            })


            let activeFeature = null; // store the active feature
            mapa.on('singleclick', function (evt) {
              const feature = mapa.forEachFeatureAtPixel(evt.pixel, function (feature) {
                return feature;
              });
              if (feature) {

                // change favicon to selected
                var link = document.querySelector("link[rel~='icon']");
                link.href = faviconSelected;

                // set ID of the selected place and its country
                setPlaceID(feature.get('id'));
                setCountry(feature.get('country'));

                if (activeFeature != null) {
                  activeFeature.setStyle(new Style({
                    image: new Icon({
                      opacity: .6,
                      anchorXUnits: 'pixels',
                      anchorYUnits: 'pixels',
                      width: 25,
                      height: 20,
                      src: notSelectedRadioIcon
                    })
                  }))
                }

                activeFeature = feature

                let width = 25;
                let height = 20;
                if (feature.get('size') > 2) {
                  width = 40;
                  height = 30;
                }

                feature.setStyle(new Style({
                  zIndex: 99,
                  image: new Icon({
                    opacity: 1,
                    anchorXUnits: 'pixels',
                    anchorYUnits: 'pixels',
                    width: width,
                    height: height,
                    src: selectedRadioIcon
                  })
                }))

              }
              else {
                overlay.setPosition(undefined);
              }
            });

            /**
             * ES: función que cambia el cursor de 'auto' a 'pointer' en css al pasar por encima de un marcador
             * EN: function that changes the cursor from 'auto' to 'pointer' in css when passing over a marker
             */
            mapa.on('pointermove', function (e) {
              /**
               * ES: si se está arrastrando el mapa, no hacer nada
               * EN: if the map is being dragged, do nothing
               */
              if (e.dragging) {
                return;
              }

              let pixel = mapa.getEventPixel(e.originalEvent);
              let hit = mapa.hasFeatureAtPixel(pixel);
              mapa.getTargetElement().style.cursor = hit ? 'pointer' : '';
            });

          })

      })

  }, [])

  const changeLayer = () => {
    if (showLabels) {
      layers[0].setOpacity(0);
      layers[1].setOpacity(1);
      setShowLabels(false);
    }
    else {
      layers[0].setOpacity(1);
      layers[1].setOpacity(0);
      setShowLabels(true);
    }
  }

  return (
    <div className="map">
      <div className="panel-body" style={{ width: '100%' }}>
        <div id="map" className="panel-body" style={{ width: '100%' }}></div>
      </div>
      <div className="map-layers">
        <button onClick={changeLayer}>{showLabels ? <IoLayers size={48} color="white" /> : <IoLayersOutline size={48} color="white" />}</button>
      </div>
    </div>
  );
}

export default Map;