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
import selectedRadioIcon from '../../assets/map/radio-icon-selected.png';
import notSelectedRadioIcon from '../../assets/map/radio-icon-notselected.png';
import '../../styles/Map.css';
import { IoLayers } from "react-icons/io5";
import { IoLayersOutline } from "react-icons/io5";
import faviconSelected from '../../assets/favicon-selected.png';
import { InfoCircleOutlined } from "@ant-design/icons";
import XYZ from 'ol/source/XYZ';
import { Flex, Popover, Select, Switch } from "antd";
import { selectFavicon } from "../../utilities";

function Map({ setPlaceID, setCountry, showInfo }) {

  const [layers, setLayers] = useState([]);
  const [showLabels, setShowLabels] = useState(false);
  const [disableShowLabels, setDisableShowLabels] = useState(false);

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

            // 0 = AerialWithLabelsOnDemand, 1 = Aerial
            let Baselayers = [
              new TileLayer({
                source: new BingMaps({
                  key: import.meta.env.VITE_BING_MAPS_API_KEY,
                  imagerySet: 'AerialWithLabelsOnDemand',
                  placeholderTiles: false,
                }),
              }),
              new TileLayer({
                source: new BingMaps({
                  key: import.meta.env.VITE_BING_MAPS_API_KEY,
                  imagerySet: 'Aerial',
                  placeholderTiles: false,
                }),
              }),
              new TileLayer({
                source: new BingMaps({
                  key: import.meta.env.VITE_BING_MAPS_API_KEY,
                  imagerySet: 'RoadOnDemand',
                  placeholderTiles: false,
                }),
              }),
              /**
               * ES: Capa de Azure Maps sin usar hasta que Bing Maps deje de funcionar (junio 2025)
               * EN: Azure Maps Layer unused until Bing Maps stops working (June 2025)
               * https://learn.microsoft.com/es-es/rest/api/maps/render/get-map-tileset?view=rest-maps-2024-04-01&tabs=HTTP#tilesetid
              */
              // new TileLayer({
              //   source: new XYZ({
              //     url: `https://atlas.microsoft.com/map/tile?api-version=2.0&tilesetId=microsoft.imagery.hybrid&zoom={z}&x={x}&y={y}&subscription-key=${import.meta.env.VITE_AZURE_MAPS_API_KEY}`,
              //   }),
              // }),
              // new TileLayer({
              //   source: new XYZ({
              //     url: `https://atlas.microsoft.com/map/tile?api-version=2.0&tilesetId=microsoft.imagery&zoom={z}&x={x}&y={y}&subscription-key=${import.meta.env.VITE_AZURE_MAPS_API_KEY}`,
              //   }),
              // }),
            ]

            /**
             * ES: Ocultar la capa de carreteras por defecto
             * EN: Hide the road layer by default
             */
            Baselayers[2].setOpacity(0);

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
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'fraction',
                    anchor: [0.5, 0.5],
                    width: width,
                    height: height,
                    src: iconSrc,
                    opacity: .6
                  })
                });
              }
            });

            setLayers([...Baselayers, vectorLayer])

            /**
             * ES: Crear el mapa OpenLayers
             * EN: Create the OpenLayers map
             */
            const mapa = new OpenLayersMap({
              target: 'map',
              layers: [
                ...Baselayers,
                vectorLayer // last layer is the layer containing the points
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

                selectFavicon();

                // set ID of the selected place and its country
                setPlaceID(feature.get('id'));
                setCountry(feature.get('country'));

                if (activeFeature != null) {
                  setFeatureIcon(activeFeature, false);
                }

                activeFeature = feature
                setFeatureIcon(feature, true);

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

    return () => {
      setPlaceID('');
      setCountry('');
    }

  }, [])

  const setFeatureIcon = (feature, selected) => {
    let widthPrevious = 25;
    let heightPrevious = 20;
    if (feature.get('size') > 2) {
      widthPrevious = 40;
      heightPrevious = 30;
    }
    feature.setStyle(new Style({
      image: new Icon({
        opacity: selected ? 1 : 0.6,
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        anchor: [0.5, 0.5],
        width: widthPrevious,
        height: heightPrevious,
        src: selected ? selectedRadioIcon : notSelectedRadioIcon,
      })
    }))
  }

  const showHideLabels = (checked) => {
    setShowLabels(checked);
    layers[0].setVisible(true);
    if (checked) {
      fadeOutLayer(layers[1]);
    }
    else {
      fadeInLayer(layers[1]);
    }
  }

  const showHideRadios = (checked) => {
    if (checked) {
      fadeInLayer(layers[layers.length - 1]);
    }
    else {
      fadeOutLayer(layers[layers.length - 1]);
    }
  }

  const changeLayer = (value) => {

    if (showLabels) setShowLabels(false);

    switch (value) {
      case 'Aerial':
        layers[0].setOpacity(1);
        fadeInLayer(layers[1]);
        fadeOutLayer(layers[2]);
        setDisableShowLabels(false);
        break;
      case 'Road':
        layers[0].setOpacity(0);
        fadeOutLayer(layers[1]);
        fadeInLayer(layers[2]);
        setDisableShowLabels(true);
        break;
    }
  }

  const fadeOutLayer = (layer) => {
    let opacity = layer.getOpacity();
    if (opacity > 0) {
      layer.setOpacity(opacity - 0.05);
      setTimeout(() => {
        fadeOutLayer(layer);
      }, 10);
    }
    else {
      console.log('layer hidden');
      layer.setVisible(false);
    }
  }

  const fadeInLayer = (layer) => {
    layer.setVisible(true);
    fadeInLayerAux(layer);
  }
  const fadeInLayerAux = (layer) => {
    let opacity = layer.getOpacity();
    if (opacity < 1) {
      layer.setOpacity(opacity + 0.05);
      setTimeout(() => {
        fadeInLayer(layer);
      }, 10);
    }
  }

  return (
    <div className="map">
      <div className="panel-body" style={{ width: '100%' }}>
        <div id="map" className="panel-body" style={{ width: '100%' }}></div>
      </div>
      <div className="top-right-btns">
        <Popover placement="leftBottom" content={
          <div className="d-flex flex-column gap-2">
            <h4>Map options</h4>
            <div className="d-flex gap-2 justify-content-between">
              <p>Show labels</p>
              <Switch value={showLabels} onChange={showHideLabels} disabled={disableShowLabels} />
            </div>
            <div className="d-flex gap-2 justify-content-between">
              <p>Show radios</p>
              <Switch defaultChecked onChange={showHideRadios} />
            </div>
            <Select
              defaultValue={'Aerial'}
              onChange={changeLayer}
              options={[
                {
                  value: 'Aerial',
                  label: 'Aerial',
                },
                {
                  value: 'Road',
                  label: 'Road',
                },
              ]}
            />
          </div>
        }>
          <button className="map-layers"><IoLayersOutline size={48} color="white" /></button>
        </Popover>
        <button className="info-btn" onClick={showInfo}><InfoCircleOutlined style={{ fontSize: '2.5em', color: 'white' }} /></button>
      </div>
    </div>
  );
}

export default Map;