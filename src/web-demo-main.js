/* eslint-env browser */
var algorithmFunc = require('mg-algorithm');
var Maze = require('@sbj42/maze-generator-core').Maze;

var go = document.getElementById('go');
go.addEventListener('click', function() {
    var width = +document.getElementById('width').value;
    var height = +document.getElementById('height').value;
    if (!width || !height || width < 1 || height < 1)
        return;

    var options = {
        random: Math.random
    };

    var maze = new Maze(width, height);
    algorithmFunc(maze, options);

    var html = '';
    var x, y;
    for (x = 0; x < maze.width(); x ++) {
        html += '__';
    }
    html += '_';
    html += '\n';
    for (y = 0; y < maze.height(); y ++) {
        for (x = 0; x < maze.width(); x ++) {
            html += maze.cell(x, y).west() ? '_' : '|';
            html += maze.cell(x, y).south() ? ' ' : '_';
        }
        html += maze.cell(maze.width()-1, y).east() ? ' ' : '|';
        html += '\n';
    }
    document.getElementById('result').innerHTML = html;
});
