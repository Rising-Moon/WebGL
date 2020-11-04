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

    //注册点击事件
    canvas.onmousedown = function (event) {
        click(event, gl, canvas, a_Position);
    }
    //设置canvas背景色
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    //清空canvas
    gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_points = [];//鼠标点击位置数组

function click(ev, gl, canvas, a_Position) {
    var x = ev.clientX; //鼠标点击处的x坐标
    var y = ev.clientY; //鼠标点击处的y坐标

    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.height / 2) / (canvas.height / 2);
    y = (canvas.width / 2 - (y - rect.top)) / (canvas.width / 2);

    g_points.push(x);
    g_points.push(y);

    console.log(x+","+y);

    gl.clear(gl.COLOR_BUFFER_BIT);
    var len = g_points.length;

    for (var i = 0; i < len; i += 2) {
        gl.vertexAttrib2f(a_Position, g_points[i], g_points[i + 1]);
        gl.drawArrays(gl.POINTS, 0, 1);
    }
}