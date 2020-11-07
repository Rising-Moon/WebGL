## html文件
1. 在body中定义canvas
```
<!-- 创建一个canvas -->
<canvas id = "webgl" width = "400" height = "400">
<!-- 不支持canvas时显示的文字 -->
Please use the browser supporting "canvas"
</canvas>
```

2. 引入一些专门为WebGL准备的、定义好的函数库
```
<script src="../../lib/webgl-utils.js"></script>
<script src="../../lib/webgl-debug.js"></script>
<!-- cuon-utils.js这一文件是专门为本书《WebGL编程指南》编写的函数库，主要的函数库为上面两个 -->
<script src="../../lib/cuon-utils.js"></script>
```

3. js文件，用于在<canvas>中绘制图形
```
<!-- src后的相对路径应该由用户自己定义，此处暂时使用TranslatedTriangle -->
<script src="TranslatedTriangle.js"></script>
```

## js文件（指上面的TranslatedTriangle.js文件）

1. 获取<canvas>元素
```
var canvas = document.getElementById('webgl')
```

2. 获取WebGL绘图上下文
```
var gl = getWebGLContext(canvas, true);
// 获取上下文失败判断
if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
}
```

3. 中段代码，执行一些绘制操作和逻辑

4. 结尾处指定清空<canvas>的颜色
```
gl.clearColor(0, 0, 0, 1);
```

5. 清空<canvas>，即清空颜色缓冲区/
```
gl.clear(gl.COLOR_BUFFER_BIT);
```

## 更新中...