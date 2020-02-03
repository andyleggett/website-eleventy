---
tags: post
title: Function Composition with Ramda
layout: layouts/base.njk
---

# Function Composition with Ramda

Up until a few years ago I would use Underscore or Lodash for my function needs - probably because I had several production apps written with Backbone. It's nice to see data flowing through a series of transformations to get it ready for use in UI or maybe to be sent to some server for processing further.

The talk <a class="article-link" href="http://www.youtube.com/watch?v=m3svKOdZijA" target="_blank">Hey Underscore, You're Doing It Wrong</a>, changed everything. It opened up a new world of possibilities and a new way to program. I looked around for a library that would serve this new purpose and found <a class="article-link" href="http://ramdajs.com" target="_blank">Ramda</a>. This library allowed me to start bringing some of the ideas in Brian Lonsdorf's video into my work.

## Partial Application

The problem for me, at the time, was Underscore and Lodash have function signatures that put their data first and transformation functions second in paramter order, meaning that partial application of functions isn't really possible. (N.B. There are variations of each library that do address this.) This meant that a basic aspect of the new functional ideas I was discovering, namely parial application or <i>currying</i>, was not possible.

The currying process gives a function some, but not all, of its parameters. Calling the function in this way returns a function that expects the remaining parameters. Ramda's functions are curried automatically making them very flexible.

Let's look at an example of this. This is the map function in Lodash, it takes a collection of items and produces a new collection based on a transformation function. This example will give us a list of squad numbers for a football team.

```js
var getSquadNumber = function(player) {
    return player.squadNumber;
};

var squadNumbers = _.map(squadPlayers, getSquadNumber);
```

The same function in Ramda is as follows.

```js
var squadNumbers = R.map(getSquadNumber, squadPlayers);
```

You can see the order of parameters is swapped.

In the players example we could partially apply the map function to return a function that maps the getSquadNumber function over a collection of squad players.

```js
var squadNumberMap = R.map(getSquadNumber);

var squadNumbers = squadNumberMap(squadPlayers);
```

The function squadNumberMap is ready to accept one parameter - the squad player collection that we will map over.

## Composition

Composition is the act of combining two or more functions together. These functions can be thought of as a pipeline of computation from a starting input to an eventual output. The aim is to eliminate a lot of the imperative code that would be generated from calling one function after another and storing the intermediate state in local variables.

Let's consider a computation on our players example again. We'll write some functions that will take a squad of players, filter out the team members and then return their names sorted by surname.

First we'll look at the composition function offered by Ramda in use for this example.

```js
var teamNames = R.compose(sortBySurname, projectNames, filterTeam)(squadPlayers);
```

I like to look at this statement going from right to left. We put in the squadPlayers collection at the right-hand end and it flows through each function - _filterTeam_, then _projectNames_, then _sortBySurname_, each function taking the output of the last as its input, until it returns the result into the _teamNames_ variable.

If your brain doesn't work that way round you can use the _pipe_ function which is basically compose in reverse. I like compose.

```js
var teamNames = R.pipe(filterTeam, projectNames, sortBySurname)(squadPlayers);
```

In either case you can see how readable the code is without the noise of variables making the place look untidy. We can provide the functions for each stage as pure functions than are easy to reason about and can be built up from Ramda's other utilities. Let's do that now.

```js
var isInTeam = function(player) {
    return player.inTeam;
};

var filterTeam = R.filter(isInTeam);

var projectName = function(player) {
    return {
        firstName: player.firstName,
        surname: player.surname
    };
};

var projectNames = R.map(projectName);

var getSurname = function(names) {
    return names.surname;
};

var sortBySurname = R.sortBy(getSurname);
```

You can see straight away that we are building up functionality using small pure functions. The important thing is that each of the functions we are going to compose has _one_ input parameter even though the Ramda functions we are using take _two_ input parameters. Each one is partially applied with predicate, transformation and lookup functions respectively. (_Note: Of course the first function could have more than one input parameter as long as each subsequent function has one, but we'll keep it simple here_)

Each of our handwritten functions have a Ramda equivalent we can use instead.

```js
var filterTeam = R.filter(R.propEq('inTeam', true));

var projectNames = R.map(R.props(['firstName', 'surname']));

var sortBySurname = R.sortBy(R.prop('surname'));
```

You could drop the intermediate functions as well but I find it easier to maintain code like this. One thing to note here is that these functions are now written in a completely _point-free_ way. This means that the data for these functions is not mentioned in their construction.

We could write the composition in this way too. This gives us a portable function for getting sorted team player names, easily reusable.

```js
var getTeamNames = R.compose(sortBySurname, projectNames, filterTeam);
```

Let's look at another example from a set of live election data. Data is sent through about each constituency and declared areas need to be shown on a map. A small part of the data transformation is filtering the declared constituencies.

```js
var projectMapItem = R.props(['gssID', 'fullName', 'partyCodeLast', 'partyCodeNow', 'gainHoldWin']);

var sortByDeclarationTime = R.sortBy(R.prop('declarationTime'));

var isDeclared = R.propEq('status', 'D');

var declared = R.compose(R.map(projectMapItem), sortByDeclarationTime, R.filter(isDeclared))(constituencies);
```

As you can see I'm using lots of Ramda's functions to build the intent of each sub-section of the composition pipeline. The level you use them at depends on the readability of the final statements. Reading from right to left: the first function _filter_ uses the isDeclared predicate to provide a new array with only the constituencies with a status of D (for Declared). This is then applied as the input of a sort by declaration time, and finally only parts of the constituency object that are required for the display are projected into the resulting array.

These are just a couple of examples of where a toolbox of functions saves you time and effort. These functions have also been tested in many projects and are well-optimised.

## Conclusion

The use of a library of pre-built functions should be familiar to many programmers. The use of composition to create pipelines, breaking down each step into manageable, pure functions, has made my work more enjoyable. They are easy to reason about and easy to maintain.

Messing around with tons of imperative code is not fun and should be avoided at all costs in my opinion. Remember you only have a finite number of keystrokes - use them wisely! Oh and if you're going to do anything, make sure you're doing it _right_ ;)
