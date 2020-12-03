attribute vec4 a_Position;//顶点位置
attribute vec3 a_Color;//顶点颜色
attribute vec3 a_Normal;//法线方向

uniform mat4 u_MVP_Matrix;// MVP矩阵
uniform vec3 u_LightColor;// 光线颜色
uniform vec3 u_LightDir;//光线方向(归一化)

varying vec3 v_Color;//传递颜色到片元着色器

void main() {
	vec3 normal = normalize(a_Normal);
	vec3 lightDir = normalize(u_LightDir);

	float NdotL = dot(normal, lightDir);
	v_Color = a_Color * u_LightColor * max(NdotL, 0.0);
	gl_Position = u_MVP_Matrix * a_Position;

}
