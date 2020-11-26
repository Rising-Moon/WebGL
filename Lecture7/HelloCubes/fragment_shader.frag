precision mediump float;
uniform sampler2D u_Sampler;
//varying vec2 v_TexCoord;
varying vec3 v_Color;

void main(){
	//	vec4 img1Color = texture2D(u_Sampler, v_TexCoord);
	gl_FragColor = vec4(v_Color, 1.0);//设置颜色
}