function main() {
    //��ȡ<canvas>Ԫ��
    var canvas = document.getElementById('webgl');

    //��ȡWebgl��ͼ������
    var gl = getWebGLContext(canvas);

    //ָ�������ɫ
    gl.clearColor(0, 0, 0, 1);

    //���
    gl.clear(gl.COLOR_BUFFER_BIT);
}