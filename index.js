/* globals d3 */

let tools = [
  'origraph',
  'gephi',
  'cytoscape',
  'tulip',
  'yFiles',
  'graphiti',
  'orion',
  'ploceus'
];
let operations = [
  'connect',
  'group_ungroup',
  'pop_in_out',
  'pipe',
  'dissolve_combine',
  'toggle_node_edge_status',
  'toggle_direction',
  'kevin_bacon',
  'attribute_editing'
];
let levels = [
  'instance',
  'schema'
];

let images = null;

async function getImages () {
  const urls = [];
  const promises = [];
  tools.forEach(tool => {
    operations.forEach(op => {
      levels.forEach(level => {
        let url = `${tool}/${op}/${level}.gif`;
        urls.push(url);
        promises.push(d3.image(url)
          .catch(() => { return Promise.resolve(null); }));
      });
    });
  });
  return (await Promise.all(promises)).reduce((agg, img, index) => {
    agg[urls[index]] = img;
    return agg;
  }, {});
}

async function drawTable () {
  images = images || await getImages();

  let colHeaders = d3.select('thead > tr').selectAll('th')
    .data([null, null].concat(tools));
  colHeaders.exit().remove();
  let colHeadersEnter = colHeaders.enter().append('th');
  colHeaders = colHeadersEnter.merge(colHeaders);
  colHeadersEnter.append('div').append('span');
  colHeaders.select('span').text(d => d || '');

  let rowData = operations.reduce((agg, op) => {
    return agg.concat(levels.map(level => {
      return { op, level };
    }));
  }, []);

  let rows = d3.select('tbody').selectAll('tr')
    .data(rowData);
  rows.exit().remove();
  let rowsEnter = rows.enter().append('tr');
  rows = rows.merge(rowsEnter);

  let cells = rows.selectAll('td')
    .data((d, i) => {
      let row = [];
      if (i % 2 === 0) {
        // Only add the op to the first row
        row.push({
          text: d.op,
          className: 'opHeader',
          rowspan: 2
        });
      }
      row.push({
        text: d.level,
        className: 'levelHeader'
      });
      return row.concat(tools.map(tool => {
        let url = `${tool}/${d.op}/${d.level}.gif`;
        if (images[url]) {
          return { image: images[url], className: 'supported' };
        } else {
          return { className: 'notSupported' };
        }
      }));
    });
  cells.exit().remove();
  let cellsEnter = cells.enter().append('td');
  cells = cells.merge(cellsEnter);

  cells.text(d => d.text)
    .attr('rowspan', d => d.rowspan || null)
    .attr('class', d => d.className)
    .on('mouseover', d => {
      if (d.image) {
        d3.select('#preview').node().appendChild(d.image);
      } else {
        d3.select('#preview').html('<h1>(operation not supported)</h1>');
      }
    });
}

window.onload = window.onresize = drawTable;
