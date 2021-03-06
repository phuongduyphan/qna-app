const closeBtn = document.getElementsByClassName("fa-times")[0];
const askBtn = document.getElementById("askBtn");
const questionForm = document.getElementsByClassName("questionForm")[0];
const urlSegments = window.location.pathname.split('/');
const sessionId = urlSegments[urlSegments.length-1];
const submitBtn = document.getElementById("submitBtn");
const newestTab = document.getElementById("newest-tab")
let likeList = [];
let listOfNewestQuestions;
let listOfTopFavoriteQuestions;
let listOfAnsweredQuestions;
let listOfPendingQuestions;
let sessionData = null;
let roleData = null;

closeBtn.addEventListener("click", () => {
	questionForm.classList.add("undisplay");
	askBtn.classList.remove("undisplay");
})

askBtn.addEventListener("click", () => {
	questionForm.classList.remove("undisplay");
	askBtn.classList.add("undisplay");
})

// Event listener
submitBtn.addEventListener("click", function() {
  const url="/api/sessions/"+sessionId+"/questions";

  axios.post(url, {
    title: document.getElementById("title-ask").value,
    content: document.getElementById("content-ask").value
  })
  .then(response => {
    render();
    document.getElementById("title-ask").value = '';
    document.getElementById("content-ask").value = '';
  })
  .catch(function (error) {
		if(error.response.status === 422) {
			alert("Title and content must be more than 6 characters.");
		}
  });
})

newestTab.addEventListener("click", async function() {
	await render();
	checkNewest();
})

function init() { // Get session data
	const url = "/api/sessions/"+sessionId;
	axios.get(url)
	.then((response)=> {
    sessionData = response.data.session;
    roleData = response.data.role;
		listOfNewestQuestions = response.data.listOfNewestQuestions;
		listOfTopFavoriteQuestions = response.data.listOfTopFavoriteQuestions;
		listOfAnsweredQuestions = response.data.listOfAnsweredQuestions;
		sessionName = roleData==="EDITOR" ? sessionData.SessionName+' <a href="/sessions/'+sessionId+'/editors"><i class="fas fa-edit text-white"></i></a>': sessionData.SessionName;
		document.getElementById("session-name").innerHTML= sessionName;
		if(sessionData.SessionType === "NEEDS_VERIFICATION" && roleData === "EDITOR") {
			document.getElementById("myTab").innerHTML='<li class="nav-item"><a class="nav-link" id="pending-tab" data-toggle="tab" href="#pending" role="pending" aria-controls="pending" aria-selected="true">Pending</a></li>'+document.getElementById("myTab").innerHTML;
			document.getElementById("pending-tab").addEventListener("click", async function() {
				await render();
				checkPending();
			});
			listOfPendingQuestions=response.data.listOfPendingQuestions;
			setInterval(checkPending, 3000);
		}
		renderLocal();
	})
}

async function renderLocal() {
	const likesUrl='/api/sessions/'+sessionId+'/users/vote';
	const likesPromise = axios(likesUrl);
	const likeList = await likesPromise;

	renderHTML(listOfNewestQuestions, likeList.data.listOfVotedQuestions, 'newest');
	renderHTML(listOfTopFavoriteQuestions, likeList.data.listOfVotedQuestions, 'top10');
	renderHTML(listOfAnsweredQuestions, likeList.data.listOfVotedQuestions, 'answered');
	if(sessionData.SessionType === "NEEDS_VERIFICATION" && roleData === "EDITOR") {
		renderHTML(listOfPendingQuestions, likeData.data.listOfVotedQuestions, 'pending');
	}
}

async function render() {
	const newestUrl='/api/sessions/'+sessionId+'/questions/newest';
	const favoriteUrl='/api/sessions/'+sessionId+'/questions/top';
	const answeredUrl='/api/sessions/'+sessionId+'/questions/answered';
	const likesUrl='/api/sessions/'+sessionId+'/users/vote';
	const newestPromise = axios(newestUrl);
	const favoritePromise = axios(favoriteUrl);
	const answeredPromise = axios(answeredUrl);
	const likesPromise = axios(likesUrl);

	const [newstList, favoriteList, answeredList, likeList] = await axios.all([newestPromise, favoritePromise, answeredPromise, likesPromise]);
	listOfNewestQuestions = newstList.data;
	listOfTopFavoriteQuestions = favoriteList.data;
	listOfAnsweredQuestions = answeredList.data;
	renderLocal();
	// renderHTML(newstList.data, likeList.data.listOfVotedQuestions, 'newest');
	// renderHTML(favoriteList.data, likeList.data.listOfVotedQuestions, 'top10');
	// renderHTML(answeredList.data, likeList.data.listOfVotedQuestions, 'answered');
	if (roleData === "EDITOR") {
		const pendingUrl = '/api/sessions/'+sessionId+'/questions/pending';
		const pendingList = await axios(pendingUrl);
		renderHTML(pendingList.data, likeList.data.listOfVotedQuestions, 'pending');
	}
}

