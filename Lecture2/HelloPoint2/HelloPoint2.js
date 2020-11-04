var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'void main() {\n' +
    'gl_Position = a_Position;\n' + //设置坐标
    'gl_PointSize = 10.0;\n' + //设置尺寸
    '}\n';

var FSHADER_SOURCE =
    'void main(){\n' +
    'gl_FragColor = vec4(1.0,0.0,0.0,1.0);\n' + //设置颜色
    '}\n';

function main() {
    //获取canvas
    var canvas = document.getElementById('webgl');
    var gl = getWebGLContext(canvas);

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log("初始化shader失败");
        return;
    }

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');

    gl.vertexAttrib3f(a_Position, 0.0, 0.0, 0.0);
    //设置canvas背景色
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    //清空canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    //绘制一个点
    gl.drawArrays(gl.POINTS, 0, 1);
}