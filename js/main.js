var canvas = document.getElementById("Canvas");
var ctx = canvas.getContext('2d');
var fondo;
var Juego = {estado:"INICIANDO"};
var Nave = {x: 50, y: canvas.height - 100, ancho: 50, alto: 50}
var Teclado = {};
var Enemigos = [];
var Disparos = [];

function loadMedia(){
	fondo = new Image();
	fondo.src = "images/nebulosa.jpg";
	fondo.onload = function(){
		var iterval = window.setInterval(frameLoop, 1000/55);
	}
}

function agregarEventosTeclado(){
	agregarEvento(document, "keydown", function(e){
		Teclado[e.keyCode] = true;
	});
	agregarEvento(document, "keyup", function(e){
		Teclado[e.keyCode] = false;
	});

	function agregarEvento(elemento, evento, funcion){
		if(elemento.addEventListener){
			elemento.addEventListener(evento, funcion, false);
		}else if (elemento.attachEvent){
			elemento.attachEvent(evento, funcion);
		}
	}
}

function moverNave(){
	if(Teclado[37] && Nave.x > 0){
		Nave.x -= 10;
	}
	if(Teclado[39] && Nave.x < canvas.width - Nave.ancho){
		Nave.x += 10;
	}
	if(Teclado[32]){
		if(!Teclado.fire){
			agregarDisparo();
			Teclado.fire = true;
		}
	}else{
		Teclado.fire = false;
	}
}

function moverDisparos(){
	for(var i in Disparos){
		var disparo = Disparos[i];
		disparo.y -= 2;
	}
	Disparos = Disparos.filter(function(disparo){
		return disparo.y > 0;
	});
}

function dibujaFondo(){
	ctx.drawImage(fondo, 0, 0);
}

function dibujaNave(){
	ctx.save();
	ctx.fillStyle = 'white';
	ctx.fillRect(Nave.x, Nave.y, Nave.ancho, Nave.alto);
	ctx.restore();
}

function dibujarDisparos(){
	ctx.save();
	ctx.fillStyle = "red";
	for(var i in Disparos){
		var disparo = Disparos[i];
		ctx.fillRect(disparo.x, disparo.y, disparo.width, disparo.height);
	}
	ctx.restore();
}

function dibujarEnemigos(){
	for(var i in Enemigos){
		var enemigo = Enemigos[i];
		ctx.save();
		if(enemigo.estado == "VIVO"){
			ctx.fillStyle = "green";
		}
		if(enemigo.estado == "MUERTO"){
			ctx.fillStyle = "black";
		}
		if(enemigo.estado == "DISPARADO"){
			ctx.fillStyle = "red";
		}
		ctx.fillRect(enemigo.x, enemigo.y, enemigo.width, enemigo.height);
		ctx.restore();
	}
}

function agregarDisparo(){
	Disparos.push({
		x: Nave.x + 20,
		y: Nave.y - 10,
		width: 10,
		height: 30
	});
}

function actualizaEnemigos(){
	if(Juego.estado == "INICIANDO"){
		for (var i = 0; i < 10; i++) {
			Enemigos.push({
				x: 10 + (i * 50), 
				y: 10, 
				width:40, 
				height: 40, 
				estado: "VIVO",
				contador: 0
			});
		}
		Juego.estado = "JUGANDO";
	}
	for(var i in Enemigos){
		var enemigo = Enemigos[i];
		if(!enemigo) continue;
		if(enemigo && enemigo.estado == "VIVO"){
			enemigo.contador ++;
			enemigo.x += Math.sin(enemigo.contador * Math.PI / 90)*5;
		}
		if(enemigo && enemigo.estado == "DISPARADO"){
			enemigo.contador++;
			if(enemigo.contador >= 20){
				enemigo.estado = "MUERTO";
				enemigo.contador = 0;
			}
		}
	}
	Enemigos = Enemigos.filter(function(enemigo){
		if (enemigo.estado != "MUERTO") {
			return true;
		}else{
			return false;
		}
	});
}

function colision(a, b){
	var colisiono = false;
	if(b.x + b.width >= a.x && b.x < a.x + a.width){
		if(b.y + b.height >= a.y && b.y < a.x + a.height){
			colisiono = true;
		}
	}
	if(b.x <= a.x && b.x + b.width >= a.x + a.width){
		if(b.y  <= a.y && b.y + b.height >= a.x + a.height){
			colisiono = true;
		}
	}
	if(a.x <= b.x && a.x + a.width >= b.x + b.width){
		if(a.y  <= b.y && a.y + a.height >= b.x + b.height){
			colisiono = true;
		}
	}
	return colisiono;
}

function verificaColision(){
	for(var i in Disparos){
		var disparo = Disparos[i];
		for(var j in Enemigos){
			var enemigo = Enemigos[j];
			if(colision(disparo, enemigo)){
				enemigo.estado = 'DISPARADO';
				enemigo.contador = 0;
			}
		}
	}
}

function frameLoop(){
	moverNave();
	actualizaEnemigos();
	verificaColision();
	moverDisparos();
	dibujaFondo();
	dibujarDisparos();
	dibujarEnemigos();
	dibujaNave();
}

agregarEventosTeclado();
loadMedia();