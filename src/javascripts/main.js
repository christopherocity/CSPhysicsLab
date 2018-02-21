'use strict';

window.isMobile = ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) );
window.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
		  window.webkitRequestAnimationFrame ||
		  window.mozRequestAnimationFrame    ||
		  function( callback ){
			window.setTimeout(callback, 1000 / 60);
		  };
})();

// -~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~

// const backend = require("../../backend/server.js");
const spec3D = require('./ui/spectrogram');
const notes = [];
	notes.push('A2:110');
	notes.push('Bb2:116.54');
	notes.push('B2:123.47');
	notes.push('C3:130.81');
	notes.push('C#3:138.59');
	notes.push('D3:146.83');
	notes.push('Eb3:155.56');
	notes.push('E3:164.81');
	notes.push('F3:174.61');
	notes.push('F#3:185');
	notes.push('G3:196');
	notes.push('Ab3:207.65');
	notes.push('A3:220');
	notes.push('Bb3:233.08');
	notes.push('B3:246.94');
	notes.push('C4:261.63');
	notes.push('C#4:277.18');
	notes.push('D4:293.66');
	notes.push('Eb4:311.13');
	notes.push('E4:329.63');
	notes.push('F4:349.23');
	notes.push('F#4:369.99');
	notes.push('G4:392');
	notes.push('Ab4:415.30');
	notes.push('A4:440');
	notes.push('Bb4:466.16');
	notes.push('B4:493.88');
	notes.push('C5:523.25');
	notes.push('C#5:554.37');
	notes.push('D5:587.33');
	notes.push('Eb5:622.25');
	notes.push('E5:659.25');
	notes.push('F5:698.46');
	notes.push('F#5:739.99');
	notes.push('G5:783.99');
	notes.push('Ab5:830.61');
	notes.push('A5:880');
	notes.push('Bb5:932.33');
	notes.push('B5:987.77');
	notes.push('C6:1046.50');
	notes.push('C#6:1108.73');
	notes.push('D6:1174.66');
	notes.push('Eb6:1244.51');
	notes.push('E6:1318.51');
	notes.push('F6:1396.91');
	notes.push('F#6:1479.98');
	notes.push('G6:1567.98');
	notes.push('Ab6:1661.22');
	notes.push('A6:1760');
	notes.push('Bb6:1864.66');
	notes.push('B6:1975.53');
	notes.push('C7:2093');
	notes.push('C#7:2217.46');
	notes.push('D7:2349.32');
	notes.push('Eb7:2489.02');
	notes.push('E7:2637.02');
	notes.push('F7:2793.83');
	notes.push('F#7:2959.96');
	notes.push('G7:3135.96');
	notes.push('Ab7:3322.44');
	notes.push('A7:3520');
	notes.push('Bb7:3729.31');
	notes.push('B7:3951.07');
	notes.push('C8:4186.01');
	notes.push('C#8:4434.92');
	notes.push('D8:4698.63');
	notes.push('Eb8:4978.03');
	notes.push('E8:5274.04');
	notes.push('F8:5587.65');
	notes.push('F#8:5919.91');
	notes.push('G8:6271.93');
	notes.push('Ab8:6644.88');
	notes.push('A8:7040');
	notes.push('Bb8:7458.62');
	notes.push('B8:7902.13');
let i = 0;

// -~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~

