var process = require('process');
var Maze = require('@sbj42/maze-generator-core').Maze;

function cliDemoAlgorithm(algorithmName, algorithmFunc, width, height, options) {
    var maze = new Maze(width, height);
    algorithmFunc(maze, options);

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
