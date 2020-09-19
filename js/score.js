
const apiPre = 'https://www.zhihu.com/api/v4/questions/'
const apiData = '/answers?include=data%5B*%5D.is_normal%2Cadmin_closed_comment%2Ccomment_count%2Cvoteup_count%3Bdata%5B*%5D.author.follower_count%2Cbadge%5B*%5D.topics&offset=&limit=10'
const apiVisit = '?include=visit_count,answer_count,follower_count'

function buildNode(type, className, content) {
	let ele = document.createElement(type);
    ele.innerHTML = content;
    if (className !== '') {
		ele.className = className;
	}
	return ele;
}

// https://www.zhihu.com/api/v4/questions/337047368?include=visit_count,answer_count,follower_count
// https://www.zhihu.com/api/v4/questions/337047368/answers?include=data%5B*%5D.is_normal%2Cadmin_closed_comment%2Ccomment_count%2Cvoteup_count%3Bdata%5B*%5D.author.follower_count%2Cbadge%5B*%5D.topics&offset=&limit=10
function applyScore(node, id, order) {
    url = apiPre + id + apiData
    fetch(url).then(res => {
    	if (res.ok) {
    		return res.text();
    	}
    	return ''
    }).then(text => {
    	if (text === '') {
    		render(node, null, true);
    		return;
    	}

    	let data = JSON.parse(text);
    	addScore(node, id, data, order);
    });
}

function getContend(answers) {
	let contend = 10;

	const length = answers.length

	for (i = 0; i < length; i++) {
		const answer = answers[i]

		let follower = answer['author']['follower_count']
		let voteup = answer['voteup_count']
		let comment = answer['comment_count']

		if (voteup < 3) {
			continue;
		}

		if (follower > 10000 && voteup > 1000) {
			contend = contend - 2;
		}
		
		if (voteup > 30) {
			contend = contend - follower / 30000 - voteup / 100;
		} else {
			contend = contend - follower / 20000;
		}
	}
	return contend;
}

function addScore(node, id, data, order) {
	fetch(apiPre + id + apiVisit)
	.then(res => {
    	if (res.ok) {
    		return res.text();
    	}
    	return '';
    }).then(text => {
    	if (text === '') {
			return {};
    	}
		const contend = getContend(data['data']);
		const qData = JSON.parse(text);
		return getScore(contend, qData);
    }).then(score => {
    	render(node, score, order)
    });
}

function getScore(contend, data) {
	let obj = {};

	// 竞争分
	contend = contend - data['answer_count'] / 50;
	if (contend < 0) {
		contend = 0;
	}
	obj['contend'] = contend.toFixed(2);

	// 时间分
	const created = data['created']
	const updated_time = data['updated_time']
	const now = nowTime();

	let time = created * 1.3 + updated_time * 0.7

	// console.log(data)
	// console.log('created', created);
	// console.log('updated', updated_time);

	let timeScore = 10 - ((now * 2 - time) / 16070562)
	if (timeScore < 0) {
		timeScore = 0;
	}
	obj['time'] = timeScore.toFixed(2);

	// 展现分
	let answer_count = data['answer_count']
	let visit_count = data['visit_count']
	let follower_count = data['follower_count']

	// 回答数量太多反而不好
	let answerScore;
	if (answer_count < 10) {
		answerScore = answer_count / 100;
	} else if (answer_count < 100) {
		answerScore = answer_count / 10
	} else if (answer_count < 200) {
		answerScore = 10 - (answer_count / 20);
	} else {
		answerScore = 0;
	}

	let visitScore = visit_count / 10000;
	if (visitScore > 10) {
		visitScore = 10;
	}

	let followerScore = follower_count / 50;
	if (followerScore > 10) {
		followerScore = 10;
	}

	let show = answerScore * 0.4 + visitScore * 0.3 + followerScore * 0.3;
	if (timeScore > 9.9) {
		let t = Math.pow(1.2, Math.pow((timeScore - 8.9), 10))
		show = show * t
	}

	obj['show'] = show.toFixed(2);

	obj['created'] = created * 1000;
	obj['updated'] = updated_time * 1000;
	return obj;
}

function createContentEle(data) {
	const createTime = new Date(data['created']);
	const updateTime = new Date(data['updated']);
	const content = '创建时间：' + format(createTime) + ' 更新时间: ' + format(updateTime);

	return buildNode('div', 'box', content);
}

function buildScoreNode(title, score) {
	let se = buildNode('p', 'QuestionWaiting-info', '&emsp;' + title + ": " + score);
	se.style.float = 'left';
	if (score >= 8) {
		se.style.color = 'red';
	} else if (score >= 6) {
		se.style.color = 'orange';
	}
	return se;
}

function render(node, score, order) {
	if (score == null) {
		return;
	}

	var cont = createContentEle(score);

	var div = document.createElement("div");
	div.className = 'QuestionWaiting-info';
	div.style.display = 'inline-block';

	div.onmouseover = function(){
		cont.style.display="block";
	}
	div.onmouseout = function(){
		cont.style.display="none";
	}

	// div.appendChild(buildNode('p', 'QuestionWaiting-info', '['));
	div.appendChild(buildScoreNode('时间分', score['time']));
	div.appendChild(buildScoreNode('竞争分', score['contend']));
	div.appendChild(buildScoreNode('展现分', score['show']));
	// div.appendChild(buildNode('p', 'QuestionWaiting-info', ']'));

    if (order) {
    	cont.style.right = '30px';
		node.appendChild(div);
		node.appendChild(cont);
    } else {
    	cont.style.right = '30px';
    	node.insertBefore(div, node.childNodes[0]);
    	node.insertBefore(cont, node.childNodes[0]);
	}
}
