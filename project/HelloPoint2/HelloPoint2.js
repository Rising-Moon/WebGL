﻿var VSHADER_SOUCE =
    'attribute vec4 a_Position;\n' +
    'attribute float a_PointSize;' +
    'void main() {\n' +
    '   gl_Position = a_Position;\n' +
    '   gl_PointSize = a_PointSize;\n' +
    '}\n';

var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'uniform vec4 u_FragColor;\n' +
    'void main(){\n' +
    '   gl_FragColor = u_FragColor;\n' +
    '}\n';

var g_points = [];
var g_colors = [];

function main() {
    //获取canvas
    var canvas = document.getElementById('webgl');

    var gl = getWebGLContext(canvas, true);
    if (!gl) {
        console.log("浏览器不支持webgl");
        return;
    }

    //初始化着色器
    if (!initShaders(gl, VSHADER_SOUCE, FSHADER_SOURCE)) {
        console.log("初始化着色器失败");
        return;
    }

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    var a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
    var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (a_Position < 0) {
        console.log("获取a_Position失败");
        return;
    }
    if (a_PointSize < 0) {
        console.log("获取a_PointSize失败");
        return;
    }
    if (!u_FragColor) {
        console.log("获取u_FragColor失败");
        return;
    }

    canvas.onmouseover = function (ev) {
        click(ev, gl, canvas, a_Position, u_FragColor)
    };

    canvas.onmousemove = function (ev) {
        click(ev, gl, canvas, a_Position, u_FragColor)
    };

    //canvas.onmousedown = function (ev) {
    //    click(ev, gl, canvas, a_Position)
    //};

    gl.vertexAttrib1f(a_PointSize, 10.0);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function click(ev, gl, canvas, a_Position, u_FragColor) {
    var x = ev.clientX;
    var y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();
    //x = ((x - rect.left) - canvas.height / 2) / (canvas.height / 2);
    //y = (canvas.width / 2 - (y - rect.top)) / (canvas.width / 2);
    x = (x - rect.left) * 2 / canvas.height - 1;
    y = 1 - (y - rect.top) * 2 / canvas.width;
    g_points.push([x, y]);
    var colorR = (x + 1) / 2.0;
    var colorG = (y + 1) / 2.0;
    var colorB = (x * y + 1) / 2.0;
    g_colors.push([colorR, colorG, colorB, 1.0]);

    gl.clear(gl.COLOR_BUFFER_BIT);

    var len = g_points.length;
    for (var i = 0; i < len; i++) {
        var xy = g_points[i];
        gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
        gl.uniform4fv(u_FragColor, g_colors[i]);
        gl.drawArrays(gl.POINTS, 0, 1);
    }
}