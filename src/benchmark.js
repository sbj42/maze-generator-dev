var benchmark = require('benchmark');
var Maze = require('@sbj42/maze-generator-core').Maze;
var GridMask = require('@sbj42/maze-generator-core').GridMask;

function makeRandom(seed) {
    var randomjs = require('random-js');
    var engine = randomjs.engines.mt19937().seed(seed);
    var real = randomjs.real(0, 1);
    return function() {
        return real(engine);
    };
}

function run(algorithmFunc, width, height, options, seed, options2) {
    options2 = options2 || {};
    var noptions = {};
    var x;
    for (x in options)
        noptions[x] = options[x];
    for (x in options2)
        noptions[x] = options2[x];
    if (seed)
        noptions.random = makeRandom(seed);
    else
        noptions.random = Math.random;
    var maze = new Maze(width, height);
    algorithmFunc(maze, noptions);
    return maze;
}

function benchmarkAlgorithm(algorithmName, algorithmFunc, options) {
    options = options || {};

    /*eslint no-console: "off"*/
    /*global console*/
    for (var i = 10; i <= 100; i += 10) {
        console.info(new benchmark(algorithmName+'#' + i + 'x' + i, function() {
            run(algorithmFunc, i, i, options, 1);
        }).run().toString());
        if (algorithmFunc.features && algorithmFunc.features.mask) {
            var mask = new GridMask(i, i, {
                interior: true
            });
            for (var x = 0; x < i; x += 10) {
                for (var y = 0; y < i; y += 10) {
                    for (var xx = 0; xx < 5; xx ++) {
                        for (var yy = 0; yy < 5; yy ++) {
                            mask.set(x + xx, y + yy, false);
                        }
                    }
                }
            }
            console.info(new benchmark(algorithmName+'.mask#' + i + 'x' + i, function() {
                run(algorithmFunc, i, i, options, 1, {
                    mask: mask
                });
            }).run().toString());
        }
    }

}

module.exports = benchmarkAlgorithm;
