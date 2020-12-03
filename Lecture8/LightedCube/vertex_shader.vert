//顶点位置
attribute vec4 a_Position;
//颜色
attribute vec3 a_Color;
varying vec3 v_Color;
//法线
attribute vec3 a_Normal;
//varying vec3 v_Normal;
//变换
uniform mat4 u_MVP_Matrix;

void main() {
	vec3 normal = normalize(a_Normal);
//	normal = (u_MVP_Matrix * vec4(normal, 0.0)).xyz;
//	normal = normalize(normal);
	vec3 lightDir = normalize(vec3(0.5, 0.7, 1.0));
	//	v_Color = vec3(1.0, 1.0, 1.0) * dot(normal, lightDir) * 0.5;
	v_Color = a_Color;
	v_Color = vec3(1.0, 1.0, 1.0);
	v_Color = normal;
	v_Color = vec3(1.0, 1.0, 1.0) * (dot(lightDir, normal)*0.5 + 0.5);
	gl_Position = u_MVP_Matrix * a_Position;

}
