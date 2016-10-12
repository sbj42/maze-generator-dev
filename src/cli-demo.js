var process = require('process');
var Maze = require('@sbj42/maze-generator-core').Maze;
var GridMask = require('@sbj42/maze-generator-core').GridMask;

function makeMask(width, height) {
    if (width < 2 || height < 2) throw new Error('cannot test mask with this size: ' + width + 'x' + height);
    var mask = new GridMask(width, height, {
        interior: true
    });
    for (var x = 0 ; x < width; x += 2) {
        for (var y = 0; y < height; y += 2) {
            mask.set(x, y, false);
        }
    }
    return mask;
}

function cliDemoAlgorithm(algorithmName, algorithmFunc, width, height, options) {
    width = width || 39;
    height = height || 15;
    var noptions = {};
    if (options) {
        for (var k in options)
            noptions[k] = options[k];
    }
    if (!noptions.random)
        noptions.random = Math.random;
    if (noptions.mask === true)
        noptions.mask = makeMask(width, height);

    var maze = new Maze(width, height);
    algorithmFunc(maze, noptions);

    var stdout = process.stdout;
    stdout.write(algorithmName + ' ' + width + 'x' + height + '\n');
    var x, y;
    for (x = 0; x < maze.width(); x ++) {
        stdout.write('__');
    }
    stdout.write('_');
    stdout.write('\n');
    for (y = 0; y < maze.height(); y ++) {
        for (x = 0; x < maze.width(); x ++) {
            stdout.write(maze.cell(x, y).west() ? '_' : '|');
            stdout.write(maze.cell(x, y).south() ? ' ' : '_');
        }
        stdout.write(maze.cell(maze.width()-1, y).east() ? ' ' : '|');
        stdout.write('\n');
    }
}

module.exports = cliDemoAlgorithm;
