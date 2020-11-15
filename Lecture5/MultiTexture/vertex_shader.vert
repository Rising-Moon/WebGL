attribute vec4 a_Position;
uniform mat4 u_Translation;
attribute vec2 a_TexCoord;
varying vec2 v_TexCoord;

void main() {
	gl_Position = u_Translation * a_Position;
	v_TexCoord = a_TexCoord;
}
