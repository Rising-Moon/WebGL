#define iResolution gl_FragCoord.xyz
precision mediump float;
varying vec2 v_Frag;//像素位置

uniform float iTime;
uniform float iTimeDelta;
uniform int iFrame;

/*{pixel}*/

void main(){
	vec4 fragColor;
	mainImage(fragColor, v_Frag);

	gl_FragColor = fragColor;//设置颜色
}