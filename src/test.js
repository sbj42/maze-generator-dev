var describe = require('mocha').describe;
var it = require('mocha').it;
var assert = require('assert');

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

function isMaze(m) {
    return m.width && m.height && m.cell;
}
function cellPassageCount(c) {
    return (c.north() ? 1 : 0) + (c.east() ? 1 : 0) + (c.south() ? 1 : 0) + (c.west() ? 1 : 0);
}

function makeMask(width, height) {
    if (width < 2 || height < 2) throw new Error('cannot test mask with this size: ' + width + 'x' + height);
    var mask = new GridMask(width, height, false);
    for (var x = 0 ; x < width; x += 2) {
        for (var y = 0; y < height; y += 2) {
            mask.set(x, y, false);
        }
    }
    return mask;
}

function genFunc(algorithmFunc, options) {
    return function(width, height, seed) {
        var noptions = {};
        for (var k in options)
            noptions[k] = options[k];
        if (seed)
            noptions.random = makeRandom(seed);
        else
            noptions.random = Math.random;
        if (noptions.mask === true)
            noptions.mask = makeMask(width, height);
        var maze = new Maze(width, height);
        algorithmFunc(maze, noptions);
        return maze;
    };
}

function testAlgorithmOpt(algorithmFunc, options) {

    var gen = genFunc(algorithmFunc, options);

    // Some maze algorithms might intentionally produce no dead ends:
    // it('should have at least two dead ends', function() {
    //     var m1 = gen(15, 11, 7);
    //     var deadEndCount = 0;
    //     for (var y = 0; y < m1.height(); y ++) {
    //         for (var x = 0; x < m1.width(); x ++) {
    //             if (cellPassageCount(m1.cell(x, y)) == 1)
    //                 deadEndCount ++;
    //         }
    //     }
    //     assert.ok(deadEndCount >= 2, 'not enough dead ends');
    // });

    it('should not have passages that go out of bounds', function() {
        var m1 = gen(16, 18, 8);
        for (var y = 0; y < m1.height(); y ++) {
            assert.ok(!m1.cell(0, y).west(), 'a cell on the west edge should not have a west passage');
            assert.ok(!m1.cell(m1.width() - 1, y).east(), 'a cell on the east edge should not have a east passage');
        }
        for (var x = 0; x < m1.width(); x ++) {
            assert.ok(!m1.cell(x, 0).north(), 'a cell on the north edge should not have a north passage');
            assert.ok(!m1.cell(x, m1.height() - 1).south(), 'a cell on the south edge should not have a south passage');
        }
    });

    it('should have cells with passages that match', function() {
        var m1 = gen(16, 18, 9);
        for (var y = 0; y < m1.height(); y ++) {
            for (var x = 0; x < m1.width(); x ++) {
                var cell = m1.cell(x, y);
                assert.equal(cell.west(), m1.cell(x-1, y).east(), 'west mismatch from ' + x + ',' + y);
                assert.equal(cell.east(), m1.cell(x+1, y).west(), 'east mismatch from ' + x + ',' + y);
                assert.equal(cell.north(), m1.cell(x, y-1).south(), 'north mismatch from ' + x + ',' + y);
                assert.equal(cell.south(), m1.cell(x, y+1).north(), 'south mismatch from ' + x + ',' + y);
            }
        }
    });
}

function testAlgorithm(algorithmName, algorithmFunc, options) {
    options = options || {};

    describe(algorithmName, function() {

        var gen = genFunc(algorithmFunc, options);

        it('can make a very thin maze', function() {
            assert.ok(isMaze(gen(1, 100)));
            assert.ok(isMaze(gen(100, 1)));
        });

        it('should return the same maze when seeded the same', function() {
            var m1 = gen(7, 11, 3);
            var m2 = gen(7, 11, 3);
            for (var y = 0; y < m1.height(); y ++) {
                for (var x = 0; x < m1.width(); x ++) {
                    var c1 = m1.cell(x, y);
                    var c2 = m2.cell(x, y);
                    assert.equal(c1.north(), c2.north(), 'north mismatch at ' + x + ',' + y);
                    assert.equal(c1.east(), c2.east(), 'east mismatch at ' + x + ',' + y);
                    assert.equal(c1.south(), c2.south(), 'south mismatch at ' + x + ',' + y);
                    assert.equal(c1.west(), c2.west(), 'west mismatch at ' + x + ',' + y);
                }
            }
        });

        it('should generate no interior cells without passages', function() {
            var m1 = gen(11, 15, 6);
            for (var y = 0; y < m1.height(); y ++) {
                for (var x = 0; x < m1.width(); x ++) {
                    assert.ok(cellPassageCount(m1.cell(x, y)) > 0, 'no passage at ' + x + ',' + y);
                }
            }
        });

        testAlgorithmOpt(algorithmFunc, options);

    }); // algorithm

    if (algorithmFunc.features && algorithmFunc.features.mask) {
        describe(algorithmName+'.mask', function() {
            var noptions = {};
            for (var x in options)
                noptions[x] = options[x];
            noptions.mask = true;
            testAlgorithmOpt(algorithmFunc, noptions);
        });
    }

}

module.exports = testAlgorithm;
