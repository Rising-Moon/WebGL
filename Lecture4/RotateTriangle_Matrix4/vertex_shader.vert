attribute vec4 a_Position;
uniform vec4 u_Translation;
uniform float u_Euler;
uniform mat4 u_RotateMatrix;
uniform mat4 u_testMatrix;
uniform mat4 u_testMatrixInverse;

void main() {
	//	vec4 newPos = a_Position;
	float radian = radians(u_Euler);
	mat4 trans = mat4(
	cos(radian), sin(radian), 0.0, 0.0,
	-sin(radian), cos(radian), 0.0, 0.0,
	0.0, 0.0, 1.0, 0.0,
	0.0, 0.0, 0.0, 1.0);

	mat4 trans2 = mat4(
	1.0, 0.0, 0.0, 0.0,
	0.0, 1.0, 0.0, 0.0,
	0.0, 0.0, 1.0, 0.0,
	-0.5, 0.3, 0.0, 1.0);

	gl_Position = u_testMatrixInverse * u_RotateMatrix * u_testMatrix * a_Position;
}