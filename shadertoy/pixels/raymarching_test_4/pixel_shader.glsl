//最远视距
float FAR = 100.0;
//最近视距
float NEAR = 5.0;
//最大检测次数
const int MAX_MARCHING_TIMES = 255;
//最小float
float MIN_FLOAT = 0.00001;
//阴影透明度
float SHADOW_ALPHA = 0.0;

//环境光颜色
vec3 ambient = vec3(0.3, 0.3, 0.4);


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
	return distance(pos, vec3(2.0, 0.0, 0.0)) - sphereRadius;
}

//球型的SDF公式
float sphere3Sdf(vec3 pos){
	//圆形半径
	float sphereRadius = 1.0;
	return distance(pos, vec3(-2.0, 0.0, 0.0)) - sphereRadius;
}

//场景的SDF公式
float sceneSdf(vec3 pos){
	float result = min(sphereSdf(pos), sphere2Sdf(pos));
	result = min(result, sphere3Sdf(pos));
	return result;
}

//眼睛到最近表面的最短距离
float rayMarchingDistance(vec3 eye, vec3 direction, float start, float end){
	// 检测的距离
	float depth = start;
	for (int i = 0;i < MAX_MARCHING_TIMES;i++){
		//从眼睛出发的射线
		float dist = sceneSdf(eye + direction * depth);
		if (abs(dist) < MIN_FLOAT){
			return depth;
		}
		depth += dist;
		if (dist >= end){
			return end;
		}
	}
	return end;
}

//射线检测
float rayCast(vec3 startPos, vec3 dir, float length){
	float interval = max(0.01, length / float(MAX_MARCHING_TIMES));
	float depth = interval;
	for (int i = 0;i < MAX_MARCHING_TIMES;i++){
		float dist = sceneSdf(startPos + dir * depth);
		if (dist < 0.0){
			return depth;
		}
		depth += interval;
	}
	return length;
}

//阴影检测
float shadowCast(vec3 startPos, vec3 lightDir, float length){
	float depth = rayCast(startPos, lightDir, length);
	float coefficient = max(SHADOW_ALPHA, step(length, depth));
	return coefficient;
}

//获取从像素出发的所有方向
vec3 getDirectionByPixel(float fov, vec2 size, vec2 fragCoord){
	vec2 xy = fragCoord - size/2.0;
	float z = size.y / tan(radians(fov) / 2.0);
	return normalize(vec3(xy, -z));
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
vec3 addPointLight(vec3 lightPos, vec3 lightColor, float lightIntensity, vec3 modelColor,
vec3 pos, vec3 normal, vec3 viewDir){
	float specularCoefficient = 0.6;

	vec3 lightDir = normalize(lightPos - pos);
	vec3 reflectDir = normalize(reflect(-lightDir, normal));

	float NdotL = dot(normal, lightDir);
	float NdotV = dot(normal, viewDir);
	float VdotR = dot(viewDir, reflectDir);

	vec3 diffuse = modelColor * lightColor * max(0.0, NdotL);
	vec3 specular = specularCoefficient * lightColor * pow(max(0.0, VdotR), 10.0);
	//计算阴影
	float shadow = shadowCast(pos, lightDir, 10.0);

	//光照颜色
	vec3 color = diffuse + specular;
	//光源强度
	color *= 1.0 - distance(lightPos, pos)/lightIntensity;
	//阴影
	color *= shadow;

	return color;
}

//添加方向光
vec3 addDirectionalLight(vec3 lightDir, vec3 lightColor, float lightIntensity, vec3 modelColor,
vec3 pos, vec3 normal, vec3 viewDir){
	//反射系数
	float specularCoefficient = 0.6;

	vec3 reflectDir = normalize(reflect(-lightDir, normal));

	float NdotL = dot(normal, lightDir);
	float NdotV = dot(normal, viewDir);
	float VdotR = dot(viewDir, reflectDir);

	vec3 diffuse = modelColor * lightColor * max(0.0, NdotL);
	vec3 specular = specularCoefficient * lightColor * pow(max(0.0, VdotR), 10.0);
	//计算阴影
	float shadow = shadowCast(pos, lightDir, 10.0);

	//光照颜色
	vec3 color = diffuse + specular;
	//光源强度
	color *= lightIntensity;
	//阴影
	color *= shadow;

	return color;
}

/**
 * Return a transform matrix that will transform a ray from view space
 * to world coordinates, given the eye point, the camera target, and an up vector.
 *
 * This assumes that the center of the camera is aligned with the negative z axis in
 * view space when calculating the ray marching direction. See rayDirection.
 */
mat4 viewMatrix(vec3 eye, vec3 center, vec3 up) {
	// Based on gluLookAt man page
	vec3 f = normalize(center - eye);
	vec3 s = normalize(cross(f, up));
	vec3 u = normalize(cross(s, f));
	return mat4(
	vec4(s, 0.0),
	vec4(u, 0.0),
	vec4(-f, 0.0),
	vec4(0.0, 0.0, 0.0, 1)
	);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
	float iTime = iTime;
	//还原可视坐标
	vec3 dir = getDirectionByPixel(90.0, iResolution.xy, fragCoord);
	vec3 eye = vec3(iMouse.x/iResolution.x * 4.0, iMouse.y/iResolution.y*10.0, 6.0);
	mat4 viewMatrix = viewMatrix(eye, vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0));
	dir = (viewMatrix * vec4(dir, 1.0)).xyz;
	float dist = rayMarchingDistance(eye, dir, NEAR, FAR);
	vec3 pos = eye + dir * dist;

	vec3 normal = estimateNormal(pos);
	vec3 viewDir = normalize(eye);

	vec3 modelColor = vec3(1.0, 1.0, 1.0);
	vec3 bgColor = vec3(0.0, 0.0, 0.1);

	//点光源
	vec3 lights[3];
	lights[0] =vec3 (sin(iTime/2.0)*4.0, sin(iTime)*4.0, cos(iTime)*4.0);
	lights[1] =vec3 (sin(iTime/2.0 + 4.0)*4.0, sin(iTime + 4.0)*4.0, cos(iTime + 4.0)*4.0);
	lights[2] =vec3 (sin(iTime/2.0) * 4.0, 1.0, cos(iTime/2.0) * 4.0);

	vec3 pointLight0 = addPointLight(lights[0], vec3(1.0, 0.0, 1.0),
	6.0, modelColor, pos, normal, viewDir);
	vec3 pointLight1 = addPointLight(lights[1], vec3(1.0, 1.0, 0.0),
	6.0, modelColor, pos, normal, viewDir);
	vec3 pointLight2 = addPointLight(lights[2], vec3(0.0, 1.0, 1.0),
	6.0, modelColor, pos, normal, viewDir);

	//方向光
	vec3 directionalLight0 = addDirectionalLight(normalize(vec3(1.0, 1.0, 1.0)), vec3(1.0, 1.0, 1.0),
	0.3, modelColor, pos, normal, viewDir);


	vec3 color = ambient;
	color += pointLight0;
	color += pointLight1;
	color += pointLight2;
	color += directionalLight0;


	if (dist > FAR - MIN_FLOAT){
		fragColor = vec4(bgColor, 1.0);
		return;
	}
	fragColor = vec4(color, 1.0);
}