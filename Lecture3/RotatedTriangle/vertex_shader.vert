attribute vec4 a_Position;
uniform vec4 u_Translation;
uniform float u_Euler;

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

	mat4 trans3 = mat4(
	0.5, 0.0, 0.0, 0.0,
	0.0, 0.5, 0.0, 0.0,
	0.0, 0.0, 0.5, 0.0,
	0.0, 0.0, 0.0, 1.0);

	mat2 trans4 = mat2(
	cos(radian), sin(radian),
	-sin(radian), cos(radian));

	//	newPos.x = a_Position.x * cos(radian) - a_Position.y * sin(radian);
	//	newPos.y = a_Position.x * sin(radian) + a_Position.y * cos(radian);
	gl_Position.xy = trans4 * a_Position.xy;
	gl_Position.zw = vec2(1.0, 1.0);//设置坐标
}