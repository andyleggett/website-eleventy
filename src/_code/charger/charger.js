import Charger1 from './Charger1.svelte';
import Charger2 from './Charger2.svelte';
import Charger3 from './Charger3.svelte';
import Charger4 from './Charger4.svelte';

new Charger1({
    target: document.querySelector('#charger1')
});

new Charger2({
    target: document.querySelector('#charger2')
});

new Charger3({
    target: document.querySelector('#charger3')
});

new Charger4({
    target: document.querySelector('#charger4')
});
