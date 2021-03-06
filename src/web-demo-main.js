/* eslint-env browser */
var algorithmFunc = require('mg-algorithm');
var Maze = require('@sbj42/maze-generator-core').Maze;
var GridMask = require('@sbj42/maze-generator-core').GridMask;
var dirs = require('@sbj42/maze-generator-core').directions;

if (!(algorithmFunc.features && algorithmFunc.features.mask)) {
    document.getElementById('ifmask').style.display = 'none';
}

function makeRandom(seed) {
    var randomjs = require('random-js');
    var engine = randomjs.MersenneTwister19937.seed(seed);
    var real = randomjs.real(0, 1);
    return function() {
        return real(engine);
    };
}

function makeMask(width, height) {
    var mask = new GridMask(width, height, {
        interior: true
    });
    for (var x = 0 ; x < width; x += 10) {
        for (var y = 0; y < height; y += 10) {
            for (var xx = 0; xx < 5; xx ++) {
                for (var yy = 0; yy < 5; yy ++) {
                    mask.set(x + 5 + xx, y + 5 + yy, false);
                }
            }
        }
    }
    return mask;
}

var go = document.getElementById('go');
go.addEventListener('click', function() {
    var width = +document.getElementById('width').value;
    var height = +document.getElementById('height').value;
    var seed = +document.getElementById('seed').value;
    var mask = +document.getElementById('mask').checked;
    var zoom = 4;
    if (!width || !height || width < 1 || height < 1)
        return;

    var options = {
        random: seed ? makeRandom(seed) : Math.random
    };
    if (mask)
        options.mask = makeMask(width, height);

    var maze = new Maze(width, height);
    algorithmFunc(maze, options);

    var canvas = document.getElementById('result');
    canvas.width = width * (1 + zoom) + 1;
    canvas.height = height * (1 + zoom) + 1;
    var context = canvas.getContext('2d');
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'black';
    var cy, y;
    for (y = 0; y < maze.height(); y ++) {
        cy = y * (1 + zoom);
        var cx, x;
        for (x = 0; x < maze.width(); x ++) {
            cx = x * (1 + zoom);
            if (mask) {
                if (!options.mask.get(x, y)) {
                    context.fillRect(cx, cy, 1 + zoom, 1 + zoom);
                    continue;
                }
            }
            context.fillRect(cx, cy, 1, 1);
            if (!maze.getPassage(x, y, dirs.NORTH))
                context.fillRect(cx + 1, cy, zoom, 1);
            if (!maze.getPassage(x, y, dirs.WEST))
                context.fillRect(cx, cy + 1, 1, zoom);
        }
        cx = x * (1 + zoom);
        context.fillRect(cx, cy, 1, 1 + zoom);
    }
    cy = y * (1 + zoom);
    context.fillRect(0, cy, canvas.width, 1);
});
