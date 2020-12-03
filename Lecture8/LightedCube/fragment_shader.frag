precision mediump float;
uniform sampler2D u_Sampler;
//颜色
varying vec3 v_Color;
//法线
//varying vec3 v_Normal;

void main(){
	vec3 color = v_Color;
	//	color = color * lightColor * (dot(lightDir, v_Normal)*0.5 + 0.5);

	gl_FragColor = vec4(color, 1.0);//设置颜色
}