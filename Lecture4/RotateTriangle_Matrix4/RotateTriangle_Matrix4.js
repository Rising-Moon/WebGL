var VSHADER_SOURCE = null;

var FSHADER_SOURCE = null;
var angle = 0;
var g_last = Date.now();
var deltaTime = 0.0;

function main() {
    //加载顶点着色器
    loadFile("vertex_shader.vert", function (text) {
        VSHADER_SOURCE = text;
        if (checkShaderInit()) {
            begin();
        }
    });

    //加载片元着色器
    loadFile("fragment_shader.frag", function (text) {
        FSHADER_SOURCE = text;
        if (checkShaderInit()) {
            begin();
        }
    });

}

/**
 * 开始进行绘制
 */
function begin() {
    //获取canvas
    var canvas = document.getElementById('webgl');
    var gl = getWebGLContext(canvas);

    //初始化着色器，将着色器代码传入着色器程序
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log("初始化shader失败");
        return;
    }

    //设置canvas背景色
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    draw(gl);
}

/**
 * 绘制
 * @param gl
 */
function draw(gl) {
    var now = Date.now();
    deltaTime = now - g_last;
    g_last = now;
    var n = initVertexBuffer(gl);
    if (n === -1) {
        console.log("初始化顶点buffer失败");
        return;
    }
    //清空canvas
    gl.clear(gl.COLOR_BUFFER_BIT);
    //绘制一个点
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
    //定时刷新
    requestAnimationFrame(function () {
        draw(gl);
    });
}

/**
 * 写入顶点到buffer
 * @param gl
 * @returns {number} 顶点数量
 */
function initVertexBuffer(gl) {
    //顶点位置
    var vertices = new Float32Array([
        0.0, 0.0, 0.0,
        0.0, 0.5, 0.0,
        0.5, 0.0, 0.0,
        0.5, 0.5, 0.0,
        0.5, 0.0, 0.5,
        0.5, 0.5, 0.5]);
    //数组内几个数字代表一个点
    var perCount = 3;
    //点的数量
    var n = vertices.length / perCount;

    //创建缓冲区对象
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log("创建缓冲区buffer失败");
        return -1;
    }

    //将缓冲区对象绑定到目标
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    //向缓冲区写入数据
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    //获取顶点变化变量
    var u_Translation = gl.getUniformLocation(gl.program, 'u_Translation');
    //赋值顶点移动
    gl.uniform4f(u_Translation, 0.0, 0.0, 0.0, 0.0);

    //获取片元颜色变量
    var u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
    //赋值片元颜色
    gl.uniform4f(u_FragColor, 0.3, 0.3, 0.3, 1.0);

    //获取旋转角度变量
    var u_Euler = gl.getUniformLocation(gl.program, 'u_Euler');
    //设置旋转角度
    gl.uniform1f(u_Euler, 0);

    //获取顶点位置变量
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    //将缓冲区对象分配给a_Position变量
    gl.vertexAttribPointer(a_Position, perCount, gl.FLOAT, false, 0, 0);

    //设置变换矩阵
    var matrix = new Matrix4();
    matrix.rotate(angle, 1, 1, 1);
    angle += 90 * deltaTime / 1000;
    setUniformMatrix(gl, 'u_RotateMatrix', matrix);

    //设置变基矩阵
    var testMatrix = new Matrix4();
    testMatrix.elements = new Float32Array([
        0, 1, 0, 0,
        -1, 0, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ])
    setUniformMatrix(gl, "u_testMatrix", testMatrix);

    //设置逆变基矩阵
    var testInvertMatrix = new Matrix4(testMatrix);
    testInvertMatrix = testInvertMatrix.invert();
    setUniformMatrix(gl, "u_testMatrixInverse", testInvertMatrix);

    //连接a_Position变量与分配给它的缓冲区对象
    gl.enableVertexAttribArray(a_Position);

    return n;
}

/**
 * 为gl设置matrix
 * @param gl
 * @param name
 * @param matrix
 */
function setUniformMatrix(gl, name, matrix) {
    var target = gl.getUniformLocation(gl.program, name);
    gl.uniformMatrix4fv(target, false, matrix.elements);
}

/**
 * @param {string} filePath 文件路径
 * @param {function} callBack 完成回调
 */
function loadFile(filePath, callBack) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status !== 404) {
            if (callBack != null) {
                callBack(request.responseText);
            }
        }
    }
    request.open("GET", filePath, true);
    request.send();
}

/**
 * 判断shader是否初始化完成
 * @returns {boolean}
 */
function checkShaderInit() {
    return VSHADER_SOURCE != null && FSHADER_SOURCE != null;
}