var benchmark = require('benchmark');
var Maze = require('@sbj42/maze-generator-core').Maze;

function makeRandom(seed) {
    var randomjs = require('random-js');
    var engine = randomjs.engines.mt19937().seed(seed);
    var real = randomjs.real(0, 1);
    return function() {
        return real(engine);
    };
}

function benchmarkAlgorithm(algorithmName, algorithm, options) {

    function run(width, height, seed) {
        var noptions = {};
        for (var x in options)
            noptions[x] = options[x];
        if (seed)
            noptions.random = makeRandom(seed);
        else
            noptions.random = Math.random;
        var maze = new Maze(width, height);
        algorithm(maze, noptions);
        return maze;
    }

    /*eslint no-console: "off"*/
    /*global console*/
    for (var i = 10; i <= 100; i += 10) {
        console.info(new benchmark(algorithmName+'#' + i + 'x' + i, function() {
            run(i, i, 1);
        }).run().toString());
    }
}

module.exports = benchmarkAlgorithm;
