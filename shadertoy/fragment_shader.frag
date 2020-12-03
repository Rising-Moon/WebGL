precision mediump float;

uniform float iTime;
uniform float iTimeDelta;
uniform int iFrame;
uniform vec2 iResolution;
uniform vec4 iMouse;

/*{pixel}*/

void main(){
	vec4 fragColor;
	mainImage(fragColor, gl_FragCoord.xy);

	gl_FragColor = fragColor;//设置颜色
}