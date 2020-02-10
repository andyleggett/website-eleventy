<script>
    import { fork, of, chain, map as mapT } from '../utils/task.js';
    import { useGeographic } from 'ol/proj';
    import { compose } from 'ramda';
    import Spinner from '../components/Spinner.svelte';

    import { getChargerRoute, getNearestLocation, getChargerLocations, getLocation } from './chargerfunctions.js';
    import { createChargerRouteMap } from './mapfunctions.js';

    const geoOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        default: {
            coords: {
                latitude: 56.134059,
                longitude: -3.955293
            }
        }
    };

    const apiOptions = {
        maxResults: 10,
        distance: 10
    };

    let running = false;
    let fetching = false;
    let mapElement;

    useGeographic();

    const run = () => {
        running = true;
        fetching = true;

        fork(
            error => console.log(error),
            location => {
                fork(
                    error => console.log(error),
                    geojson => {
                        fetching = false;
                        createChargerRouteMap(mapElement, location, geojson);
                    },
                    compose(
                        chain(getChargerRoute(location)),
                        mapT(getNearestLocation),
                        getChargerLocations(apiOptions)
                    )(of(location))
                );
            },
            getLocation(geoOptions)
        );
    };
</script>

<style>

</style>

<button on:click={run} class="run-button">Run this part</button>
{#if running}
    {#if fetching === true}
        <div class="code-spinner">
            <Spinner />
        </div>
    {/if}
    <div style="height: 500px;" bind:this={mapElement} />
{/if}
