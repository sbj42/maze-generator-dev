var Maze = require('@sbj42/maze-generator-core').Maze;
var dirs = require('@sbj42/maze-generator-core').directions;

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

function cellPassageArray(c) {
    var ret = [];
    if (c.north())
        ret.push(dirs.NORTH);
    if (c.east())
        ret.push(dirs.EAST);
    if (c.west())
        ret.push(dirs.WEST);
    if (c.south())
        ret.push(dirs.SOUTH);
    return ret;
}

function moveStep(maze, x, y, dir) {
    var next = dirs.move(x, y, dir);
    var c = maze.cell(next[0], next[1]);
    var choices = [];
    if (c.north() && dir != dirs.SOUTH)
        choices.push(dirs.NORTH);
    if (c.east() && dir != dirs.WEST)
        choices.push(dirs.EAST);
    if (c.west() && dir != dirs.EAST)
        choices.push(dirs.WEST);
    if (c.south() && dir != dirs.NORTH)
        choices.push(dirs.SOUTH);
    return [next, choices];
}

function getDeadEndRatio(maze) {
    var num = 0;
    var den = 0;
    for (var y = 0; y < maze.height(); y += 1) {
        for (var x = 0 ; x < maze.width(); x += 1) {
            if (cellPassageCount(maze.cell(x, y)) == 1)
                num ++;
            den ++;
        }
    }
    // console.info('dead-end-ratio '+num+'/'+den);
    return num / den;
}

function getBranchRatio(maze) {
    var num = 0;
    var den = 0;
    for (var y = 0; y < maze.height(); y += 1) {
        for (var x = 0 ; x < maze.width(); x += 1) {
            if (cellPassageCount(maze.cell(x, y)) > 2)
                num ++;
            den ++;
        }
    }
    // console.info('branch-ratio '+num+'/'+den);
    return num / den;
}

function getDeadEndLengthStats(maze) {
    var max = 0;
    var num = 0;
    var den = 0;
    for (var y = 0; y < maze.height(); y += 1) {
        for (var x = 0 ; x < maze.width(); x += 1) {
            if (cellPassageCount(maze.cell(x, y)) == 1) {
                var dir = cellPassageArray(maze.cell(x, y))[0];
                var pos = [x, y];
                var len = 1;
                for (;;) {
                    var stepResult = moveStep(maze, pos[0], pos[1], dir);
                    pos = stepResult[0];
                    var choices = stepResult[1];
                    if (choices.length != 1)
                        break;
                    dir = choices[0];
                    len ++;
                }
                // console.info('        dead-end @'+x+','+y+': '+len);
                max = Math.max(max, len);
                num += len;
                den ++;
            }
        }
    }
    // console.info('average-dead-end-length '+num+'/'+den);
    return [num / den, max];
}

function getStraightRunLengthStats(maze) {
    var max = 0;
    var num = 0;
    var den = 0;
    for (var y = 0; y < maze.height(); y += 1) {
        for (var x = 0 ; x < maze.width(); x += 1) {
            var celldirs = cellPassageArray(maze.cell(x, y));
            for (var i = 0; i < celldirs.length; i ++) {
                var dir = celldirs[i];
                var pos = [x, y];
                var len = 1;
                for (;;) {
                    var stepResult = moveStep(maze, pos[0], pos[1], dir);
                    pos = stepResult[0];
                    var choices = stepResult[1];
                    var found = false;
                    for (var j = 0; j < choices.length; j ++) {
                        if (choices[j] == dir)
                            found = true;
                    }
                    if (!found)
                        break;
                    len ++;
                }
                // console.info('        straight-run @'+x+','+y+': '+len);
                max = Math.max(max, len);
                num += len;
                den ++;
            }
        }
    }
    // console.info('average-straight-run-length '+num+'/'+den);
    return [num / den, max];
}

function init() {
    return {
        deadEndRatio: {
            total: 0,
            totalSq: 0
        },
        branchRatio: {
            total: 0,
            totalSq: 0
        },
        averageDeadEndLength: {
            total: 0,
            totalSq: 0
        },
        maxDeadEndLength: {
            total: 0,
            totalSq: 0
        },
        averageStraightRunLength: {
            total: 0,
            totalSq: 0
        },
        maxStraightRunLength: {
            total: 0,
            totalSq: 0
        },
        count: 0
    };
}