function renderHTML(questionData, likeData, position) {
	// if(position === "answered") {
	// 	console.log(questionData);
	// }
	likeData = likeData.map(like => like.QuestionId);
  let htmlString='';
	questionData.forEach(question => {
		htmlString+= createHtmlForPost(question, likeData.includes(question.QuestionId), position);
	})
	document.getElementById(position).innerHTML=htmlString;
}

function createHtmlForPost(post, isLiked, position) {
  let postString = `
		<div class="question d-flex py-2 w-100" id=${post.QuestionId}>
      <div class="question-info pl-2 flex-grow-1">
        <div class="question-main-info pb-1">
           <div class="row">
            <p class="question-title mb-0 text-justify col-sm-11">${post.Title}</p>
            ${post.VoteByEditor ? '<p class="editor mb-0 ml-auto p-1 text-center col-sm-1">Editor Choice</p>':''}
          </div>
          <p class="question-content mb-0 text-justify" >
            ${post.Content}
          </p>
        </div>
        <div class="question-personal-info mt-1 d-flex">
          <p class="question-likeCount mb-1 px-2"><span class="number">${post.VoteByUser}</span> votes</p>
          <p class="question-author mb-1 pl-2">written by <span class="author">Username ${post.UserId}</span></p>
		      ${(roleData === "USER") ?
		      '':
		      `<div class="ml-auto mb-1">
		      	<button onclick="handlePost(this)" class="btn btn-sm btn-success approveBtn">${sessionData.SessionType==="DEFAULT" || post.Status==="UNANSWERED" ? "Answer":"Approve"}</button>
		      	<button onclick="handlePost(this)" class="btn btn-sm btn-danger removeBtn">Remove</button>
		      </div>`}
        </div>
      </div>
	      ${
	      	!isLiked ?
	      	'<div class="question-icon p-2 m-auto"><i onclick="handleVote(this)" class="far fa-heart"></i></div>'
	      	: '<div class="question-icon p-2 m-auto"><i onclick="handleVote(this)" class="fas fa-heart"></i></div>'
	      }
    </div>`
  return postString;
}

function checkNewest() {
	const newestUrl='/api/sessions/'+sessionId+'/questions/newest';
	axios(newestUrl)
		.then(res => {
			const position = listOfNewestQuestions.length ? res.data.findIndex((q)=> (q.QuestionId === listOfNewestQuestions[0].QuestionId)) : res.data.length;
			if (position>0) {
				document.getElementById("newest-tab").innerHTML = `Newest <span style="background-color:red">${position}</span>`;
			}
			else {
				document.getElementById("newest-tab").innerHTML = `Newest`;
			}
		}
	);
}

function checkPending() {
	const pendingUrl='/api/sessions/'+sessionId+'/questions/pending';
	axios(pendingUrl)
		.then(res => {
			const position = listOfPendingQuestions.length ? res.data.findIndex((q)=> (q.QuestionId === listOfPendingQuestions[0].QuestionId)) : res.data.length;
			if (position>0) {
				document.getElementById("pending-tab").innerHTML = `Pending <span style="background-color:red">${position}</span>`;
			}
			else {
				document.getElementById("pending-tab").innerHTML = `Pending`;
			}
		}
	);
}

function refreshTop10() {
	const favoriteUrl='/api/sessions/'+sessionId+'/questions/top';
	axios(favoriteUrl)
		.then(res => {
			listOfTopFavoriteQuestions = res.data;
			renderLocal();
		})
}

async function handleVote(e) {
  if(e.classList.contains("fas")) {
		unvotePost(e);
  } else {
		votePost(e);
  }
}

function votePost(e) {
  const questionId = e.parentElement.parentElement.id;
  var url= "/api/sessions/"+sessionId+"/questions/"+questionId+"/vote";
  axios.put(url)
  .then(response => {
    if(response.status == 200) {
			render();
    }})
  .catch(error => console.log(error));
}

function unvotePost(e) {
  const questionId = e.parentElement.parentElement.id;
  const url= "/api/sessions/"+sessionId+"/questions/"+questionId+"/vote";
  axios.delete(url)
  .then(response => {
    if(response.status == 200) {
			render();
    }})
  .catch(error => console.log(error));
}

function handlePost(e) {
  const questionId = e.parentElement.parentElement.parentElement.parentElement.id;
	let status;
	if(e.innerHTML === "Remove" || e.innerHTML === "Answer") {
    status = "ANSWERED";
  } else {
    status = "UNANSWERED";
  }
	const url = "/api/sessions/"+sessionId+"/questions/"+questionId+"/status";
	axios.put(url, {
		Status: status
	}).then((response) => {
    // console.log(response);
		render();
  })
}

init();

setInterval(checkNewest, 3000);
setInterval(refreshTop10, 3000);
