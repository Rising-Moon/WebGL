var VSHADER =
    'attribute vec4 a_Position;' +
    'void main(){\n' +
    'gl_Position = a_Position;\n' +
    'gl_PointSize = 4.0;\n' +
    '}\n';

var FSHADER =
    'precision mediump float;\n' +
    'uniform vec4 u_FragColor;\n' +
    'void main(){\n' +
    'gl_FragColor = u_FragColor;\n' +
    '}\n';

function main() {
    var canvas = document.getElementById("example");
    var gl = getWebGLContext(canvas);
    //存储绘制点
    var points = [];
    //存储绘制颜色
    var colors = [];

    initShaders(gl, VSHADER, FSHADER);

    canvas.onmousemove = function (event) {
        var x = event.clientX;
        var y = event.clientY;
        var rect = event.target.getBoundingClientRect();
        x = ((x - rect.left) / canvas.clientWidth - 0.5) * 2;
        y = (0.5 - (y - rect.top) / canvas.clientHeight) * 2;

        points.push([x, y]);

        var xl = 0;
        var xr = 0;
        if (x > 0) {
            xr = x;
        } else {
            xl = x;
        }

        colors.push([xl, xr, Math.abs(1 - x), 1.0]);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        for (var i = 0; i < points.length; i++) {
            //绘制点变量
            var a_Position = gl.getAttribLocation(gl.program, "a_Position");
            //绘制颜色变量
            var u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");

            var point = points[i];
            var color = colors[i];

            gl.vertexAttrib3f(a_Position, point[0], point[1], 0.0);
            gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
            gl.drawArrays(gl.POINTS, 0, 1);
        }
    }
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}