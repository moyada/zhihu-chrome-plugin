initCustomEventListen();

function addInfo(node) {
	if (node === undefined) {
		return;
	}
	
	var url = node.childNodes[0].href;
    if (url == undefined) {
    	url = node.childNodes[1].href;
    }

    
    var c = getLast(node.childNodes).childNodes[1]
    if (c === undefined) {
    	return;
    }

    const index = url.lastIndexOf('/')
    const id = url.substring(index + 1)

    applyScore(c, id, false);
}

function onItemChange(mutations, instance) {
	// console.log(mutations);
	// console.log(instance);
	if (mutations.length === 0) {
		return;
	}

	mutations.forEach(mutation => {
		addInfo(mutation.addedNodes[0]);
	});
}

function initCustomEventListen() {
	var q = document.getElementsByClassName('QuestionWaiting-questions')[0]

	var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

	var Observer = new MutationObserver(function(mutations, instance) {
		onItemChange(mutations, instance);
	});

	Observer.observe(q, {
	    childList: true,
		// attributes: true,
	    // characterData: true,
	    // subtree:true
	});
}
