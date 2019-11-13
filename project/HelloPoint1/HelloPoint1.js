var VSHADER_SOUCE =
    'void main() {\n' +
    '   gl_Position = vec4(0.0,0.0,0.0,1.0);\n' +
    '   gl_PointSize = 10.0;\n' +
    '}\n';

var FSHADER_SOURCE =
    'void main(){\n' +
    '   gl_FragColor = vec4(1.0,0.0,0.0,1.0);\n' +
    '}\n';

function main() {
    //获取canvas
    var canvas = document.getElementById('webgl');

    var gl = getWebGLContext(canvas,true);
    if (!gl) {
        console.log("浏览器不支持webgl");
        return;
    }

    //初始化着色器
    if (!initShaders(gl, VSHADER_SOUCE, FSHADER_SOURCE)) {
        console.log("初始化着色器失败");
        return;
    }

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.POINTS, 0, 1);
}