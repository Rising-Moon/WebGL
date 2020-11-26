//顶点位置
attribute vec4 a_Position;
//变换
uniform mat4 u_ModelViewMatrix;
//投影矩阵
uniform mat4 u_ProjMatrix;
//贴图
attribute vec2 a_TexCoord;
varying vec2 v_TexCoord;

void main() {
	gl_Position = u_ProjMatrix * u_ModelViewMatrix * a_Position;
	v_TexCoord = a_TexCoord;
}
