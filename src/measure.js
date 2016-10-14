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
function countDeadEndsRatio(maze) {
    var count = 0;
    var total = 0;
    for (var x = 0 ; x < maze.width(); x += 2) {
        for (var y = 0; y < maze.height(); y += 2) {
            if (cellPassageCount(maze.cell(x, y)) == 1)
                count ++;
            total ++;
        }
    }
    return count * 100 / total;
}

function init() {
    return {
        deadEnds: {
            total: 0,
            totalSq: 0
        },
        count: 0
    };
}

function measure(data, maze) {
    var count = countDeadEndsRatio(maze);
    data.deadEnds.total += count;
    data.deadEnds.totalSq += count * count;
    data.count ++;
}

function getAvg(total, count) {
    return total / count;
}

function getStdDev(total, totalSq, count) {
    return (Math.sqrt(count * totalSq - total * total) / count * 100);
}

function measureAlgorithm(algorithmName, algorithmFunc) {

    /*eslint no-console: "off"*/
    /*global console*/

    var data = init();
    for (var i = 0; i < 100; i ++) {
        var maze = run(algorithmFunc, 100, 100, i);
        measure(data, maze);
    }
    console.info(algorithmName + '#dead-ends: ' + (getAvg(data.deadEnds, data.count) * 100).toFixed(2) + '% stddev='
        + (getStdDev(data.deadEnds.total, data.deadEnds.totalSq, data.count) * 100).toFixed(2) + '%');
}

module.exports = measureAlgorithm;
