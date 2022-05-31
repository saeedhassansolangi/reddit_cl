const searchInput = document.querySelector('#search');
const submitButton = document.querySelector('#submit');

searchInput.addEventListener('input', function (e) {
  var currentFocus;

  if (!this.value) {
    closeAllLists();
    return;
  }

  currentFocus = -1;
  closeAllLists();

  const parentDiv = document.createElement('div');
  parentDiv.setAttribute('id', this.id + 'autocomplete-list');
  parentDiv.setAttribute('class', 'autocomplete-items');
  searchInput.parentNode.appendChild(parentDiv);

  let currentValue = this.value;

  fetchDataFromDatabase(this.value, function (value) {
    if (JSON.parse(value).length === 0) {
      let item = document.createElement('div');
      item.innerHTML = `<span>No result found for  <strong>"${currentValue}"</strong> </span>`;
      parentDiv.append(item);
      return;
    }

    JSON.parse(value).forEach(function (subreddit) {
      let item = document.createElement('div');

      item.innerHTML = `
      <span>
        <img src='${subreddit.subredditProfile}' style="width:20px; border-radius:5px" id="main" />
        <span id="searched-results"> r/${subreddit.subredditName} </span>
      </span>
      `;

      item.innerHTML +=
        "<input type='hidden' value='" + subreddit.subredditName + "'>";

      item.addEventListener('click', function (e) {
        searchInput.value = this.getElementsByTagName('input')[0].value;
        closeAllLists();
      });

      parentDiv.append(item);
    });
  });

  document.addEventListener('click', function (e) {
    closeAllLists(e.target);
  });

  function fetchDataFromDatabase(value, callback) {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState == XMLHttpRequest.DONE) {
        callback(xhr.responseText);
      }
    };

    const url = xhr.open('GET', '/posts/searchPosts/' + value, true);
    xhr.send(null);
    DIV;
  }

  searchInput.addEventListener('keydown', function (e) {
    var x = document.getElementById(this.id + 'autocomplete-list');
    if (x) x = x.getElementsByTagName('div');
    if (e.keyCode == 40) {
      currentFocus++;
      addActive(x);
    } else if (e.keyCode == 38) {
      currentFocus--;
      addActive(x);
    } else if (e.keyCode == 13) {
      e.preventDefault();
      if (currentFocus > -1) {
        if (x) x[currentFocus].click();
      }
    }
  });

  function addActive(x) {
    if (!x) return false;
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = x.length - 1;
    x[currentFocus].classList.add('autocomplete-active');
  }
  function removeActive(x) {
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove('autocomplete-active');
    }
  }

  function closeAllLists(elmnt) {
    const items = document.getElementsByClassName('autocomplete-items');
    for (let i = 0; i < items.length; i++) {
      if (elmnt != items[i] && elmnt != searchInput) {
        items[i].parentNode.removeChild(items[i]);
      }
    }
  }
});

const dropDownSubreddits = function () {
  const subredditsss = document.querySelector('.subredditss');
  makeRequestForSubreddits('GET', '/subreddits/all', (subreddits) => {
    subreddits.forEach((sub) => {
      const option = document.createElement('option');
      option.classList.add('list-group-item');
      option.setAttribute('value', sub.subredditName);
      option.innerText = `r/${sub.subredditName}`;
      subredditsss.appendChild(option);
    });
  });
};

const makeRequestForSubreddits = function (requestMethod, path, cb) {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      const subreddits = JSON.parse(xhr.responseText);
      cb(subreddits);
    }
  };

  const url = xhr.open(requestMethod, path, true);
  xhr.send(null);
};

window.addEventListener('load', (e) => {
  dropDownSubreddits();
});

function navigateToPost(e) {
  const postId = e.dataset.postid;
  if (!postId) {
    window.location = '/posts/';
  }

  window.location = `/posts/${postId}`;
}

const imgs = document.querySelectorAll('img');
imgs.forEach((img) => {
  if (img.classList) {
    img.classList.add('gingham');
  } else {
    img.className += 'gingham';
  }
});
