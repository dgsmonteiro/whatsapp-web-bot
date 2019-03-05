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
		Numa pequena cidade do interior de RS, uma mulher entra em uma farmácia e fala ao farmacêutico:
		- Por favor, quero comprar arsênico.

		- Mas... não posso vender isso ASSIM! Qual é a finalidade?

		- Matar meu marido!!
		- Pra este fim.... piorou... não posso vender!!!
		- A mulher abre a bolsa e tira uma fotografia do marido, transando com a mulher do farmacêutico.

		- Ah bom!... COM RECEITA TUDO BEM!!!`
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
		console.log(lastMsg);
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
			Nós somos especialista em desenvolvimento de sistemas e aplicativos.
			Por favor nos fale um pouco mais sobre seu projeto para avaliarmos.`;
		}
		if (lastMsg.toUpperCase().indexOf('#CHATBOT') > -1){
			sendText = `
			Chega de ficar copiando e colando mensagens padrão, utilize nosso chatbot no whatsapp e melhore sua comunicação com seu cliente.
			
			
			Responda com uma _hashtag (#)_ de acordo com a opção desejada
			*preco*
			*saberMais*
			*contratar*`;
		}
		if (lastMsg.toUpperCase().indexOf('#PRECO') > -1){
			sendText = `
			O valor pode variar de acordo com a quantidade de fluxos e a profundidade de cada um deles.
			Quanto maior o robô, maior é o preço cobrado na sua criação.

			O valor inical é de R$500,00 que atende a maioria dos casos.

			Pode ser feito em até 2x pelo PagSeguro.
			
			NÃO EXISTE NENHUM TIPO DE MENSALIDADE, O CUSTO É SOMENTE PARA IMPLANTAÇÃO`;
		}

		if (lastMsg.toUpperCase().indexOf('#SABERMAIS') > -1){
			sendText = `
			O robô é bem simples, é um códico que fica em loop no Whatsapp Web do Google Chrome, em todas as iterações ele lê a ultima mensagem de cada conversa não lida.
			Caso a mensagem tenha alguma palavra reservada, ele responde com o texto determinado para aquela palavra, para navegação utilizamos _hashtags (#)_ como palavras chave.
			
			Esse robô irá auxilia-lo a responder as perguntas mais frequentes dos seus clientes.

			A licença do código será feita em Código Livre`;
		}

		if (lastMsg.toUpperCase().indexOf('#CONTRATAR') > -1){
			sendText = `
			Que bom que você gostou do meu atendimento e quer implementar um robô como eu no seu negócio.

			Esse robô irá auxilia-lo a responder as perguntas mais frequentes dos seus clientes, então providencie uma lista dessas perguntas para agilizarmos o protótipo.

			Para formalizar a contratação me passe seu nome completo, cpf, endereço e os dados de pagamento que vou processar sua solicitação.`;
		}
		
		if (lastMsg.toUpperCase().indexOf('#FREELA') > -1){
			sendText = `
			Se você domina a metodologia SCRUM, então você já sabe como a gente trabalha:
- Você recebe por horas trabalhadas de acordo com o prazo de cada tarefa;
- Uma Equipe é formada para cada projeto; 
- Os Contratos e Pagamentos são por Sprint.`;
		}
		
		if (lastMsg.toUpperCase().indexOf('#COOPERATIVA') > -1){
			sendText = `
			Uma cooperativa é uma sociedade cujo capital é formado pelos associados e tem a finalidade de somar esforços para atingir objetivos comuns que beneficiem a todos.
			Nós acreditamos que juntos somos mais fortes.`;
		}
		
		if (lastMsg.toUpperCase().indexOf('#PROMOWHATSBOT') > -1){
			sendText = `
			Parabéns, você acaba de ganhar 20% de desconto na criação de um Robô de Atendimento Virtual como Eu.
			Obrigado por escolher cooperar com o nosso trabalho.
			
			Esse robô irá auxilia-lo a responder as perguntas mais frequentes dos seus clientes, por favor, me informe uma lista dessas perguntas para agilizarmos o protótipo.
			
			Responda com uma _hashtag (#)_ de acordo com a opção desejada`;
		}

		if (lastMsg.toUpperCase().indexOf('OI') > -1 
		|| lastMsg.toUpperCase().indexOf('OLA') > -1 
		|| lastMsg.toUpperCase().indexOf('OLÁ') > -1 
		|| lastMsg.toUpperCase().indexOf('OPA') > -1 
		|| lastMsg.toUpperCase().indexOf('BOM DIA') > -1
		|| lastMsg.toUpperCase().indexOf('BOA TARDE') > -1
		|| lastMsg.toUpperCase().indexOf('BOA NOITE') > -1
		|| lastMsg.toUpperCase().indexOf('E AÍ') > -1
		|| lastMsg.toUpperCase().indexOf('E AI') > -1
		|| lastMsg.toUpperCase().indexOf('E AE') > -1){
			sendText = `Que bom que você entrou em contato com a gente.
Saiba mais sobre nós no site www.cooperdev.com.br
Eu sou a atendente virtual da COOPERDEV e pretendo agilizar o seu atendimento.
Responda com uma _hashtag (#)_ de acordo com a opção desejada.

*chatbot*
*cooperativa*
*orcamento*
*freela*`
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
