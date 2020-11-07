function main() {
    //获取<canvas>元素
    var canvas = document.getElementById('webgl');

    //获取Webgl绘图上下文
    var gl = getWebGLContext(canvas);

    //指定清空颜色
    gl.clearColor(0, 0, 0, 1);

    //清空
    gl.clear(gl.COLOR_BUFFER_BIT);
}