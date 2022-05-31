const socket = io();

const upvote = function (event) {
  event.preventDefault();
  const postId = event.currentTarget.dataset.postid;
  const action = event.currentTarget.textContent.trim();
  const actionType = 'upvote';
  makeRequest(postId, action, actionType, (data) => {
    console.log(data);
  });
};

const downvote = function (event) {
  event.preventDefault();
  const postId = event.currentTarget.dataset.postid;
  const action = event.currentTarget.textContent.trim();
  const actionType = 'downvote';
  makeRequest(postId, action, actionType, (data) => {
    console.log(data);
  });
};

const makeRequest = (postId, action, actionType, cb) => {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      cb(xhr.responseText);
    }
  };

  xhr.open('POST', '/posts/' + postId + '/' + actionType, true);
  xhr.setRequestHeader('Content-type', 'application/json');
  xhr.send(JSON.stringify({ action }));
};

socket.on('postAction', function (e) {
  document.querySelector('#upvotes-count-' + e.postId).innerText = e.voteScore;
  changeColor(e);
});

const changeColor = ({ postId, message }) => {
  const voteCount = document.querySelector('#upvotes-count-' + postId);
  const upVoteIcon = document.querySelector('.upvotess-' + postId);
  const downVoteIcon = document.querySelector('.downvotess-' + postId);

  switch (message) {
    case 'upvoted&NowDownvoted':
      voteCount.style.color = '#719BFF';
      upVoteIcon.children[0].style.color = '#000';
      downVoteIcon.children[0].style.color = '#719BFF';
      break;
    case 'newUser&Downvoted':
      voteCount.style.color = '#719BFF';
      downVoteIcon.children[0].style.color = '#719BFF';
      break;
    case 'newUser&removedDownvoted':
      voteCount.style.color = 'gray';
      downVoteIcon.children[0].style.color = '#000';
      break;
    case 'downvoted&NowUpvoted':
      voteCount.style.color = '#FF1800';
      upVoteIcon.children[0].style.color = '#FF1800';
      downVoteIcon.children[0].style.color = '#000';
      break;
    case 'newUser&Upvoted':
      voteCount.style.color = '#FF1800';
      upVoteIcon.children[0].style.color = '#FF1800';
      break;
    case 'newUser&removedUpvoted':
      voteCount.style.color = 'gray';
      upVoteIcon.children[0].style.color = '#000';
    default:
      break;
  }
};
