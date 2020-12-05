//最远视距
float FAR = 100.0;
//最近视距
float NEAR = 1.0;
//最大检测次数
const int MAX_MARCHING_TIMES = 200;
//反射检测次数
const int REFLECT_MARCHING_TIMES = 200;
//阴影最远距离
float MAX_SHADOW_DISTANCE = 20.0;
//最小float
float MIN_FLOAT = 0.00001;
//反射系数
float REFLECT_COEFFICIENT = 0.5;


//环境光颜色
vec3 ambient = vec3(0.3, 0.3, 0.4);

//点光源
struct pointLight{
	vec3 pos;
	vec3 color;
	float intensity;
};

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
	return distance(pos, vec3(4.0, 0.0, 0.0)) - sphereRadius;
}

//球型的SDF公式
float sphere3Sdf(vec3 pos){
	//圆形半径
	float sphereRadius = 1.0;
	return distance(pos, vec3(-4.0, 0.0, 0.0)) - sphereRadius;
}

//方形盒的SDF公式
float box1Sdf(vec3 pos){
	pos -= vec3 (0.0, 0.0, 6.0);
	vec3 bound = vec3(2.0, 1.0, 2.0);
	vec3 q = abs(pos) - bound;
	float dist1 = length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
	pos -= vec3(0.0, 0.5, 0.0);
	q = abs(pos) - bound + vec3(0.5, 0.0, 0.5);
	float dist2 = length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
	return max(dist1, -dist2);
}

//方形盒的SDF公式
float boxSdf(vec3 pos){
	pos.y -= 1.0;
	vec3 bound = vec3(15.0, 3.0, 15.0);
	vec3 q = abs(pos) - bound;
	float dist1 = length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
	pos -= vec3(0.0, 1.0, 0.0);
	q = abs(pos) - bound + vec3(1.0, 0.0, 1.0);
	float dist2 = length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
	return max(dist1, -dist2);
}

//场景的SDF公式
float sceneSdf(vec3 pos){
	float result = min(sphereSdf(pos), sphere2Sdf(pos));
	result = min(result, sphere3Sdf(pos));
	result = min(result, boxSdf(pos));
	result = min(result, box1Sdf(pos));

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
	float interval = max(0.01, length / float(REFLECT_MARCHING_TIMES));
	float depth = interval;
	for (int i = 0;i < REFLECT_MARCHING_TIMES;i++){
		float dist = sceneSdf(startPos + dir * depth);
		if (dist < 0.0){
			return depth;
		}
		depth += interval;
	}
	return depth;
}