$(function(){
	
	let parseQueryString = function(){
		let q = window.location.search.slice(1).split('&');
		for(let i=0; i < q.length; ++i){
			let qi = q[i].split('=');
			q[i] = {};
			q[i][qi[0]] = qi[1];
		}
		return q;
	};

	let getLocalization = function(){
		let q = parseQueryString();
		let lang = 'en';
		for(let i=0; i < q.length; i++){
			if(q[i].ln !== undefined){
				lang = q[i].ln;
			}
		}
		// var url = "https://gweb-musiclab-site.appspot.com/static/locales/" + lang + "/locale-music-lab.json";
		// $.ajax({
		// 	url: url,
		// 	dataType: "json",
		// 	async: true,
		// 	success: function( response ) {
		// 		$.each(response,function(key,value){
		// 			var item = $("[data-name='"+ key +"']");
		// 			if(item.length > 0){
		// 				console.log('value.message',value.message);
		// 				item.attr('data-name',value.message);
		// 			}
		// 		});
		// 	},
		// 	error: function(err){
		// 		console.warn(err);
		// 	}
		// });
	};
	

	let startup = function (){

		getLocalization();
		window.parent.postMessage('ready','*');

		let sp = spec3D;
        let detail = notes[i].split(':');
        sp.updateDetails(detail);
		sp.attached();
		// --------------------------------------------
		// $('.music-box__tool-tip').hide(0);
		// $('#loadingSound').hide(0);
		$('.music-box__buttons__button').click(function(e){
			sp.startRender();

			let wasPlaying = sp.isPlaying();
			sp.stop();
			sp.drawingMode = false;
			
			if($(this).hasClass('selected')) {
				$('.music-box__buttons__button').removeClass('selected'); 
			}
			else{
				$('.music-box__buttons__button').removeClass('selected'); 
				$(this).addClass('selected');
				// check for start recoding data instruction **********************
				if ($(this).attr('data-mic')!== undefined) {
					if(window.isIOS){
						// Throw Microphone Error *********************************
						window.parent.postMessage('error2','*');
						// Remove Selection ***************************************
						$(this).removeClass('selected');
					}
					else{
						// Show Record Modal Screen *******************************
						$('#record').fadeIn().delay(2000).fadeOut();
						// Start Recording ****************************************
						sp.live();
					}
				// Check for Start drawing data instruction  **********************
				}
				else if ($(this).attr('data-draw') !== undefined) {
					sp.drawingMode = true;
					$('#drawAnywhere').fadeIn().delay(2000).fadeOut();
				// Check for play audio data instruction **************************
				}
				else if ($(this).attr('data-src') !== undefined) {
					sp.loopChanged( true );
					$('#loadingMessage').text($(this).attr('data-name'));
					sp.play($(this).attr('data-src'));
				}

			}

		});

		let $toggle = $('.music-box__buttons__toggle');
        $toggle.click(function(e){
            if ($(this).attr('data-name') === 'up') {
            	i === notes.length ? i = 0 : i++;
				let details = notes[i].split(':');
            	sp.updateDetails(details);
			}else if ($(this).attr('data-name') === 'down') {
                i === 0 ? i = notes.length : i--;
                let detail = notes[i].split(':');
                sp.updateDetails(detail);
            }
            else if ($(this).attr('data-name') === 'play'){
            	sp.startRender();
				let wasPlaying = sp.isPlaying();
				sp.stop();
				sp.drawingMode = false;
				let $file = $('#file');
				if ($file.val() === null) {
					let info = notes[i].split(':');
					let waveType = $('#wavetype').val();
					waveType === 'Sin' ?
						$(this).prop('data-src', "bin/snd/" + info[1].toString() + ".wav") :
						$(this).prop('data-src', "bin/snd/" + info[1].toString() + waveType + ".wav");
				}

				else $(this).prop('data-src', $file.val());
                console.log($(this).prop('data-src').toString());
				if($(this).hasClass('selected')) {
					$toggle.removeClass('selected');
				}
				else{
					$toggle.removeClass('selected');
					$(this).addClass('selected');

                    // $(this).attr('data-src', notes.get(i).toString().split(':'));
					if ($(this).prop('data-src') !== undefined) {
						sp.loopChanged( true );
						// $('#loadingMessage').text($(this).prop('data-name'));
						sp.play($(this).prop('data-src'));
					}

				}
            }


        });

	};
	let elm = $('#iosButton');
	if(!window.isIOS){
		startup();
		elm.addClass('hide');
	}else{
		window.parent.postMessage('loaded','*');
		elm[0].addEventListener('touchend', function(e){
			elm.addClass('hide');
			startup();
		},false);
	}
});
