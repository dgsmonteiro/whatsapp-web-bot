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
		// const chat = document.querySelector('div.chat:not(.unread)')
		// selectChat(chat)
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
			console.log(new Date(), 'nothing to do now... (1)', chats.length, chat);
			return goAgain(start, 3);
		}

		// get infos
		var title;
		if (!processLastMsgOnChat){
			title = getElement("chat_title",chat).title + '';
			lastMsg = (getElement("chat_lastmsg", chat) || { innerText: '' }).innerText.trim(); //.last-msg returns null when some user is typing a message to me
		} else {
			title = getElement("selected_title").title;
		}
		// avoid sending duplicate messaegs
		if (ignoreLastMsg[title] && (ignoreLastMsg[title]) == lastMsg) {
			console.log(new Date(), 'nothing to do now... (2)', title, lastMsg);
			return goAgain(() => { start(chats, cnt + 1) }, 0.1);
		}

		// what to answer back?
		let sendText
		if (lastMsg.toUpperCase().indexOf('@ROLE') > -1){
			sendText = `
			Poxa, eu ando meio impedido de fazer rolê, a Maria ainda não pode sair de casa.
			De qualquer forma eu fico muito honrado pelo seu convite, mas o que acha de me fazer uma visita?`;
		}

		if (lastMsg.toUpperCase().indexOf('@AJUDA') > -1){
			sendText = `
			Legal ${title}! Aqui estão alguns comandos que posso responder:
			
			*hora* - Se quiser saber que horas são
			*piada* - Se quiser que eu te conte algo engraçado
			*role* - Se quiser me chamar para sair`
		}

		if (lastMsg.toUpperCase().indexOf('@HORA') > -1){
			sendText = `
			Você não tem um relógio cara?
			*${new Date()}*`
		}

		if (lastMsg.toUpperCase().indexOf('@PIADA') > -1){
			sendText = jokeList[rand(jokeList.length - 1)];
		}


		if (lastMsg.toUpperCase().indexOf('OI') > -1 || lastMsg.toUpperCase().indexOf('OLA') > -1 || lastMsg.toUpperCase().indexOf('OLÁ') > -1){
			sendText = `Tudo bem com você ${title}?
			Estou um pouco ocupado agora, mas construi um robô para compensar minha indisponibilidade.
			
			Para falar com ele coloque um @ antes da palavra, se você quiser saber o que ele pode fazer envie *ajuda*`
		}
		
		// that's sad, there's not to send back...
		if (!sendText) {
			ignoreLastMsg[title] = lastMsg;
			console.log(new Date(), 'new message ignored -> ', title, lastMsg);
			return goAgain(() => { start(chats, cnt + 1) }, 0.1);
		}

		console.log(new Date(), 'new message to process, uhull -> ', title, lastMsg);

		// select chat and send message
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
	}
	start();
})()
