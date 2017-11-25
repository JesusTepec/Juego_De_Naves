
var canvas = document.getElementById("Canvas");
var ctx = canvas.getContext("2d");
var width = canvas.width;
var height = canvas.height;


var recursos = [{id: 'nave', src: 'images/playerShip1_red.png'}, {id: 'enemigo', src: 'images/shipGreen_manned.png'}];
var imagenNave, imagenEnemigo;

function dibujarMarco() {
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 4;
  ctx.rect(0, 0, width, height);
  ctx.stroke();
}

function dibujarNave() {
  ctx.drawImage(imagenNave, 40, 400, 50, 50);
}

function dibujarEnemigos() {

}

function dibujarPreCargador(e) {
  var div = width / recursos.length;
  var longitud = parseInt(e.loaded) * div;
  ctx.fillStyle = "red";
  ctx.rect(10, 40, longitud, 10);
  ctx.fill();
}

function cargarRecursos() {
  preloader = new createjs.LoadQueue();
	preloader.addEventListener("progress", dibujarPreCargador);
	preloader.loadManifest(recursos);
	preloader.on("complete", iniciar, this);
}

function iniciar() {
  if(preloader.progress == 1){
    imagenNave = preloader.getResult("nave");
    imagenEnemigo = preloader.getResult("enemigo");
    gameLoop();
  }
}

function gameLoop() {
  dibujarNave();
}

window.addEventListener('load', cargarRecursos);
