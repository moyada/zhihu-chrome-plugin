initCustomEventListen();

function getLastNode(nodes) {
	return nodes[nodes.length - 1]
}

function addScoreInfo(snode, url) {
	// console.log(url)
	if (url === undefined) {
		return;
	}

    const index = url.lastIndexOf('question/')
    if (index === -1) {
    	return;
    }

    let end = url.lastIndexOf('/answer/')
    if (end === -1) {
    	end = url.length;
    }

    const id = url.substring(index + 9, end)
    applyScore(snode, id, true)
}

function addInfo(node) {
	if (node === undefined) {
		return;
	}

	node = node.childNodes[0].childNodes[0]

	// console.log(node.className)

	if (node.className === 'MinorHotSpot') {
		node.childNodes[3].click()
		var mns = node.childNodes[2].childNodes
		mns.forEach(n => {
			addInfo(n.childNodes[0]);
		});
	} else if (node.className === 'WikiBox') {
		var cns = node.childNodes[1].childNodes[1].childNodes[1].childNodes
		cns.forEach(n => {
			addScoreInfo(n, n.childNodes[0].href)
		});
	} else if (node.className === 'ContentItem') {
		var ns = node.childNodes
		addScoreInfo(ns[1], ns[0].childNodes[0].childNodes[0].href)
	} else if (node.className === 'TimeBox') {
		var cns = node.childNodes[1].childNodes;
		const length = cns.length
		for (i = 1; i < length; i++) {
			addScoreInfo(cns[i], cns[i].childNodes[0].childNodes[0].href)
		}
		node = node.childNodes[1].childNodes[0].childNodes[0].childNodes[0].childNodes[0]
	}
	
	if (node.className === 'ContentItem AnswerItem') {
		var ns = node.childNodes
		var c = getLast(getLast(ns).childNodes)
		addScoreInfo(c, getLast(ns[0].childNodes[0].childNodes).href)
	}
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

	// mutations.forEach(mutation => {
	// 	addInfo(mutation.addInfo[0]);
	// });
}

function initCustomEventListen() {
	var q = document.getElementsByClassName('ListShortcut')[0]
	q = q.childNodes[0].childNodes[0]

	var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

	var Observer = new MutationObserver(function(mutations, instance) {
		onItemChange(mutations, instance);
	});

	Observer.observe(q, {
	    childList: true
	});
}
