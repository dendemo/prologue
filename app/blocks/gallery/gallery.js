function Gallery({
  container,
  item
}) {

  let buffer = [
      []
    ],
    array = [],
    allSumHeight = 0,
    mean,
    optimalHeight;

  const flexParent = document.querySelector(container),
    items = flexParent.querySelectorAll(item);

  function resetHeight() {
    for (item of items) {
      item.style.height = '';
    }
  }

  function setItemsRect(columns, innerWidth) {
    //Reset heights before changing number of columns
    resetHeight();

    for (let item of items) {
      //Get full height of flex element
      let itemStyles = getComputedStyle(item),
        verticalMargins = parseFloat(itemStyles.marginTop) + parseFloat(itemStyles.marginBottom),
        itemHeight = item.offsetHeight,
        height = (itemHeight + verticalMargins);

      allSumHeight += height;
      array.push(height);
      //Set height of flex element(because images at the start of rendering and at the end differ by 2px)
      item.style.height = `${itemHeight}px`;
    }
  }

  function getMean(columns) {
    mean = allSumHeight / columns;
  }

  function getLastArray() {
    return buffer[buffer.length - 1];
  }

  function addNewArray() {
    let lastArr = getLastArray(),
      copy = lastArr.slice();

    buffer.push(copy);
  }

  function saveEntries(sum, colIndex) {
    let lastArr = getLastArray(),
      entry = {
        'sum': sum,
        'colIndex': colIndex
      };

    let i = lastArr.findIndex(item => {
      return item.colIndex == colIndex;
    });

    if (~i) {
      lastArr[i] = entry;
      return;
    }

    lastArr.push(entry);
  }
  //Get all possible options how to fit flex boxes
  function findEntries(colIndex, index = 0) {
    let sum = 0;

    while (index < array.length) {
      sum += array[index];
      index++;

      if (sum > mean && colIndex > 1) {
        colIndex--;


        saveEntries(sum, colIndex);
        findEntries(colIndex, index);

        index--;
        sum -= array[index];

        saveEntries(sum, colIndex);
        findEntries(colIndex, index);

        if (sum == mean) {
          index--;
          sum -= array[index];

          saveEntries(sum, colIndex);
          findEntries(colIndex, index);
        }

        return;
      }

      if (index == array.length) {
        colIndex--;

        saveEntries(sum, colIndex);
        addNewArray();

        return;
      }
    }
  }
  //Find optimal option how to set flex boxes
  function findOptimal() {

    let prop = [];

    buffer.forEach(item => {
      let max = item.reduce((a, b) => {
        return a.sum > b.sum ? a : b;
      });

      prop.push(max.sum);
    })

    optimalHeight = Math.min(...prop);
  }

  this.init = function(columns) {
    const innerWidth = window.innerWidth;

    setItemsRect(columns, innerWidth);
    getMean(columns);
    findEntries(columns);
    findOptimal();
    //Set height of flex container
    flexParent.style.height = `${optimalHeight}px`;

    //Reset all stuff so as to call init again in case resizing window or adding new flex-item
    buffer = [
        []
      ],
      array = [],
      allSumHeight = 0,
      mean = 0,
      optimalHeight = 0;
  }
}

export { Gallery as default };