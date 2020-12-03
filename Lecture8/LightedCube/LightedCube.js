var VSHADER_SOURCE = null;
var FSHADER_SOURCE = null;
var image = null;

//旋转角度
var angle = 0;
//当前时间(ms)
var g_time = Date.now();
//每帧间隔(ms)
var g_deltaTime = 0.0;
//鼠标偏移
var g_mouseOffsetX = 0;
var g_mouseOffsetY = 0;

//鼠标是否按下
var g_mouseDown = false;

function main() {
    //加载顶点着色器
    loadFile("vertex_shader.vert", function (text) {
        VSHADER_SOURCE = text;
        if (checkShaderInit()) {
            tryBegin();
        }
    });

    //加载片元着色器
    loadFile("fragment_shader.frag", function (text) {
        FSHADER_SOURCE = text;
        if (checkShaderInit()) {
            tryBegin();
        }
    });

    //加载图片
    var img = new Image();
    img.onload = function () {
        image = img;
        if (checkShaderInit()) {
            tryBegin();
        }
    };
    img.src = "img.png";

    document.onmousemove = function (event) {
        g_mouseOffsetX = event.movementX
        g_mouseOffsetY = event.movementY
    }

    document.onmousedown = function () {
        g_mouseDown = true;
    }

    document.onmouseup = function () {
        g_mouseDown = false;
    }

    document.onmouseleave = function () {
        g_mouseDown = false;
    }
}

/**
 * 开始进行绘制
 */
function tryBegin() {
    //获取canvas
    var canvas = document.getElementById('webgl');
    var gl = getWebGLContext(canvas, true);

    //初始化着色器，将着色器代码传入着色器程序
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log("初始化shader失败");
        return;
    }

    //设置canvas背景色
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    //允许深度测试
    gl.enable(gl.DEPTH_TEST);
    //允许多边形偏移
    gl.enable(gl.POLYGON_OFFSET_FILL);
    //设置多边形偏移量
    gl.polygonOffset(1.0, 1.0);

    draw(gl);
}

/**
 * 绘制
 * @param gl
 */
function draw(gl) {
    /**
     *      v1
     *     /  \\
     *    /    \  \
     *   v2————v3——v4
     *   front: 1,2,3
     *   left: 1,3,4
     *   right:1,4,2
     *   bottom:4,3,2
     */

        //计算全局数据
    var now = Date.now();
    g_deltaTime = now - g_time;
    g_time = now;
    var vertices = new Float32Array([   // Coordinates
        1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, // v0-v1-v2-v3 front
        1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, // v0-v3-v4-v5 right
        1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
        -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, // v1-v6-v7-v2 left
        -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, // v7-v4-v3-v2 down
        1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0  // v4-v7-v6-v5 back
    ]);


    var colors = new Float32Array([    // Colors
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // v0-v1-v2-v3 front
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // v0-v3-v4-v5 right
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // v0-v5-v6-v1 up
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // v1-v6-v7-v2 left
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // v7-v4-v3-v2 down
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0　    // v4-v7-v6-v5 back
    ]);


    var normals = new Float32Array([    // Normal
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
        0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,  // v7-v4-v3-v2 down
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0   // v4-v7-v6-v5 back
    ]);


    // Indices of the vertices
    var indices = new Uint8Array([
        0, 1, 2, 0, 2, 3,    // front
        4, 5, 6, 4, 6, 7,    // right
        8, 9, 10, 8, 10, 11,    // up
        12, 13, 14, 12, 14, 15,    // left
        16, 17, 18, 16, 18, 19,    // down
        20, 21, 22, 20, 22, 23     // back
    ]);

    initArrayBuffer(gl, "a_Position", vertices, 3);
    initArrayBuffer(gl, "a_Color", colors, 3);
    initArrayBuffer(gl, "a_Normal", normals, 3);

    //数组内几个数字代表一个点
    // var perCount = 6;
    //点的数量
    // var n = vertexInfo.length / perCount;
    //由索引来决定顶顶点数量
    var n = indices.length;
    if (n === -1) {
        console.log("初始化顶点buffer失败");
        return;
    }

    //顶点索引缓冲区
    var indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
        console.log("创建缓冲区buffer失败");
        return -1;
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    //设置图片
    // setTexture(gl);

    //设置模型矩阵
    var modelMatrix = new Matrix4();
    //鼠标拖拽旋转
    if (g_mouseDown)
        angle += g_mouseOffsetX;
    // angle += 45 * g_deltaTime / 1000;
    modelMatrix.rotate(angle, 0, 1, 0);
    // modelMatrix.translate(0, 0, 0);

    //创建视点矩阵
    var viewMatrix = new Matrix4();
    viewMatrix.setLookAt(0, 3, 10, 0, 0, 0, 0, 1, 0);

    //投影矩阵
    var projMatrix = new Matrix4();
    // projMatrix.setOrtho(-1, 1, -1, 1, 0, 2) //正交投影
    projMatrix.setPerspective(30, 1, 1, 100) //透视投影

    //创建MVP矩阵
    var mvpMatrix = projMatrix.multiply(viewMatrix.multiply(modelMatrix));
    setUniformMatrix(gl, 'u_MVP_Matrix', mvpMatrix);

    //清空缓冲区
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //绘制
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
    // gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
    // 定时刷新
    requestAnimationFrame(function () {
        draw(gl);
    });
}

/**
 * 将array数据绑定到着色器变量中
 * @param gl
 * @param name
 * @param array
 * @param countOfPerPoint
 */
function initArrayBuffer(gl, name, array, countOfPerPoint) {
    //顶点信息缓冲区
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) console.log("创建缓冲区buffer失败");

    //将缓冲区对象绑定到目标并写入数据
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);

    //数组中每个元素的大小
    // var FSIZE = vertexInfo.BYTES_PER_ELEMENT;

    //获取顶点位置变量
    var a_Array = gl.getAttribLocation(gl.program, name);
    //将缓冲区对象分配给a_Position变量
    gl.vertexAttribPointer(a_Array, countOfPerPoint, gl.FLOAT, false, 0, 0);
    //连接a_Position变量与分配给它的缓冲区对象
    gl.enableVertexAttribArray(a_Array);
}

function setTexture(gl) {
    //创建纹理对象
    var texture = gl.createTexture();
    //获取u_Sampler存储位置
    var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
    //对图像纹理进行y轴翻转
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    //开启0号纹理单元
    gl.activeTexture(gl.TEXTURE0);
    //向target绑定纹理对象
    gl.bindTexture(gl.TEXTURE_2D, texture);
    //配置纹理参数
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    //配置纹理图像
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    //将0号纹理传递给着色器
    gl.uniform1i(u_Sampler, 0);
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
    return VSHADER_SOURCE != null && FSHADER_SOURCE != null && image != null;
}