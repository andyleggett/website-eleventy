import { map, compose, pick, prop, join, toPairs, merge, forEach } from 'ramda';
import { Task, map as mapT, chain } from '../utils/task.js';

import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Overlay from 'ol/Overlay';
import { fromLonLat, toLonLat } from 'ol/proj';

const log = item => {
    console.log(item);
    return item;
};

const getLocationFromBrowser = geooptions =>
    Task((rej, res) => {
        if (navigator.geolocation !== undefined) {
            navigator.geolocation.getCurrentPosition(res, () => res(geooptions.default), geooptions);
        } else {
            res(geooptions.default);
        }
    });

const getLatLngFromLocation = compose(pick(['latitude', 'longitude']), prop('coords'));

export const getLocation = compose(mapT(getLatLngFromLocation), getLocationFromBrowser);

const buildQueryOption = item => `${item[0]}=${item[1]}`;

const buildAPIQuery = compose(join('&'), map(buildQueryOption), toPairs);

const getLocationFromAPIData = compose(pick(['Title', 'Distance', 'Latitude', 'Longitude']), prop(['AddressInfo']));

const callChargerAPI = query =>
    Task((rej, res) =>
        fetch(`https://api.openchargemap.io/v2/poi/?output=json&opendata=true&${query}`)
            .then(response => response.json())
            .then(res)
            .catch(rej)
    );

export const getChargerLocations = apioptions => compose(mapT(map(getLocationFromAPIData)), chain(callChargerAPI), mapT(buildAPIQuery), mapT(merge(apioptions)));

const createChargerMapMarker = location => {
    const chargerImage = document.createElement('img');
    chargerImage.src = '/images/charger.png';

    return new Overlay({
        position: [location.Longitude, location.Latitude],
        positioning: 'center-center',
        element: chargerImage,
        stopEvent: false
    });
};

const createChargerMapLabel = location => {
    const chargerLabel = document.createElement('div');
    chargerLabel.innerText = location.Title;

    return new Overlay({
        position: [location.Longitude, location.Latitude],
        element: chargerLabel
    });
};

export const createChargerLocationMap = (mapelem, centre, locations) => {
    var map = new Map({
        layers: [
            new TileLayer({
                source: new OSM()
            })
        ],
        target: mapelem,
        view: new View({
            center: [centre.longitude, centre.latitude],
            zoom: 14
        })
    });

    forEach(location => {
        map.addOverlay(createChargerMapMarker(location));
        map.addOverlay(createChargerMapLabel(location));
    }, locations);

    return map;
};
