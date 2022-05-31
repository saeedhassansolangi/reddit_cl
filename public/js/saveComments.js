// save post
const saveComment = function (event) {
  event.preventDefault();
  const { postId, commentId } = event.target.dataset;
  serverRequest('POST', postId, commentId, '/save', (m) => {
    const savedComment = document.querySelector(`#comment-${commentId}-save`);
    savedComment.parentElement.innerHTML = `<a data-comment-id="${commentId}"
    data-post-id="${postId}" id="comment-${commentId}-unsave" style="color: rgb(144, 144, 228); font-size: 12px" class="comment-indent comment-ex" onclick="unsaveComment(event)" >
    Unsave
    </a>`;
    savedComment.remove();
  });
};

// unsave post
const unsaveComment = function (event) {
  event.preventDefault();
  const { postId, commentId } = event.target.dataset;
  serverRequest('DELETE', postId, commentId, '/unsave', (m) => {
    const unSavedComment = document.querySelector(
      `#comment-${commentId}-unsave`
    );
    unSavedComment.parentElement.innerHTML = `<a
      data-comment-id="${commentId}"
      data-post-id="${postId}"
      id="comment-${commentId}-save"
      style="color: rgb(144, 144, 228); font-size: 12px"
      class="comment-indent comment-ex"
      onclick="saveComment(event)"
      >Save</a
    >`;
    unSavedComment.remove();
  });
};

// delete post
const deleteComment = function (event) {
  event.preventDefault();
  const { postId, commentId } = event.target.dataset;
  if (confirm('Are you sure you want to delete Comment ?')) {
    serverRequest('DELETE', postId, commentId, '/delete', (m) => {
      console.log(m);
      document.querySelector(`#comment-${commentId}`).style.opacity = '0.5';
      setTimeout(function () {
        document.querySelector(`#comment-${commentId}`).remove();
      }, 2500);
    });
  }
};

const serverRequest = (rqMethod, postId, commentId, endpoint, next) => {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      next(xhr.responseText);
    }
  };

  xhr.open(
    rqMethod,
    '/posts/' + postId + '/comment/' + commentId + endpoint,
    true
  );
  xhr.setRequestHeader('Content-type', 'application/json');
  xhr.send();
};
