var VSHADER_SOURCE = null;
var FSHADER_SOURCE = null;
var image = null;

var angle = 0;
var g_last = Date.now();
var deltaTime = 0.0;

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
        console.log("加载图片成功");
        image = img;
        if (checkShaderInit()) {
            tryBegin();
        }
    };
    img.src = "img.png";

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
    var vertexInfo = new Float32Array([
        0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.5, 0.0, 0.0, 1.0,
        0.5, 0.0, 0.0, 1.0, 0.0,
        0.5, 0.5, 0.0, 1.0, 1.0,
        0.5, 0.0, 0.5, 0.0, 0.0,
        0.5, 0.5, 0.5, 0.0, 1.0,
        /*0.0, 0.0, 0.5, 1.0, 0.0,
        0.0, 0.5, 0.5, 1.0, 1.0,
        0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.5, 0.0, 0.0, 1.0,*/]);

    //数组内几个数字代表一个点
    var perCount = 5;
    //点的数量
    var n = vertexInfo.length / perCount;

    //创建缓冲区对象
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log("创建缓冲区buffer失败");
        return -1;
    }

    //将缓冲区对象绑定到目标并写入数据
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexInfo, gl.STATIC_DRAW);

    //数组中每个元素的大小
    var FSIZE = vertexInfo.BYTES_PER_ELEMENT;

    //获取顶点位置变量
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    //将缓冲区对象分配给a_Position变量
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 5, 0);
    //连接a_Position变量与分配给它的缓冲区对象
    gl.enableVertexAttribArray(a_Position);

    //获取顶点位置变量
    var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
    //将缓冲区对象分配给a_Position变量
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 5, FSIZE * 3);
    //连接a_Position变量与分配给它的缓冲区对象
    gl.enableVertexAttribArray(a_TexCoord);

    //设置图片
    setTexture(gl);

    //设置变换动画
    var matrix = new Matrix4();
    matrix.rotate(angle, 1, 1, 1);
    angle += 45 * deltaTime / 1000;
    setUniformMatrix(gl, 'u_Translation', matrix);


    return n;
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