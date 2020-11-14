attribute vec4 a_Position;
attribute vec4 a_Color;
uniform mat4 u_Translation;
varying vec4 v_Color;
varying vec4 v_Position;

void main() {
	gl_Position = u_Translation * a_Position;
	v_Color = a_Color;
	v_Position = gl_Position;
}
