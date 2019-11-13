function main(){
    var canvas = document.getElementById("example");
    if(!canvas){
        console.log('Faild to get a canvas');
        return false;
    }
    
    var ctx = canvas.getContext('2d');
    
    ctx.fillStyle = 'rgb(0,252,255)';
    ctx.fillRect(120,10,150,150);
}