attribute vec4 a_Position;

void main() {
    gl_Position = a_Position;//设置坐标
    gl_PointSize = 10.0;//设置尺寸
}