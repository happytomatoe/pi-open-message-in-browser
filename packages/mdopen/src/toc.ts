export const TOC_SCRIPT = `
(function() {
  const tocContainer = document.getElementById('_toc');
  if (!tocContainer) return;

  const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  if (headings.length === 0) {
    tocContainer.style.display = 'none';
    return;
  }

  const rootUl = document.createElement('ul');
  rootUl.className = '_ul';
  const stack = [{ level: 0, element: rootUl }];

  headings.forEach(heading => {
    const level = parseInt(heading.tagName.substring(1));
    const text = heading.textContent;
    const id = heading.id;

    while (stack.length > 1 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }

    const parent = stack[stack.length - 1].element;
    let currentUl = parent;

    if (parent.tagName !== 'UL') {
      currentUl = document.createElement('ul');
      currentUl.className = '_ul';
      parent.appendChild(currentUl);
    }

    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#' + id;
    a.innerText = text;
    li.appendChild(a);
    currentUl.appendChild(li);

    stack.push({ level: level, element: li });
  });

  tocContainer.appendChild(rootUl);
})();
`;
