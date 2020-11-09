attribute vec4 a_Position;
uniform vec4 u_Translation;
uniform float u_Euler;

void main() {
	vec4 newPos = a_Position;
	float radian = radians(u_Euler);
	newPos.x = a_Position.x * cos(radian) - a_Position.y * sin(radian);
	newPos.y = a_Position.x * sin(radian) + a_Position.y * cos(radian);
	gl_Position = newPos + u_Translation;//设置坐标
}