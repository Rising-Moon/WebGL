//最远视距
float FAR = 100.0;
//最近视距
float NEAR = 1.0;
//最大检测次数
const int MAX_MARCHING_TIMES = 255;
//反射检测次数
const int REFLECT_MARCHING_TIMES = 80;
//阴影最远距离
float MAX_SHADOW_DISTANCE =20.0;
//最小float
const float MIN_FLOAT = 0.00001;
//反射系数
float REFLECT_COEFFICIENT = 0.3;
//反射次数
const float REFLECT_TIMES = 2.0;

//物体间距
float spacing = 5.0;
//环境光颜色
vec3 ambient = vec3(0.3, 0.3, 0.4);
//视角位置
vec3 eyePos = vec3(10.0, 5.0, 0.0);
//摄像机速度
float cameraSpeed = 10.0;

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

//甜甜圈SDF公式
float sdTorus(vec3 p)
{
    p -= vec3(-spacing, 1.0, -spacing);
    vec2 t = vec2(1.0, 1.0);
    vec2 q = vec2(length(p.xz)-t.x, p.y);
    return length(q)-t.y;
}

//菱形的SDF公式
float sdOctahedron(vec3 p)
{
    p -= vec3(spacing, 0.0, spacing);
    p = abs(p);
    float s = 1.0;
    float m = p.x+p.y+p.z-s;
    vec3 q;
    if (3.0*p.x < m) q = p.xyz;
    else if (3.0*p.y < m) q = p.yzx;
    else if (3.0*p.z < m) q = p.zxy;
    else return m*0.57735027;

    float k = clamp(0.5*(q.z-q.y+s), 0.0, s);
    return length(vec3(q.x, q.y-s+k, q.z-k));
}

//方形盒的SDF公式
float box1Sdf(vec3 pos){
    pos -= vec3 (spacing, 0.0, -spacing);
    vec3 bound = vec3(1.0, 1.0, 1.0);
    vec3 q = abs(pos) - bound;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
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

//圆锥SDF公式
float sdCone(vec3 p)
{
    p-=vec3(-spacing, 1.0, spacing);
    // c is the sin/cos of the angle, h is height
    // Alternatively pass q instead of (c,h),
    // which is the point at the base in 2D
    float radians = radians(30.0);
    vec2 c = vec2(sin(radians), cos(radians));
    float h = 2.0;
    vec2 q = h*vec2(c.x/c.y, -1.0);

    vec2 w = vec2(length(p.xz), p.y);
    vec2 a = w - q*clamp(dot(w, q)/dot(q, q), 0.0, 1.0);
    vec2 b = w - q*vec2(clamp(w.x/q.x, 0.0, 1.0), 1.0);
    float k = sign(q.y);
    float d = min(dot(a, a), dot(b, b));
    float s = max(k*(w.x*q.y-w.y*q.x), k*(w.y-q.y));
    return sqrt(d)*sign(s);
}

//场景的SDF公式
float sceneSdf(vec3 pos){
    float result = min(sphereSdf(pos), sdTorus(pos));
    result = min(result, sdOctahedron(pos));
    result = min(result, boxSdf(pos));
    result = min(result, box1Sdf(pos));
    result = min(result, sdCone(pos));

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
    //还原可视坐标
    vec3 dir = getDirectionByPixel(90.0, iResolution.xy, fragCoord);
    vec3 eye = eyePos;
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
        float distance = 30.0/i;
        reflectAll(viewDir, eye, normal, pos, distance);
        dist = distance;
        if (dist > 30.0 - MIN_FLOAT){
            return vec4(0.0, 0.0, 0.0, 0.0);
        }
    }


    vec3 modelColor = vec3(1.0, 1.0, 1.0);
    vec3 bgColor = vec3(0.0, 0.0, 0.1);

    //点光源
    pointLight pointLights[3];
    pointLights[0] = pointLight(vec3 (sin(iTime/2.0 + radians(120.0))*7.0, 3.0, cos(iTime/2.0 + radians(120.0))*7.0), vec3(1.0, 0.0, 0.0), 20.0);
    pointLights[1] = pointLight(vec3 (sin(iTime/2.0 + radians(240.0)) * 7.0, 3.0, cos(iTime/2.0 + radians(240.0)) * 7.0), vec3(0.0, 0.0, 1.0), 20.0);
    pointLights[2] = pointLight(vec3 (sin(iTime/2.0) * 7.0, 3.0, cos(iTime/2.0) * 7.0), vec3(0.0, 1.0, 0.0), 20.0);

    vec3 lightColor0 = addPointLight(pointLights[0], modelColor, pos, normal, viewDir);
    vec3 lightColor1 = addPointLight(pointLights[1], modelColor, pos, normal, viewDir);
    vec3 lightColor2 = addPointLight(pointLights[2], modelColor, pos, normal, viewDir);

    //方向光
    //    vec3 directionalLight0 = addDirectionalLight(normalize(vec3(1.0, 1.0, 1.0)), vec3(1.0, 1.0, 1.0), 0.3, modelColor, pos, normal, viewDir);
    //	vec3 directionalLight1 = addDirectionalLight(normalize(vec3(-1.0, 1.0, -1.0)), vec3(1.0, 1.0, 1.0), 0.2, modelColor, pos, normal, viewDir);



    vec3 color = ambient;
    color += lightColor0;
    color += lightColor1;
    color += lightColor2;
    //    color += directionalLight0;
    //	color += directionalLight1;

    if (dist > FAR - MIN_FLOAT){
        color = bgColor;
    }

    //绘制虚拟点光源
    vec3 drawLight1 = drawPointLight(pointLights[0], eye, viewDir);
    vec3 drawLight2 = drawPointLight(pointLights[1], eye, viewDir);
    vec3 drawLight3 = drawPointLight(pointLights[2], eye, viewDir);
    color.xyz += drawLight1;
    color.xyz += drawLight2;
    color.xyz += drawLight3;

    return vec4(color, 1.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 mouse = iMouse.xy/iResolution.xy * 2.0 - 1.0;
    eyePos = vec3(cos(radians(mouse.x * 180.0 + iTime * cameraSpeed)) * 10.0, 5.0, sin(radians(mouse.x * 180.0 + iTime * cameraSpeed)) *10.0);
    eyePos += eyePos * mouse.y * 0.7;
    vec4 fColor = vec4(0.0, 0.0, 0.0, 1.0);
    for (float i = 0.0;i < REFLECT_TIMES;i += 1.0-MIN_FLOAT){
        vec4 color = screenBuffer(fragCoord, i);
        fColor.rgb = mix(fColor.rgb, color.rgb, color.a * pow(REFLECT_COEFFICIENT, i));
    }

    fragColor = fColor;
}