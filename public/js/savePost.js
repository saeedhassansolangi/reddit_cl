const savePost = function (event) {
  event.preventDefault();
  const postId = event.target.dataset.postid;
  makeRequestToServer('POST', postId, '/save', (m) => {
    const savedPostAnchor = document.querySelector(`#post-${postId}-save`);
    savedPostAnchor.parentElement.innerHTML = `<a href="#" id="post-${postId}-unsave" data-postId="${postId}" onclick="unSavePost(event)" class="savedBtn">Unsave
    </a>`;
    savedPostAnchor.remove();
  });
};

const unSavePost = function (event) {
  event.preventDefault();
  const postId = event.target.dataset.postid;
  makeRequestToServer('DELETE', postId, '/unsave', (m) => {
    const unSavedPostAnchor = document.querySelector(`#post-${postId}-unsave`);
    unSavedPostAnchor.parentElement.innerHTML = `<a href="#" id="post-${postId}-save" data-postId="${postId}" onclick="savePost(event)">Save
    </a>`;
    unSavedPostAnchor.remove();
  });

  const url = window.location.pathname;
  if (url.split('/')[3] === 'saved_posts') {
    document.querySelector(`#posts-${postId}`).style.opacity = '0.5';
    setTimeout(function () {
      document.querySelector(`#posts-${postId}`).remove();
    }, 2500);
  }
};

const deletePost = function (event) {
  event.preventDefault();
  const postId = event.target.dataset.postid;
  if (confirm('Are you sure you want to delete post ?')) {
    makeRequestToServer('DELETE', postId, '/delete', (m) => {
      document.querySelector(`#posts-${postId}`).style.opacity = '0.5';
      setTimeout(function () {
        document.querySelector(`#posts-${postId}`).remove();
      }, 2500);
    });
  }
};

const makeRequestToServer = (rqMethod, postId, endpoint, cb) => {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      cb(xhr.responseText);
    }
  };

  xhr.open(rqMethod, '/posts/' + postId + endpoint, true);
  xhr.setRequestHeader('Content-type', 'application/json');
  xhr.send();
};
