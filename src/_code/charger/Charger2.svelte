<script>
    import { fork } from '../utils/task.js';
    import { compose } from 'ramda';
    import Spinner from '../components/Spinner.svelte';

    import { getChargerLocations, getLocation } from './chargerfunctions.js';

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
    let locations;

    const run = () => {
        running = true;
        fetching = true;

        fork(
            error => {
                console.log(error);
                locations = [];
            },
            results => {
                fetching = false;
                locations = results;
            },
            compose(
                getChargerLocations(apiOptions),
                getLocation
            )(geoOptions)
        );
    };
</script>

<style>

</style>

<button on:click={run} class="run-button">Run this part</button>
{#if running}
    {#if fetching}
        <div class="code-spinner">
            <Spinner />
        </div>
    {:else}
        {#each locations as location}
            <div class="code-result">{location.title} - {location.distance.toFixed(2)}km</div>
        {/each}
    {/if}
{/if}