function measure(data, maze) {
    // var stdout = require('process').stdout;
    // var x, y;
    // for (x = 0; x < maze.width(); x ++) {
    //     stdout.write('__');
    // }
    // stdout.write('_');
    // stdout.write('\n');
    // for (y = 0; y < maze.height(); y ++) {
    //     for (x = 0; x < maze.width(); x ++) {
    //         stdout.write(maze.cell(x, y).west() ? '_' : '|');
    //         stdout.write(maze.cell(x, y).south() ? ' ' : '_');
    //     }
    //     stdout.write(maze.cell(maze.width()-1, y).east() ? ' ' : '|');
    //     stdout.write('\n');
    // }
    data.count ++;
    var v;
    v = getDeadEndRatio(maze);
    data.deadEndRatio.total += v;
    data.deadEndRatio.totalSq += v * v;
    v = getBranchRatio(maze);
    data.branchRatio.total += v;
    data.branchRatio.totalSq += v * v;
    v = getDeadEndLengthStats(maze);
    data.averageDeadEndLength.total += v[0];
    data.averageDeadEndLength.totalSq += v[0] * v[0];
    data.maxDeadEndLength.total += v[1];
    data.maxDeadEndLength.totalSq += v[1] * v[1];
    v = getStraightRunLengthStats(maze);
    data.averageStraightRunLength.total += v[0];
    data.averageStraightRunLength.totalSq += v[0] * v[0];
    data.maxStraightRunLength.total += v[1];
    data.maxStraightRunLength.totalSq += v[1] * v[1];
}

function getAvg(total, count) {
    return total / count;
}

function getStdDev(total, totalSq, count) {
    return Math.sqrt(count * totalSq - total * total) / count;
}

function measureAlgorithm(algorithmName, algorithmFunc) {

    /*eslint no-console: "off"*/
    /*global console*/

    var data = init();
    var width = 100;
    var height = 100;
    for (var i = 0; i < 100; i ++) {
        var maze = run(algorithmFunc, width, height, i + 1);
        measure(data, maze);
    }
    console.info(algorithmName + ' ' + width + 'x' + height + ' dead-end-ratio: ' + (getAvg(data.deadEndRatio.total, data.count) * 100).toFixed(2) + '% stddev='
        + (getStdDev(data.deadEndRatio.total, data.deadEndRatio.totalSq, data.count) * 100).toFixed(2) + '%');
    console.info(algorithmName + ' ' + width + 'x' + height + ' branch-ratio: ' + (getAvg(data.branchRatio.total, data.count) * 100).toFixed(2) + '% stddev='
        + (getStdDev(data.branchRatio.total, data.branchRatio.totalSq, data.count) * 100).toFixed(2) + '%');
    console.info(algorithmName + ' ' + width + 'x' + height + ' average-dead-end-length: ' + (getAvg(data.averageDeadEndLength.total, data.count)).toFixed(2) + ' stddev='
        + (getStdDev(data.averageDeadEndLength.total, data.averageDeadEndLength.totalSq, data.count)).toFixed(2));
    console.info(algorithmName + ' ' + width + 'x' + height + ' max-dead-end-length: ' + (getAvg(data.maxDeadEndLength.total, data.count)).toFixed(2) + ' stddev='
        + (getStdDev(data.maxDeadEndLength.total, data.maxDeadEndLength.totalSq, data.count)).toFixed(2));
    console.info(algorithmName + ' ' + width + 'x' + height + ' average-straight-run-length: ' + (getAvg(data.averageStraightRunLength.total, data.count)).toFixed(2) + ' stddev='
        + (getStdDev(data.averageStraightRunLength.total, data.averageStraightRunLength.totalSq, data.count)).toFixed(2));
    console.info(algorithmName + ' ' + width + 'x' + height + ' max-straight-run-length: ' + (getAvg(data.maxStraightRunLength.total, data.count)).toFixed(2) + ' stddev='
        + (getStdDev(data.maxStraightRunLength.total, data.maxStraightRunLength.totalSq, data.count)).toFixed(2));
}

module.exports = measureAlgorithm;
