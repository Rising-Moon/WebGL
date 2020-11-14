precision mediump float;
varying vec4 v_Color;
varying vec4 v_Position;

void main(){
	vec3 lightPos = vec3(1.0, 1.0, 1.0);
	float maxDis = distance(lightPos, vec3(0.0, 0.0, 0.0));
	float dis = 1.0-distance(lightPos, v_Position.xyz) / maxDis;
	gl_FragColor = vec4(dis, dis, dis, 1.0);//设置颜色
}