//阴影检测
float softShadow(vec3 startPos, vec3 lightDir, out float depth){
	depth = rayCast(startPos, lightDir, MAX_SHADOW_DISTANCE);
	float coefficient = smoothstep(0.0, MAX_SHADOW_DISTANCE, depth);
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

/**
 * Return a transform matrix that will transform a ray from view space
 * to world coordinates, given the eye point, the camera target, and an up vector.
 *
 * This assumes that the center of the camera is aligned with the negative z axis in
 * view space when calculating the ray marching direction. See rayDirection.
 */
//视角矩阵
mat3 viewMatrix(vec3 eye, vec3 center, vec3 up) {
	// Based on gluLookAt man page
	vec3 f = normalize(center - eye);
	vec3 s = normalize(cross(f, up));
	vec3 u = normalize(cross(s, f));
	return mat3(s, u, -f);
	//	vec4(s, 0.0),
	//	vec4(u, 0.0),
	//	vec4(-f, 0.0),
	//	vec4(0.0, 0.0, 0.0, 1)
	//	);
}

//添加点光源
vec3 addPointLight(pointLight light, vec3 modelColor, vec3 pos, vec3 normal, vec3 viewDir){
	vec3 lightPos = light.pos;
	vec3 lightColor = light.color;
	float lightIntensity = light.intensity;

	float specularCoefficient = 0.6;

	vec3 lightDir = normalize(lightPos - pos);
	vec3 reflectDir = normalize(reflect(-lightDir, normal));

	float NdotL = dot(normal, lightDir);
	float NdotV = dot(normal, viewDir);
	float VdotR = dot(viewDir, reflectDir);

	vec3 diffuse = modelColor * lightColor * max(0.0, NdotL);
	vec3 specular = specularCoefficient * lightColor * pow(max(0.0, VdotR), 10.0);
	//计算阴影
	float dist;
	float shadow = softShadow(pos, lightDir, dist);
	shadow = smoothstep(0.0, lightIntensity, dist) * shadow;


	//光照颜色
	vec3 color = diffuse + specular;
	//光源强度
	color *= max(0.0, 1.0 - distance(lightPos, pos)/lightIntensity);
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
	float dist;
	float shadow = softShadow(pos, lightDir, dist);

	//光照颜色
	vec3 color = diffuse + specular;
	//光源强度
	color *= lightIntensity;
	//阴影
	color *= shadow;

	return color;
}

//绘制点光源
vec3 drawPointLight(pointLight light, vec3 eye, vec3 dir){
	vec3 lightDir = normalize(light.pos - eye);
	float LdotD = dot(lightDir, dir);
	vec3 color = light.color * step(0.9997, LdotD);
	return color;
}

//获取反射位置
void reflectAll(inout vec3 viewDir, inout vec3 eye, inout vec3 normal, inout vec3 pos, inout float distance){
	vec3 reflectDir = reflect(viewDir, normal);
	float reflectDist = rayMarchingDistance(pos, reflectDir, NEAR, 30.0);
	//	rayCast(pos, reflectDir, distance);
	vec3 reflectPos = pos + reflectDir * reflectDist;
	eye = pos;
	viewDir = reflectDir;
	normal = estimateNormal(reflectPos);
	pos = reflectPos;
	distance = reflectDist;
}

vec4 screenBuffer(vec2 fragCoord, float reflectTimes){
	vec2 mouse = iMouse.xy/iResolution.xy * 2.0 - 1.0;

	float iTime = iTime;
	//还原可视坐标
	vec3 dir = getDirectionByPixel(90.0, iResolution.xy, fragCoord);
	vec3 eye = vec3(cos(radians(mouse.x * 180.0)) * 10.0, 7.0, sin(radians(mouse.x * 180.0)) *10.0);
	eye += eye * mouse.y * 0.7;
	mat3 viewMatrix = viewMatrix(eye, vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0));
	dir = viewMatrix * dir;
	float dist = rayMarchingDistance(eye, dir, NEAR, FAR);
	vec3 pos = eye + dir * dist;
	vec3 normal = estimateNormal(pos);
	vec3 viewDir = dir;

	for (float i = 0.0;i < 2.0;i+=1.0){
		if (i > reflectTimes-MIN_FLOAT){
			break;
		}
		float distance = FAR;
		reflectAll(viewDir, eye, normal, pos, distance);
		dist = distance;
		if (dist > 30.0 - MIN_FLOAT){
			return vec4(0.0, 0.0, 0.0, 0.0);
		}
	}


	vec3 modelColor = vec3(1.0, 1.0, 1.0);
	vec3 bgColor = vec3(0.0, 0.0, 0.1);

	//点光源
	pointLight pointLights[2];
	pointLights[0] = pointLight(vec3 (sin(iTime/2.0 + radians(180.0))*7.0, 3.0, cos(iTime/2.0 + radians(180.0))*7.0), vec3(1.0, 0.0, 0.0), 20.0);
	pointLights[1] = pointLight(vec3 (sin(iTime/2.0) * 7.0, 3.0, cos(iTime/2.0) * 7.0), vec3(0.0, 0.0, 1.0), 20.0);

	vec3 lightColor0 = addPointLight(pointLights[0], modelColor, pos, normal, viewDir);
	vec3 lightColor1 = addPointLight(pointLights[1], modelColor, pos, normal, viewDir);

	//方向光
	//	vec3 directionalLight0 = addDirectionalLight(normalize(vec3(1.0, 1.0, 1.0)), vec3(1.0, 1.0, 1.0), 0.3, modelColor, pos, normal, viewDir);
	//	vec3 directionalLight1 = addDirectionalLight(normalize(vec3(-1.0, 1.0, -1.0)), vec3(1.0, 1.0, 1.0), 0.2, modelColor, pos, normal, viewDir);



	vec3 color = ambient;
	color += lightColor0;
	color += lightColor1;
	//	color += directionalLight0;
	//	color += directionalLight1;

	if (dist > FAR - MIN_FLOAT){
		color = bgColor;
	}

	//绘制虚拟点光源
	vec3 drawLight1 = drawPointLight(pointLights[0], eye, viewDir);
	vec3 drawLight2 = drawPointLight(pointLights[1], eye, viewDir);
	color.xyz += drawLight1;
	color.xyz += drawLight2;

	return vec4(color, 1.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
	vec4 reflect2 = screenBuffer(fragCoord, 2.0);
	vec4 reflect1 = screenBuffer(fragCoord, 1.0);
	reflect1.rgb = mix(reflect1.rgb, reflect2.rgb, reflect2.a * REFLECT_COEFFICIENT*REFLECT_COEFFICIENT);
	vec4 fColor = screenBuffer(fragCoord, 0.0);
	fColor.rgb = mix(fColor.rgb, reflect1.rgb, reflect1.a * REFLECT_COEFFICIENT);

	fragColor = fColor;
}