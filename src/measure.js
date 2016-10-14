var Maze = require('@sbj42/maze-generator-core').Maze;

function makeRandom(seed) {
    var randomjs = require('random-js');
    var engine = randomjs.engines.mt19937().seed(seed);
    var real = randomjs.real(0, 1);
    return function() {
        return real(engine);
    };
}

function run(algorithmFunc, width, height, seed) {
    var noptions = {};
    if (seed)
        noptions.random = makeRandom(seed);
    else
        noptions.random = Math.random;
    var maze = new Maze(width, height);
    algorithmFunc(maze, noptions);
    return maze;
}

function cellPassageCount(c) {
    return (c.north() ? 1 : 0) + (c.east() ? 1 : 0) + (c.south() ? 1 : 0) + (c.west() ? 1 : 0);
}
function countDeadEnds(maze) {
    var count = 0;
    var total = 0;
    for (var x = 0 ; x < maze.width(); x += 2) {
        for (var y = 0; y < maze.height(); y += 2) {
            if (cellPassageCount(maze.cell(x, y)) == 1)
                count ++;
            total ++;
        }
    }
    return count / total;
}

function init() {
    return {
        deadEnds: 0,
        count: 0
    };
}

function measure(data, maze) {
    data.deadEnds += countDeadEnds(maze);
    data.count ++;
}

function measureAlgorithm(algorithmName, algorithmFunc) {

    /*eslint no-console: "off"*/
    /*global console*/

    var data = init();
    for (var i = 0; i < 100; i ++) {
        var maze = run(algorithmFunc, 100, 100, i);
        measure(data, maze);
    }
    console.info(algorithmFunc + '#dead-ends: ' + (data.deadEnds / data.count));
    // TODO stddev?
}

module.exports = measureAlgorithm;
