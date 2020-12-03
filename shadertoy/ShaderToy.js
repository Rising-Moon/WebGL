var VSHADER_SOURCE = null;
var FSHADER_SOURCE = null;
var PIXEL_SHADER = null;

//当前时间(ms)
var g_startTime = 0;
var g_time = 0;
//每帧间隔(ms)
var g_deltaTime = 0.0;
//帧
var g_frame = 0;

//鼠标坐标
var g_mouseDown = false;
var g_mouseX = 0.0;
var g_mouseY = 0.0;
var g_clickX = 0.0;
var g_clickY = 0.0;

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

    //加载像素着色器
    loadFile("pixel_shader.glsl", function (text) {
        PIXEL_SHADER = text;
        if (checkShaderInit()) {
            begin();
        }
    });
}

/**
 * 判断是否达成可以开始渲染的条件
 * @returns {boolean}
 */
function checkShaderInit() {
    return VSHADER_SOURCE != null && FSHADER_SOURCE != null && PIXEL_SHADER != null;
}

/**
 * 开始绘制
 */
function begin() {
    //记录开始时间
    g_startTime = Date.now()/1000.0;

    //获取canvas
    var canvas = document.getElementById('webgl');
    var gl = getWebGLContext(canvas, true);

    //鼠标按下状态
    document.onmousedown = function (ev) {
        g_mouseDown = true;
    }
    document.onmouseup = function (ev){
        g_mouseDown = false;
    }
    document.onmousemove = function (ev){
        if(!g_mouseDown)
            return;
        var x = ev.clientX; //鼠标点击处的x坐标
        var y = ev.clientY; //鼠标点击处的y坐标
        var rect = ev.target.getBoundingClientRect();
        g_mouseX = x - rect.left;
        g_mouseY = canvas.height - y + rect.top;
    }

    document.onclick = function (ev){
        var x = ev.clientX; //鼠标点击处的x坐标
        var y = ev.clientY; //鼠标点击处的y坐标
        var rect = ev.target.getBoundingClientRect();
        g_clickX = x - rect.left;
        g_clickY = canvas.height - y + rect.top;
    }

    FSHADER_SOURCE = FSHADER_SOURCE.replace("/*{pixel}*/", PIXEL_SHADER);

    //初始化着色器，将着色器代码传入着色器程序
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log("初始化shader失败");
        return;
    }

    //设置canvas背景色
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    draw(gl,canvas);
}

/**
 * 绘制
 * @param gl
 */
function draw(gl,canvas) {
    //region 计算全局数据
    var now = Date.now()/1000.0 - g_startTime;
    g_deltaTime = (now - g_time)/1000.0;
    g_time = now;
    //endregion

    var vertices = new Float32Array([   // Coordinates
        1.0, 1.0, 0.0,
        -1.0, 1.0, 0.0,
        -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0 // v0-v1-v2-v3 front
    ]);
    // Indices of the vertices
    var indices = new Uint8Array([
        0, 1, 2, 0, 2, 3    // front
    ]);

    initArrayBuffer(gl, "a_Position", vertices, 3);

    //传入变量
    var iTime = gl.getUniformLocation(gl.program, "iTime");
    gl.uniform1f(iTime, g_time);
    var iTimeDelta = gl.getUniformLocation(gl.program, "iTimeDelta");
    gl.uniform1f(iTimeDelta, g_deltaTime);
    var iFrame = gl.getUniformLocation(gl.program, "iFrame");
    gl.uniform1i(iFrame, g_frame);
    var iResolution = gl.getUniformLocation(gl.program,"iResolution");
    gl.uniform2f(iResolution,canvas.width,canvas.height);
    var iMouse = gl.getUniformLocation(gl.program,"iMouse");
    gl.uniform4f(iMouse,g_mouseX,g_mouseY,g_clickX,g_clickY);

    //由索引来决定顶顶点数量
    var n = indices.length;

    //region 输入顶点信息
    //顶点索引缓冲区
    var indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
        console.log("创建缓冲区buffer失败");
        return -1;
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    //endregion

    //清空缓冲区
    gl.clear(gl.COLOR_BUFFER_BIT);
    //绘制
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
    // 定时刷新
    requestAnimationFrame(function () {
        g_frame++;
        draw(gl,canvas);
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
    //缓冲区
    var buffer = gl.createBuffer();
    if (!buffer) console.log("创建缓冲区buffer失败");

    //将缓冲区对象绑定到目标并写入数据
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);

    //获取顶点位置变量
    var a_Array = gl.getAttribLocation(gl.program, name);
    if (a_Array === -1) {
        console.log("获取attribute变量失败");
        return;
    }
    //将缓冲区对象分配给a_Position变量
    gl.vertexAttribPointer(a_Array, countOfPerPoint, gl.FLOAT, false, 0, 0);
    //连接a_Position变量与分配给它的缓冲区对象
    gl.enableVertexAttribArray(a_Array);
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