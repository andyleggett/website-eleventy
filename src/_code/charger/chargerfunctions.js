import { map, compose, pick, prop, join, toPairs, merge, curry, reduce } from 'ramda';
import { Task, map as mapT, chain } from '../utils/task.js';

const getLocationFromBrowser = geooptions =>
    Task((rej, res) => {
        if (navigator.geolocation !== undefined) {
            navigator.geolocation.getCurrentPosition(
                res,
                err => {
                    console.log(err);
                    res(geooptions.default);
                },
                geooptions
            );
        } else {
            res(geooptions.default);
        }
    });

const getLatLngFromLocation = compose(pick(['latitude', 'longitude']), prop('coords'));

export const getLocation = compose(mapT(getLatLngFromLocation), getLocationFromBrowser);

const buildQueryOption = item => `${item[0]}=${item[1]}`;

const buildAPIQuery = compose(join('&'), map(buildQueryOption), toPairs);

const getLocationFromAPIData = compose(
    address => ({
        title: address.Title,
        distance: address.Distance,
        latitude: address.Latitude,
        longitude: address.Longitude
    }),
    prop(['AddressInfo'])
);

const callChargerAPI = query =>
    Task((rej, res) =>
        fetch(`https://api.openchargemap.io/v2/poi/?output=json&opendata=true&${query}`)
            .then(response => response.json())
            .then(res)
            .catch(rej)
    );

export const getChargerLocations = apioptions => compose(mapT(map(getLocationFromAPIData)), chain(callChargerAPI), mapT(buildAPIQuery), mapT(merge(apioptions)));

export const getChargerRoute = curry((start, end) =>
    Task((rej, res) =>
        fetch(
            `https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf624831bfa6d39a7f49eba2eccd8e62289a49&start=${start.longitude},${start.latitude}&end=${end.longitude},${end.latitude}`,
            {
                headers: {
                    Accept: 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
                }
            }
        )
            .then(response => response.json())
            .then(res)
            .catch(rej)
    )
);

export const getNearestLocation = locations => reduce((min, location) => (min.distance > location.distance ? location : min), locations[0], locations);
