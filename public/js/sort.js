const urlSearchParams = new URLSearchParams(window.location.search);

const li1 = document.getElementById('l1');
const li2 = document.getElementById('l2');
const li3 = document.getElementById('l3');
const li4 = document.getElementById('l4');
const li5 = document.getElementById('l5');

switch (urlSearchParams.get('sort')) {
  case 'old':
    li2.classList.add('current2');
    break;
  case 'new':
    li3.classList.add('current2');
    break;
  case 'views':
    li4.classList.add('current2');
    break;
  case 'comments_count':
    li5.classList.add('current2');
    break;
  default:
    li1.classList.add('current2');
    break;
}

window.onload = function () {
  if (
    window.location.href.split('?').includes('sort') &&
    !window.location.href.split('?')[1].split('=').includes('sort')
  ) {
    sessionStorage.setItem('selectedOption', 'Top');
  }

  const selectEle = document.getElementById('sortingPosts');
  selectEle.value = sessionStorage.getItem('selectedOption');
};
