/* globals d3 */

let tools = [
  'gephi',
  'cytoscape',
  'tulip',
  'yFiles',
  'graphiti',
  'orion',
  'ploceus',
  'origraph'
];
let operations = [
  'custom_styling',
  'attribute_editing',
  'connect',
  'toggle_node_edge_status',
  'toggle_direction',
  'group_ungroup',
  'pop_in_out',
  'pipe',
  'dissolve_combine',
  'kevin_bacon'
];
let levels = [
  'instance',
  'bulk'
];

let pages = null;

async function getPages () {
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
  const result = {};
  for (let i = 0; i < promises.length; i++) {
    result[urls[i]] = await promises[i];
    d3.select('#progressBar').style('width', 100 * (i / promises.length) + 'px');
  }
  d3.select('#loader').remove();
  return result;
}

async function drawTable () {
  pages = pages || await getPages();

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
        if (pages[url]) {
          return { page: pages[url], className: 'supported' };
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
    .classed('selected', false)
    .on('click', function (d) {
      d3.selectAll('.selected').classed('selected', false);
      d3.select(this).classed('selected', true);
      d3.select('#preview').html('');
      if (d.page) {
        d3.select('#preview').node().appendChild(d.page);
      } else {
        d3.select('#preview').html('<h1>(operation not supported)</h1>');
      }
    });
}

window.onload = window.onresize = drawTable;
