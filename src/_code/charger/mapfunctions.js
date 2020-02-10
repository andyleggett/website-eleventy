import { forEach } from 'ramda';

import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Overlay from 'ol/Overlay';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import GeoJSON from 'ol/format/GeoJSON';
import { Style, Stroke, Icon, Circle, Fill } from 'ol/style';
import { default as LayerVector } from 'ol/layer/Vector';
import { default as SourceVector } from 'ol/source/Vector';

const createChargerMapMarker = location => {
    const chargerImage = document.createElement('img');
    chargerImage.src = '/images/charger.png';

    return new Overlay({
        position: [location.longitude, location.latitude],
        positioning: 'center-center',
        element: chargerImage,
        stopEvent: false
    });
};

const createChargerMapLabel = location => {
    const chargerLabel = document.createElement('div');
    chargerLabel.innerText = location.title;
    chargerLabel.style.transform = 'translateX(-50%)';
    chargerLabel.style.fontSize = '0.8rem';
    chargerLabel.style.padding = '0.1rem';
    chargerLabel.style.marginTop = '1rem';
    chargerLabel.style.backgroundColor = '#fff';

    return new Overlay({
        position: [location.longitude, location.latitude],
        element: chargerLabel
    });
};

export const createChargerLocationMap = (mapelem, centre, locations) => {
    const map = new Map({
        layers: [
            new TileLayer({
                source: new OSM()
            })
        ],
        target: mapelem,
        view: new View({
            center: [centre.longitude, centre.latitude],
            zoom: 10
        })
    });

    forEach(location => {
        map.addOverlay(createChargerMapMarker(location));
        map.addOverlay(createChargerMapLabel(location));
    }, locations);

    return map;
};

export const createChargerRouteMap = (mapelem, centre, geojson) => {
    const route = new GeoJSON().readFeature(geojson.features[0]).getGeometry();

    const routeCoords = route.getCoordinates();

    const routeFeature = new Feature({
        type: 'route',
        geometry: route
    });

    const geoMarker = new Feature({
        type: 'geoMarker',
        geometry: new Point(routeCoords[0])
    });

    const startMarker = new Feature({
        type: 'icon',
        geometry: new Point(routeCoords[0])
    });

    const endMarker = new Feature({
        type: 'icon',
        geometry: new Point(routeCoords[routeCoords.length - 1])
    });

    const styles = {
        route: new Style({
            stroke: new Stroke({
                width: 6,
                color: [237, 212, 0, 0.8]
            })
        }),
        icon: new Style({
            image: new Icon({
                anchor: [0.5, 1],
                src: '/images/charger.png'
            })
        }),
        geoMarker: new Style({
            image: new Circle({
                radius: 7,
                snapToPixel: false,
                fill: new Fill({ color: 'black' }),
                stroke: new Stroke({
                    color: 'white',
                    width: 2
                })
            })
        })
    };

    const vectorLayer = new LayerVector({
        source: new SourceVector({
            features: [routeFeature, geoMarker, startMarker, endMarker]
        }),
        style: feature => styles[feature.get('type')]
    });

    const map = new Map({
        layers: [
            new TileLayer({
                source: new OSM()
            }),
            vectorLayer
        ],
        target: mapelem,
        view: new View({
            center: [centre.longitude, centre.latitude],
            zoom: 10
        })
    });

    return map;
};
