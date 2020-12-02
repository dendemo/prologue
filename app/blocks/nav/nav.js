function Navigation({
  navClass,
  navLinkClass,
  navLinkActiveClass  
}) {
  let nav = document.querySelector(navClass),
    offsetY,
    centerY,
    currentActiveLink,
    topmostLink,
    isThrottled = false,
    linkContentEntries = new Map();

  function getIdFromHref(elem) {
    let href = elem.getAttribute('href');
 
    if (!href.startsWith('#')) return false;

    return href.slice(1);
  }

  function getContentBorders(content) {
    //If it's already calculated, there is no need to do it again
    if (!offsetY) offsetY = window.pageYOffset;

    let rect = content.getBoundingClientRect();

    return {
      top: rect.top + offsetY,
      bottom: rect.bottom + offsetY
    }
  }

  function listLinksContent() {
    let links = nav.querySelectorAll(navLinkClass),
      i,
      j;

    for (let link of links) {

      let id = getIdFromHref(link);

      if (!id) continue;

      let content = document.getElementById(id),
        contentBorders = getContentBorders(content);

      //Find and save a link of the topmost content 
      if (!i || top < j) {
        i = link;
        j = contentBorders.top;
      }
      //Save all entries
      linkContentEntries.set(link, {
        'content': content,
        'contentBorders': contentBorders
      });
    }
    //Save topmost link out of scope
    topmostLink = i;
  }

  function getLinkFromPoint() {
    let offsetY = window.pageYOffset;
    //If it's start position, the very fisrt content should be highlighted whether it's at the center or not
    if (!offsetY) return topmostLink;
    //If centerY is already calculated, just get it and find currentCenter taking into account scrolling
    if (!centerY) centerY = window.innerHeight / 2;
    let currentCenterY = offsetY + centerY;
    //Find content that is in the center and return its link
    for (let entry of linkContentEntries) {
      let contentBorders = entry[1].contentBorders;

      if (contentBorders.top <= currentCenterY && contentBorders.bottom >= currentCenterY) return entry[0];
    }
  }

  function highlightLink() {
    let link = getLinkFromPoint();
    //If it's the same content or there is no any content at the point, so do nothing
    if (link == currentActiveLink || !link) return;

    if (currentActiveLink) currentActiveLink.classList.remove(navLinkActiveClass);

    link.classList.add(navLinkActiveClass);
    currentActiveLink = link;
  }
  //Function to decrease event frequency
  function throttleThis(func, ms) {
    if (isThrottled) return;

    func();
    isThrottled = true;

    setTimeout(() => {
      func();
      isThrottled = false;
    }, ms);
  }

  this.init = function() {
    offsetY = centerY = null;

    listLinksContent();
    highlightLink();

    window.addEventListener('scroll', function(e) {

      throttleThis(highlightLink, 100);

    });

    nav.addEventListener('click', function(e) {

      let link = e.target.closest(navLinkClass);

      if (!link) return;

      e.preventDefault();

      let contentObj = linkContentEntries.get(link);

      let content = contentObj.content;

      content.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

export { Navigation as default };