var VSHADER_SOUCE =
    'attribute vec4 a_Position;\n' +
    'uniform vec4 u_Translation;\n' +
    'void main() {\n' +
    '   gl_Position = a_Position + u_Translation;\n' +
    '}\n';

var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'uniform vec4 u_FragColor;\n' +
    'void main(){\n' +
    '   gl_FragColor = u_FragColor;\n' +
    '}\n';

var g_points = [];
var g_colors = [];

var tranlation = new Float32Array([0.0, 0.0, 0.0, 0.0]);

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
    var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    var u_Translation = gl.getUniformLocation(gl.program, 'u_Translation');

    if (a_Position < 0) {
        console.log("获取a_Position失败");
        return;
    }
    //初始化定点缓冲区
    var n = initVertexBuffers(gl, a_Position);

    if (n < 0) {
        console.log("设置顶点位置失败");
    }

    document.onkeydown = function (ev) {
        if (ev.code === "KeyW") {
            tranlation[1] = 0.5;
            console.log("上");
        } else if (ev.code === "KeyS") {
            tranlation[1] = -0.5;
        } else if (ev.code === "KeyA") {
            tranlation[0] = -0.5;
        } else if (ev.code === "KeyD") {
            tranlation[0] = 0.5;
        }
        
        gl.uniform4fv(u_Translation, tranlation);
        drawTriangle(gl, n)
    };

    gl.uniform4fv(u_Translation, tranlation);

    if (!u_FragColor) {
        console.log("获取u_FragColor失败");
        return;
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    drawTriangle(gl, n);
}

function drawTriangle(gl, n) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl, a_Position) {
    var vertices = new Float32Array([0.0, 0.5, -0.5, -0.5, 0.5, -0.5]);
    var n = vertices.length / 2;

    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log("创建缓冲区失败");
        return -1;
    }

    //将缓冲区绑定到目标
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    //向缓冲区对象中写入数据
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    //将缓冲区对象分配给a_Position变量
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    //链接a_Position变量与分配给它的缓冲区对象
    gl.enableVertexAttribArray(a_Position);

    return n;
}