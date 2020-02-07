---
tags: post
title: Dude, where's my charging point?
date: 2017-05-25
layout: layouts/base.njk
---

<script defer src="/scripts/charger.js"></script>

# Dude, where's my charging point?

## Look out it's more functional stuff!

I've been using a functional style for a while now to great advantage in my day-to-day projects. What I haven't really gotten to grips with is the use of Monads other than lists in my composition pipelines. Watching videos and reading articles got me some of the way but I wanted to build some examples to get the hang of running my normal functions in these _contexts_ which is essentially what we are talking about with Monads.

I'm always using requests to various apis to get data and then process it. Promises have been my go to for quite a while now and so I thought I'd look at an example of using Tasks. I've also written <a href="/writing/tasksandpromises">a comparison of Promises and Tasks<a href="/writing/tasksandpromises"></a>, so maybe take a quick look at that.

A Task is a context or wrapper for a possible future value from a computation. The future value can be transformed with normal functions by _lifting_ them into the Task context. What I'm trying to show here is that the Task can be put into a composed list of transforming functions.

## Electric vehicle charging points

Looking around for some data to play around with I found the data.gov.uk site where the UK government has made lots of different datasets available. One that caught my eye was a complete registry of electrical car-charging points. There's some data that needs to go on a map I thought. Unfortunately there wasn't a cross-domain header on the data so I turned to a site called Open Charge Map which already does what I'm intending but it's ok I'm not starting a business here.

I'll be using a small Task library I put together. It's not fully-featured but will do the job here.

Anyway, click or tap the buttons to run the parts as we go step-by-step towards getting a map with directions to the nearest charger.

## Step 1 - Find out where you are right now

In this first step I'm going to find your location co-ordinates. The code below uses a Task to encapsulate a GeoLocation API call and then _lifts_ the _getLatLngFromLocation_ function into that Task's context to get the coordinates return by the API. The Task's map function called _mapT_ here is used to accomplish that.

When you run this if you don't want to give your location just hit deny on the popup and it'll use a default one. It takes a few seconds to get your location if you agree.

<div class="code-example" id="charger1"></div>

```js
const getLocationFromBrowser = geooptions => Task((rej, res) => {
    if (navigator.geolocation !== undefined) {
        navigator.geolocation.getCurrentPosition(res, () => res(geooptions.default), geooptions);
    } else {
        res(geooptions.default);
    }
});

const getLatLngFromLocation = compose(
    pick(['latitude', 'longitude']),
    prop('coords')
);


const getLocation = compose(
    mapT(getLatLngFromLocation)
    getLocationFromBrowser
);

```

The _getLocation Task_ is ready to be run using the _fork_ function when we need it. It will be given a reject function to run on a failure and a resolve function on success.

```js
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

fork(
    error => console.log(error),
    coords => console.log(coords),
    getLocation(geoOptions)
);
```

## Step 2 - Get charger locations from the Open Charge API

The second step is use fetch to hit the Open Charge data endpoint. This step builds upon the last to start this pipeline of functions. Let's get some JSON goodness from those co-ordinates - the 10 closest charging points.

<div class="code-example" id="charger2"></div>

```js
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

const getChargerLocations = apioptions => compose(mapT(map(getLocationsFromAPIData)), chain(callChargerAPI), mapT(buildAPIQuery), mapT(merge(apioptions)));
```

```js
//geoOptions from step 1 used again

const apiOptions = {
    maxResults: 10,
    distance: 10
};

fork(
    error => console.log(error),
    results => console.log(results),
    compose(getChargerLocations(apiOptions), getLocation)(geoOptions)
);
```

There's a lot to unpack here. We have discussed _mapT_ already in the first step but now we have _chain_ to deal with. This is sometimes called _flatMap_. It's a way of _lifting_ a function that itself returns a Task into another Task's context. The chain function flattens the result of this into one Task.

## Step 3 - Get them on a map

<div class="code-example" id="charger3"></div>
