precision mediump float;
uniform sampler2D u_Sampler;
varying vec2 v_TexCoord;

void main(){
	vec4 img1Color = texture2D(u_Sampler, v_TexCoord);
	gl_FragColor = vec4(0.0, img1Color.g, 0.0, 1.0);//设置颜色
}