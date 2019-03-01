(() => {
	//
	// GLOBAL VARS AND CONFIGS
	//
	var lastMessageOnChat = false;
	var ignoreLastMsg = {};
	var elementConfig = {
		"chats": [1, 0, 5, 2, 0, 3, 0, 0, 0],
		"chat_icons": [0, 0, 1, 1, 1, 0],
		"chat_title": [0, 0, 1, 0, 0, 0, 0],
		"chat_lastmsg": [0, 0, 1, 1, 0, 0],
		"chat_active": [0, 0],
		"selected_title": [1, 0, 5, 3, 0, 1, 1, 0, 0, 0, 0]
	};

	const jokeList = [
		`
		Um garotinho folheia a bíblia da família. De repente, um objeto cai de dentro do Livro Sagrado. O menino pega o objeto e dá uma olhada nele: Trata-se de uma folha seca que estava pressionada entre as páginas.
		- Mãe, olhe só o que eu achei!
		- O que é, meu filho?
		Maravilhado, o menino responde:
		- Acho que é a cueca do Adão!`,

		`
		- É formalidade, sogrão, pura formalidade. Mas estou aqui para pedir a mão de sua filha em casamento - diz o futuro genro.
		- Formalidade nada. Pedir a mão é um gesto importante, familiar. Quem falou que é uma formalidade?
		- O ginecologista da sua filha, sogrão.`,

		`
		Numa pequena cidade do interior de RS, uma mulher entra em uma farmácia e fala ao farmacêutico:
		- Por favor, quero comprar arsênico.

		- Mas... não posso vender isso ASSIM! Qual é a finalidade?

		- Matar meu marido!!
		- Pra este fim.... piorou... não posso vender!!!
		- A mulher abre a bolsa e tira uma fotografia do marido, transando com a mulher do farmacêutico.

		- Ah bom!... COM RECEITA TUDO BEM!!!`,

		`
		- Mamãe, posso usar o seu vestido?
		- Não!
		- Mamãe, posso usar a sua combinação?
		- Não!
		- Mamãe, posso então usar o seu batom? Eu já tenho quatorze anos!
		E a mãe finaliza:
		- Não, não e não! E vê se não me enche o saco! Eu tenho muito o que fazer, Jorginho!`
	]


	//
	// FUNCTIONS
	//

	//format date
	function strftime(sFormat, date) {
		if (!(date instanceof Date)) date = new Date();
		var nDay = date.getDay(),
		  nDate = date.getDate(),
		  nMonth = date.getMonth(),
		  nYear = date.getFullYear(),
		  nHour = date.getHours(),
		  aDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
		  aMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
		  aDayCount = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334],
		  isLeapYear = function() {
			return (nYear%4===0 && nYear%100!==0) || nYear%400===0;
		  },
		  getThursday = function() {
			var target = new Date(date);
			target.setDate(nDate - ((nDay+6)%7) + 3);
			return target;
		  },
		  zeroPad = function(nNum, nPad) {
			return ('' + (Math.pow(10, nPad) + nNum)).slice(1);
		  };
		return sFormat.replace(/%[a-z]/gi, function(sMatch) {
		  return {
			'%a': aDays[nDay].slice(0,3),
			'%A': aDays[nDay],
			'%b': aMonths[nMonth].slice(0,3),
			'%B': aMonths[nMonth],
			'%c': date.toUTCString(),
			'%C': Math.floor(nYear/100),
			'%d': zeroPad(nDate, 2),
			'%e': nDate,
			'%F': date.toISOString().slice(0,10),
			'%G': getThursday().getFullYear(),
			'%g': ('' + getThursday().getFullYear()).slice(2),
			'%H': zeroPad(nHour, 2),
			'%I': zeroPad((nHour+11)%12 + 1, 2),
			'%j': zeroPad(aDayCount[nMonth] + nDate + ((nMonth>1 && isLeapYear()) ? 1 : 0), 3),
			'%k': '' + nHour,
			'%l': (nHour+11)%12 + 1,
			'%m': zeroPad(nMonth + 1, 2),
			'%M': zeroPad(date.getMinutes(), 2),
			'%p': (nHour<12) ? 'AM' : 'PM',
			'%P': (nHour<12) ? 'am' : 'pm',
			'%s': Math.round(date.getTime()/1000),
			'%S': zeroPad(date.getSeconds(), 2),
			'%u': nDay || 7,
			'%V': (function() {
					var target = getThursday(),
					  n1stThu = target.valueOf();
					target.setMonth(0, 1);
					var nJan1 = target.getDay();
					if (nJan1!==4) target.setMonth(0, 1 + ((4-nJan1)+7)%7);
					return zeroPad(1 + Math.ceil((n1stThu-target)/604800000), 2);
				  })(),
			'%w': '' + nDay,
			'%x': date.toLocaleDateString(),
			'%X': date.toLocaleTimeString(),
			'%y': ('' + nYear).slice(2),
			'%Y': nYear,
			'%z': date.toTimeString().replace(/.+GMT([+-]\d+).+/, '$1'),
			'%Z': date.toTimeString().replace(/.+\((.+?)\)$/, '$1')
		  }[sMatch] || sMatch;
		});
	  }

	// Get random value between a range
	function rand(high, low = 0) {
		return Math.floor(Math.random() * (high - low + 1) + low);
	}
	
	function getElement(id, parent){
		if (!elementConfig[id]){
			return false;
		}
		var elem = !parent ? document.body : parent;
		var elementArr = elementConfig[id];
		elementArr.forEach(function(pos) {
			if (!elem.childNodes[pos]){
				return false;
			}
			elem = elem.childNodes[pos];
		});
		return elem;
	}
	
	function getLastMsg(){
		var messages = document.querySelectorAll('.msg');
		var pos = messages.length-1;
		
		while (messages[pos] && (messages[pos].classList.contains('msg-system') || messages[pos].querySelector('.message-in'))){
			pos--;
			if (pos <= -1){
				return false;
			}
		}
		if (messages[pos] && messages[pos].querySelector('.selectable-text')){
			return messages[pos].querySelector('.selectable-text').innerText.trim();
		} else {
			return false;
		}
	}
	
	function getUnreadChats(){
		var unreadchats = [];
		var chats = getElement("chats");
		if (chats){
			chats = chats.childNodes;
			for (var i in chats){
				if (!(chats[i] instanceof Element)){
					continue;
				}
				var icons = getElement("chat_icons", chats[i]).childNodes;
				if (!icons){
					continue;
				}
				for (var j in icons){
					if (icons[j] instanceof Element){
						if (!(icons[j].childNodes[0].getAttribute('data-icon') == 'muted' || icons[j].childNodes[0].getAttribute('data-icon') == 'pinned')){
							unreadchats.push(chats[i]);
							break;
						}
					}
				}
			}
		}
		return unreadchats;
	}
	
	function didYouSendLastMsg(){
		var messages = document.querySelectorAll('.msg');
		if (messages.length <= 0){
			return false;
		}
		var pos = messages.length-1;
		
		while (messages[pos] && messages[pos].classList.contains('msg-system')){
			pos--;
			if (pos <= -1){
				return -1;
			}
		}
		if (messages[pos].querySelector('.message-out')){
			return true;
		}
		return false;
	}

	// Call the main function again
	const goAgain = (fn, sec) => {
		 //const chat = document.querySelector('div.chat:not(.unread)')
		 //selectChat(chat)
		setTimeout(fn, sec * 1000)
	}

	// Dispath an event (of click, por instance)
	const eventFire = (el, etype) => {
		var evt = document.createEvent("MouseEvents");
		evt.initMouseEvent(etype, true, true, window,0, 0, 0, 0, 0, false, false, false, false, 0, null);
		el.dispatchEvent(evt);
	}

	// Select a chat to show the main box
	const selectChat = (chat, cb) => {
		const title = getElement("chat_title",chat).title;
		eventFire(chat.firstChild.firstChild, 'mousedown');
		if (!cb) return;
		const loopFewTimes = () => {
			setTimeout(() => {
				const titleMain = getElement("selected_title").title;
				if (titleMain !== undefined && titleMain != title){
					console.log('not yet');
					return loopFewTimes();
				}
				return cb();
			}, 300);
		}

		loopFewTimes();
	}

	// Send a message
	const sendMessage = (chat, message, cb) => {
		//avoid duplicate sending
		var title;

		if (chat){
			title = getElement("chat_title",chat).title;
		} else {
			title = getElement("selected_title").title;
		}
		ignoreLastMsg[title] = message;
		
		messageBox = document.querySelectorAll("[contenteditable='true']")[0];

		//add text into input field
		messageBox.innerHTML = message.replace(/  /gm,'');

		//Force refresh
		event = document.createEvent("UIEvents");
		event.initUIEvent("input", true, true, window, 1);
		messageBox.dispatchEvent(event);

		//Click at Send Button
		eventFire(document.querySelector('span[data-icon="send"]'), 'click');

		cb();
	}

	//
	// MAIN LOGIC
	//
	const start = (_chats, cnt = 0) => {
		// get next unread chat
		const chats = _chats || getUnreadChats();
		const chat = chats[cnt];
		
		var processLastMsgOnChat = false;
		var lastMsg;
		
		if (!lastMessageOnChat){
			if (false === (lastMessageOnChat = getLastMsg())){
				lastMessageOnChat = true; //to prevent the first "if" to go true everytime
			} else {
				lastMsg = lastMessageOnChat;
			}
		} else if (lastMessageOnChat != getLastMsg() && getLastMsg() !== false && !didYouSendLastMsg()){
			lastMessageOnChat = lastMsg = getLastMsg();
			processLastMsgOnChat = true;
		}
		
		if (!processLastMsgOnChat && (chats.length == 0 || !chat)) {
			console.log(strftime('%d/%m/%Y %H:%M'), 'nada para fazer agora... (1)', chats.length, chat ? chat : ' ');
			return goAgain(start, 3);
		}

		// get infos
		var title;
		if (!processLastMsgOnChat){
			title = getElement("chat_title",chat).title + '';
			console.log(title, 'title');
			lastMsg = (getElement("chat_lastmsg", chat) || { innerText: '' }).innerText.trim(); //.last-msg returns null when some user is typing a message to me
		} else {
			title = getElement("selected_title").title;
		}
		// avoid sending duplicate messaegs
		if (ignoreLastMsg[title] && (ignoreLastMsg[title]) == lastMsg) {
			console.log(strftime('%d/%m/%Y %H:%M'), 'nada para fazer agora... (2)', title, lastMsg);
			return goAgain(() => { start(chats, cnt + 1) }, 0.1);
		}

		// what to answer back?
		let sendText
		if (lastMsg.toUpperCase().indexOf('#ORCAMENTO') > -1){
			sendText = `
			O preço da consulta é R$120,00.
			É muito importante avaliar o andamento do tratamento, por isso fazemos o pacote promocional Consulta + Exame de Bio Impedância por R$150,00`;
		}
		if (lastMsg.toUpperCase().indexOf('#AGENDAMENTO') > -1){
			sendText = `
			Acesse o endereço da minha página de agendamentos: http://nutri.tatiane.ntr.br/agendamento`;
		}
		
		if (lastMsg.toUpperCase().indexOf('#SAFRADOMES') > -1){
			sendText = `
			Observe as frutas e verduras que são da *Safra do mês* para economizar e comprar produtos de melhor qualidade!
			Responda uma _hashtag (#)_ com o nome do mês que você quer saber.


			*Janeiro*
*Fevereiro*
*Março*
*Abril*
*Maio*
*Junho*
*Julho*
*Agosto*
*Setembro*
*Outubro*
*Novembro*
*Dezembro*`;
		}
		
		if (lastMsg.toUpperCase().indexOf('#DICASDANUTRI') > -1){
			sendText = `
			To de folga`;
		}
		
		if (lastMsg.toUpperCase().indexOf('@AULA') > -1){
			sendText = `
			Estudar é sempre muito importante, posso te passar um pouco do conhecimento que obtive durante a vida.
			Por favor, me fale um pouco mais sobre o que quer aprender e quais seus horários livres que eu retornarei com uma proposta assim que possível`;
		}

		if (lastMsg.toUpperCase().indexOf('@AJUDA') > -1){
			sendText = `
			Legal ${title}, que bom que você optou pela praticidade da tecnologia! 
			Eu sou o assistente pessoal do Douglas e para falar comigo, sempre coloque um @ antes do comando que você deseja que eu faça, assim como fez com *ajuda*.
			Aqui estão alguns comandos que posso responder:
			
			*hora* - Se quiser saber que horas são
			*piada* - Se quiser que eu te conte algo engraçado
			*role* - Se quiser me chamar para sair
			*cobranca* - Se eu estou te devendo e precisa me cobrar algo
			*desenvolvimento* - Se você precisa de um app ou um site
			*suporte* - Se você precisa de ajuda no uso de alguma ferramenta
			*aula* - Se você deseja agendar alguma aula comigo`
		}

		if (lastMsg.toUpperCase().indexOf('@HORA') > -1){
			sendText = `
			Você não tem um relógio cara?
			Agora são *${strftime('%H:%M')}*`
		}

		if (lastMsg.toUpperCase().indexOf('@PIADA') > -1){
			sendText = jokeList[rand(jokeList.length - 1)];
		}


		if (lastMsg.toUpperCase().indexOf('OI') > -1 
		|| lastMsg.toUpperCase().indexOf('OLA') > -1 
		|| lastMsg.toUpperCase().indexOf('OLÁ') > -1
		|| lastMsg.toUpperCase().indexOf('BOM DIA') > -1
		|| lastMsg.toUpperCase().indexOf('BOA TARDE') > -1
		|| lastMsg.toUpperCase().indexOf('BOA NOITE') > -1
		|| lastMsg.toUpperCase().indexOf('E AÍ') > -1
		|| lastMsg.toUpperCase().indexOf('E AI') > -1
		|| lastMsg.toUpperCase().indexOf('EAI') > -1
		|| lastMsg.toUpperCase().indexOf('EAE') > -1
		|| lastMsg.toUpperCase().indexOf('OPA') > -1
		|| lastMsg.toUpperCase().indexOf('E AE') > -1){
			sendText = `Seja Bem Vindo ${title}
			Que bom que entrou em contato comigo! Sou a atendente virtual da Nutricionista Tatiane Ribeiro e pretendo agilizar o seu atendimento.
			Responda com uma _hashtag (#)_ de acordo com a opção desejada.

			*orcamento*
			*agendamento*
			*safraDoMes*
			*dicasDaNutri*`
		}
		
		// that's sad, there's not to send back...
		if (!sendText) {
			ignoreLastMsg[title] = lastMsg;
			console.log(strftime('%d/%m/%Y %H:%M'), 'nova mensagem ignorada -> ', title, lastMsg);
			return goAgain(() => { start(chats, cnt + 1) }, 0.1);
		}

		console.log(strftime('%d/%m/%Y %H:%M'), 'nova mensagem para processar, uhull -> ', title, lastMsg);

		// select chat and send message
		if (lastMessageOnChat !== sendText) {
			if (!processLastMsgOnChat){
				selectChat(chat, () => {
					sendMessage(chat, sendText.trim(), () => {
						goAgain(() => { start(chats, cnt + 1) }, 1);
					});
				})
			} else {
				sendMessage(null, sendText.trim(), () => {
					goAgain(() => { start(chats, cnt + 1) }, 1);
				});
			}

		} else {
			console.log('mensagem repetida');
		}
	}
	start();
})()
