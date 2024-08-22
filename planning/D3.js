const data = {
    name: "Project Name",
    children: 
    [
      {
        name: "Task 1",
        children: [
          { name: "SubTask 1" },
          { name: "SubTask 2" }
        ]
      },
      {
        name: "Task 2",
        children: [
          { name: "SubTask 1" },
          { name: "SubTask 2" }
        ]
      },
    ]
  };
  
  const width = 960;
  const height = 500;
  
  const margin = { top: 20, right: 120, bottom: 20, left: 120 };
  const treeWidth = width - margin.left - margin.right;
  const treeHeight = height - margin.top - margin.bottom;
  
  let i = 0;  // Define 'i' to be used for unique IDs
  
  const svg = d3.select("#tree").append("svg")
      .attr("width", width)
      .attr("height", height)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
  const root = d3.hierarchy(data);
  root.x0 = treeHeight / 2;
  root.y0 = 0;
  
  const treeLayout = d3.tree().size([treeHeight, treeWidth]);
  
  root.children.forEach(collapse);
  
  update(root);
  
  function update(source) {
    const treeData = treeLayout(root);
    const nodes = treeData.descendants();
    const links = treeData.links();
  
    nodes.forEach(d => d.y = d.depth * 180);
  
    const node = svg.selectAll('g.node')
        .data(nodes, d => d.id || (d.id = ++i));  // Use 'i' to assign a unique ID
  
    const nodeEnter = node.enter().append('g')
        .attr('class', 'node')
        .attr("transform", d => `translate(${source.y0},${source.x0})`)
        .on('click', (event, d) => {
            toggle(d);
            update(d);
        });
  
    nodeEnter.append('circle')
        .attr('class', 'node')
        .attr('r', 10)
        .attr('fill', d => d._children ? "lightsteelblue" : "#fff")
        .attr('stroke', d => d._children ? "steelblue" : "lightsteelblue");
  
    nodeEnter.append('text')
        .attr('dy', '.35em')
        .attr('x', d => d.children || d._children ? -13 : 13)
        .attr('text-anchor', d => d.children || d._children ? 'end' : 'start')
        .text(d => d.data.name);
  
    const nodeUpdate = nodeEnter.merge(node);
  
    nodeUpdate.transition()
        .duration(750)
        .attr('transform', d => `translate(${d.y},${d.x})`);
  
    const nodeExit = node.exit().transition()
        .duration(750)
        .attr('transform', d => `translate(${source.y},${source.x})`)
        .remove();
  
    const link = svg.selectAll('path.link')
        .data(links, d => d.target.id);
  
    const linkEnter = link.enter().insert('path', "g")
        .attr("class", "link")
        .attr('d', d => {
            const o = {x: source.x0, y: source.y0};
            return diagonal(o, o);
        });
  
    link.merge(linkEnter).transition()
        .duration(750)
        .attr('d', d => diagonal(d.source, d.target));
  
    link.exit().transition()
        .duration(750)
        .attr('d', d => {
            const o = {x: source.x, y: source.y};
            return diagonal(o, o);
        })
        .remove();
  
    nodes.forEach(d => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  
    function diagonal(s, d) {
      return `M${s.y},${s.x}
              C${(s.y + d.y) / 2},${s.x}
              ${(s.y + d.y) / 2},${d.x}
              ${d.y},${d.x}`;
    }
  }
  
  function collapse(d) {
    if(d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }
  }
  
  function toggle(d) {
    if(d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
  }
  
