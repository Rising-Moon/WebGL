var VSHADER_SOUCE =
    'attribute vec4 a_Position;\n' +
    'void main() {\n' +
    '   gl_Position = a_Position;\n' +
    '   gl_PointSize = 2.0;' +
    '}\n';

var FSHADER_SOURCE =
    'void main(){\n' +
    '   gl_FragColor = vec4(1.0,0.0,0.0,1.0);\n' +
    '}\n';

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
    if (a_Position < 0) {
        console.log("webgl上下文丢失");
        return;
    }

    gl.vertexAttrib3f(a_Position, 0.0, 0.5, 0.0);

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.POINTS, 0, 1);
}