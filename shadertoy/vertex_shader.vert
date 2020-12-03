attribute vec4 a_Position;//顶点位置
attribute vec2 a_Frag;//像素位置

varying vec2 v_Frag;//像素位置

void main() {
	v_Frag = a_Frag;
	gl_Position = a_Position;
}
