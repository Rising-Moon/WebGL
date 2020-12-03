//最远视距
float FAR = 100.0;
//最近视距
float NEAR = 5.0;
//最大检测次数
const int MAX_MARCHING_TIMES = 255;
//最小float
float MIN_FLOAT = 0.00001;
//抗锯齿
float ANTI_ALIASING = 0.2;

//环境光颜色
vec3 ambient = vec3(0.1,0.1,0.2);


//球型的SDF公式
float sphereSdf(vec3 pos){
	//圆形半径
	float sphereRadius = 1.0;
	return length(pos) - sphereRadius;
}

//球型的SDF公式
float sphere2Sdf(vec3 pos){
	//圆形半径
	float sphereRadius = 1.0;
	return distance(pos,vec3(2.0,0.0,0.0)) - sphereRadius;
}

//球型的SDF公式
float sphere3Sdf(vec3 pos){
	//圆形半径
	float sphereRadius = 1.0;
	return distance(pos,vec3(-2.0,0.0,0.0)) - sphereRadius;
}

//场景的SDF公式
float sceneSdf(vec3 pos){
	float result = min(sphereSdf(pos),sphere2Sdf(pos));
	result = min(result,sphere3Sdf(pos));
	return result;
}

//眼睛到目标表面的最短距离
float rayMarchingDistance(vec3 eye,vec3 direction,float start,float end){
	// 检测的距离
	float depth = start;
	for (int i = 0;i < MAX_MARCHING_TIMES;i++){
		//从眼睛出发的射线
		float dist = sceneSdf(eye + direction * depth);
		if(abs(dist) < MIN_FLOAT){
			return depth;
		}
		depth += dist;
		if(dist >= end){
			return end;
		}
	}
	return end;
}

//获取从像素出发的所有方向
vec3 getDirectionByPixel(float fov,vec2 size,vec2 fragCoord){
	vec2 xy = fragCoord - size/2.0;
	float z = size.y / tan(radians(fov) / 2.0);
	return normalize(vec3(xy,-z));
}

//法线
vec3 estimateNormal(vec3 p) {
	return normalize(vec3(
	sceneSdf(vec3(p.x + MIN_FLOAT, p.y, p.z)) - sceneSdf(vec3(p.x - MIN_FLOAT, p.y, p.z)),
	sceneSdf(vec3(p.x, p.y + MIN_FLOAT, p.z)) - sceneSdf(vec3(p.x, p.y - MIN_FLOAT, p.z)),
	sceneSdf(vec3(p.x, p.y, p.z  + MIN_FLOAT)) - sceneSdf(vec3(p.x, p.y, p.z - MIN_FLOAT))
	));
}

//添加点光源
vec3 AddPointLight(vec3 lightPos,vec3 lightColor,float lightIntensity,vec3 modelColor,
vec3 pos,vec3 normal,vec3 viewDir){
	float specularCoefficient = 0.6;

	vec3 lightDir = normalize(lightPos - pos);
	vec3 reflectDir = normalize(reflect(-lightDir,normal));

	float NdotL = dot(normal,lightDir);
	float NdotV = dot(normal,viewDir);
	float VdotR = dot(viewDir,reflectDir);

	vec3 diffuse = modelColor * lightColor * max(0.0,NdotL);
	vec3 specular = specularCoefficient * lightColor * pow(max(0.0,VdotR),10.0);

	vec3 color = ambient + diffuse + specular;
	color *= 1.0 - distance(lightPos,pos)/lightIntensity;
	return color;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	float iTime = iTime * 20.0;
	//还原可视坐标
	vec3 dir = getDirectionByPixel(90.0,iResolution.xy,fragCoord);
	vec3 eye = vec3(0.0,0.0,6.0);
	float dist = rayMarchingDistance(eye,dir,NEAR,FAR);
	vec3 pos = eye + dir * dist;

	vec3 normal = estimateNormal(pos);
	vec3 viewDir = normalize(eye);

	vec3 modelColor = vec3(1.0,1.0,1.0);
	vec3 bgColor = vec3(0.0,0.0,0.1);

	vec3 light1OutColor = AddPointLight(
		vec3 (sin(iTime/2.0)*4.0,sin(iTime)*4.0,cos(iTime)*4.0),
		vec3(0.0,1.0,0.0),
		10.0,
		modelColor,
		pos,
		normal,
		viewDir
	);

	vec3 light2OutColor = AddPointLight(
	vec3 (sin(iTime/2.0 + 4.0)*4.0,sin(iTime + 4.0)*4.0,cos(iTime + 4.0)*4.0),
	vec3(1.0,0.0,0.0),
	10.0,
	modelColor,
	pos,
	normal,
	viewDir
	);

	vec3 light3OutColor = AddPointLight(
	vec3 (sin(iTime/2.0 + 8.0)*4.0,sin(iTime + 8.0)*4.0,cos(iTime + 8.0)*4.0),
	vec3(0.0,0.0,1.0),
	10.0,
	modelColor,
	pos,
	normal,
	viewDir
	);


	vec3 color = light1OutColor + light2OutColor + light3OutColor;


	if(dist > FAR - MIN_FLOAT){
		fragColor = vec4(bgColor,1.0);
		return;
	}
	float antiAliasing = min(dot(normal,viewDir)/ANTI_ALIASING,1.0);
	color = mix(bgColor,color,antiAliasing);
	fragColor = vec4(color,1.0);
}