var canvas = document.getElementById("Canvas");
var ctx = canvas.getContext('2d');
var fondo, naveImage, enemigoImage, disparoImage, enemigoHit, disparoEnemigo;
var Juego = {estado:"INICIANDO"};
var textoRespuesta = {contador : -1, titulo: "", subtitulo: ""}
var Nave = {x: 50, y: canvas.height - 100, width: 50, height: 50, contador: 0}
var Teclado = {};
var Enemigos = [];
var Disparos = [];
var DisparosEnemigos = [];
var images = [
	{id: "fondo", src: 'images/bg5.jpg'}, 
	{id: "nave", src: 'images/SpaceShipSmall.png'}, 
	{id: "enemigo", src: 'images/alien2.png'},
	{id: "disparo", src: "images/64_laser_red.png"},
	{id: "enemigoHit", src: "images/64_boom.png"},
	{id: "disparoEnemigo", src: "images/64_laser_blue.png"}
];
var soundDisparo, soundFondo, soundExplosion;
var preloader;

function loadMedia(){
	preloader = new createjs.LoadQueue();	
	preloader.addEventListener("progress", progresoCarga);
	preloader.loadManifest(images);
	preloader.on("complete", start, this);
}
function start(){
	if(preloader.progress == 1){
		fondo = preloader.getResult("fondo");
		naveImage = preloader.getResult("nave");
		enemigoImage = preloader.getResult("enemigo");
		disparoImage = preloader.getResult("disparo");
		enemigoHit = preloader.getResult("enemigoHit");
		disparoEnemigo = preloader.getResult("disparoEnemigo");
		soundDisparo = document.getElementById("Disparo");
		soundExplosion = document.getElementById("AudioExplosion");
		soundFondo = document.getElementById("AudioFondo");
		soundFondo.play();
		soundFondo.onended = function(){
			soundFondo.play();
		}
		var interval = window.setInterval(frameLoop, 1000/55);
	}
}
function progresoCarga(e){
	console.log(parseInt(e.loaded * 100));
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
	if(Teclado[39] && Nave.x < canvas.width - Nave.width){
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
	if(Nave.estado == "DISPARADO"){
		Nave.contador++;
		if(Nave.contador >= 20){
			Nave.contador = 0;
			Nave.estado = "MUERTO";
			Juego.estado = "PERDIDO";
			textoRespuesta.titulo = "Game Over";
			textoRespuesta.subtitulo = "Presiona la tecla R para continuar";
			textoRespuesta.contador = 0;
		}
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

function moverDisparosEnemigos(){
	for(var i in DisparosEnemigos){
		var disparo = DisparosEnemigos[i];
		disparo.y += 3;
	}
	DisparosEnemigos = DisparosEnemigos.filter(function(disparo){
		return disparo.y < canvas.height;
	});
}

function dibujaFondo(){
	ctx.drawImage(fondo, 0, 0);
}

function dibujaNave(){
	ctx.drawImage(naveImage, Nave.x, Nave.y, Nave.width, Nave.height);
}

function dibujarDisparos(){
	for(var i in Disparos){
		var disparo = Disparos[i];
		ctx.drawImage(disparoImage, disparo.x, disparo.y, disparo.width, disparo.height);
	}
}

function dibujarDisparosEnemigos(){
	for(var i in DisparosEnemigos){
		var disparo = DisparosEnemigos[i];
		ctx.drawImage(disparoEnemigo, disparo.x, disparo.y, disparo.width, disparo.height);
	}
}

function dibujarEnemigos(){
	for(var i in Enemigos){
		var enemigo = Enemigos[i];
		if(enemigo.estado == "VIVO"){
			ctx.drawImage(enemigoImage, enemigo.x, enemigo.y, enemigo.width, enemigo.height);
		}
		if(enemigo.estado == "MUERTO"){
			
		}
		if(enemigo.estado == "DISPARADO"){
			ctx.drawImage(enemigoHit, enemigo.x, enemigo.y, enemigo.width, enemigo.height);
		}
	}
}

function agregarDisparo(){
	reproducirSonido(soundDisparo);
	Disparos.push({
		x: Nave.x + 20,
		y: Nave.y - 10,
		width: 10,
		height: 30
	});
}

function actualizaEnemigos(){
	function agregarDisparosEnemigos(enemigo){
		return {
			x: enemigo.x,
			y: enemigo.y,
			width: 10,
			height: 33,
			contador: 0
		}
	}
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
			if(aleatorio(0, Enemigos.length * 10) == 4){
				DisparosEnemigos.push(agregarDisparosEnemigos(enemigo));
			}
		}
		if(enemigo && enemigo.estado == "DISPARADO"){
			enemigo.contador++;
			reproducirSonido(soundExplosion);
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
function dibujaTexto(){
	if(textoRespuesta.contador == -1) return;
	var alpha = textoRespuesta.contador / 50.0;
	if(alpha > 1){
		for(var i in Enemigos){
			delete Enemigos[i];
		}
	}
	ctx.save();
	ctx.globalAlpha = alpha;
	if(Juego.estado == "PERDIDO" || Juego.estado == "VICTORIA"){
		ctx.fillStyle = "white";
		ctx.font = "Bold 40pt Arial";
		ctx.fillText(textoRespuesta.titulo, 140, 200);
		ctx.font = "14pt Arial";
		ctx.fillText(textoRespuesta.subtitulo, 190, 250);
	}
}
function actualizarEstadoJuego(){
	if(Juego.estado == "JUGANDO" && Enemigos.length == 0){
		Juego.estado = "VICTORIA";
		textoRespuesta.titulo = "Derrotaste a los enemigos";
		textoRespuesta.subtitulo = "Presiona la tecla R para reiniciar";
		textoRespuesta.contador = 0;
	}
	if(textoRespuesta.contador >= 0){
		textoRespuesta.contador++
	}
	if((Juego.estado == "PERDIDO" || Juego.estado == "VICTORIA") && Teclado[82]){
		Juego.estado = "INICIANDO";
		Nave.estado = "VIVO";
		textoRespuesta.contador = -1;
	}
}

function colision(a, b){
	var colisiono = false;
	if(b.x + b.width >= a.x && b.x < a.x + a.width){
		if(b.y + b.height >= a.y && b.y < a.y + a.height){
			colisiono = true;
		}
	}
	if(b.x <= a.x && b.x + b.width >= a.x + a.width){
		if(b.y  <= a.y && b.y + b.height >= a.y + a.height){
			colisiono = true;
		}
	}
	if(a.x <= b.x && a.x + a.width >= b.x + b.width){
		if(a.y  <= b.y && a.y + a.height >= b.y + b.height){
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
	if(Nave.estado == "DISPARADO" || Nave.estado == "MUERTO") return;
	for(var i in DisparosEnemigos){
		var disparo = DisparosEnemigos[i];
		if(colision(disparo, Nave)){
			Nave.estado = 'DISPARADO';	
		}
	}
}

function aleatorio(inferior, superior){
	var posibilidades = superior - inferior;
	var a = Math.random() * posibilidades;
	a = Math.floor(a);
	return parseInt(inferior) + a;
}

function reproducirSonido(sound){
	//sound.pause();
	sound.currentTime = 0;
	sound.play();
}

function frameLoop(){
	actualizarEstadoJuego();
	moverNave();
	actualizaEnemigos();
	verificaColision();
	moverDisparos();
	moverDisparosEnemigos();
	dibujaFondo();
	dibujarDisparos();
	dibujarEnemigos();
	dibujarDisparosEnemigos();
	dibujaTexto();
	dibujaNave();
}



window.addEventListener('load', init);
function init(){
	agregarEventosTeclado();
	loadMedia();
}
