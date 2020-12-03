precision mediump float;
uniform sampler2D u_Sampler;
//颜色
varying vec3 v_Color;

void main(){
	vec3 color = v_Color;
	gl_FragColor = vec4(color, 1.0);//设置颜色
}