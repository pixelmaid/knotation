node.comment = "selector, not necessary";

module.exports = (node, graph) => {

  const triggerIn = node.triggerIn("in");

  const selectMotif = node.in('motif options', 'options', { type: 'dropdown', values: ['chevron', 'arrowhead', 'diamond', 'dovetail'] })
  
  // create output triggers
  const triggerOut0 = node.triggerOut("out0");
  const triggerOut1 = node.triggerOut("out1");
  const triggerOut2 = node.triggerOut("out2");
  const triggerOut3 = node.triggerOut("out3");
  const triggerOut4 = node.triggerOut("out4");

  triggerIn.onTrigger = (props) => {

    const opt = selectMotif.value;

    if (opt === 'chevron') triggerOut0.trigger(props);
    else if (opt === 'arrowhead') triggerOut1.trigger(props);
    else if (opt === 'diamond') triggerOut2.trigger(props);
    else if (opt === 'dovetail') triggerOut3.trigger(props);
    else if (opt === 'heart') triggerOut4.trigger(props);
  };


};