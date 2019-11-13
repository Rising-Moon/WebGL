function main() {
    var canvas = document.getElementById("webgl");
    if (!canvas) {
        return false;
    }
    var gl = getWebGLContext(canvas);
    if (!gl) {
        return null;
    }
    gl.clearColor(1, 0.0, 0.0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
}