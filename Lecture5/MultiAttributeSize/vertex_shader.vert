attribute vec4 a_Position;
attribute float a_PointSize;
uniform mat4 u_Translation;

void main() {
	gl_Position = u_Translation * a_Position;
	gl_PointSize = a_PointSize;
}
