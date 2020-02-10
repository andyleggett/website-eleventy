<script>
    import { fork } from '../utils/task.js';
    import Spinner from '../components/Spinner.svelte';

    import { getLocation } from './chargerfunctions.js';

    let running = false;
    let fetching = false;
    let coords;

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

    const run = () => {
        running = true;
        fetching = true;

        fork(
            error => console.log(error),
            location => {
                fetching = false;
                coords = location;
            },
            getLocation(geoOptions)
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
        <div class="code-result">Latitude: {coords.latitude.toFixed(2)}</div>
        <div class="code-result">Longitude: {coords.longitude.toFixed(2)}</div>
    {/if}
{/if}
