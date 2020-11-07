var VSHADER =
    'attribute vec4 a_Position;' +
    'void main(){\n' +
    'gl_Position = a_Position;\n' +
    'gl_PointSize = 10.0;\n' +
    '}\n';

var FSHADER = 'void main(){\n' +
    'gl_FragColor = vec4(1.0,1.0,1.0,1.0);\n' +
    '}\n';

var points = [];

function main() {
    var canvas = document.getElementById("example");
    var gl = getWebGLContext(canvas);

    initShaders(gl, VSHADER, FSHADER);

    canvas.onmousemove = function (event) {
        var x = event.clientX;
        var y = event.clientY;
        var rect = event.target.getBoundingClientRect();
        x = ((x - rect.left) / canvas.clientWidth - 0.5) * 2;
        y = (0.5 - (y - rect.top) / canvas.clientHeight) * 2;

        points.push(x);
        points.push(y);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        for (var i = 0; i < points.length; i += 2) {
            var a_Position = gl.getAttribLocation(gl.program, "a_Position");
            gl.vertexAttrib3f(a_Position, points[i], points[i + 1], 0.0);
            gl.drawArrays(gl.POINTS, 0, 1);
        }
    }
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}